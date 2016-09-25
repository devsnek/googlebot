const rightpad = (v, n, c = '0') => String(v).length >= n ? '' + v : String(v) + String(c).repeat(n - String(v).length);
const shuffle = (a) => {for(var c,d,b=a.length;b;)d=Math.floor(Math.random()*b--),c=a[b],a[b]=a[d],a[d]=c;return a} // eslint-disable-line

const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const Ratelimits = require('./ratelimits');
const r = require('rethinkdb');
const chalk = require('chalk');

var bot = new Discord.Client({
  autoReconnect: true,
  maxCachedMessages: 1
  // api_request_method: 'burst'
});

process.send({type: 'alive', id: bot.options.shard_id, content: bot.options.shard_id});

// there are those that would say extending the client like this is bad. those people are 100% correct.

bot.sendIpc = (t, c) => {
  if (!process.connected) process.exit(1);
  process.send({type: t, id: bot.options.shard_id, content: c});
};

bot.log = function () { // needs to be es5 function for dat ...arguments
  console.log(chalk.green(`⚙  SHARD ${bot.options.shard_id}:`), ...arguments);
};

bot.error = function () {
  console.log(chalk.bgRed.white(`🔥  SHARD ${bot.options.shard_id}:`), ...arguments);
}

var rl = new Ratelimits(bot);

var settings = {};

process.on('message', msg => {
  if (msg.type === 'serverCount') {
    settings.serverCount = msg.content;
  } else if (msg.type === 'userCount') {
    settings.userCount = msg.content;
  } else if (msg.type === 'channelCount') {
    settings.channelCount = msg.content;
  }
});

settings.config = require('./config.json');

r.connect({host: settings.config.rethink, port: settings.config.rethinkport}, (err, conn) => {
  if (err) console.error('DB ERROR:', err);
  settings.dbconn = conn;
});

settings.OWNERID = '173547401905176585';
settings.PREFIX = 'ok google';

settings.startuptime = new Date() / 1000;

settings.KEYS = fs.readFileSync('keys.txt').toString().split('\n');
settings.KEYS.splice(-1, 1);

settings.KEYS = shuffle(settings.KEYS);

settings.lastKey = 0;

settings.cacheTime = 21600000;

settings.commands = {};

settings.toBeDeleted = new Map();

var commands = settings.commands;

// this command makes help
commands.help = {
  main: (bot, msg, settings) => {
    var catagories = [];
    var final = '';
    Object.keys(settings.commands).forEach(k => {
      var c = settings.commands[k];
      if (c.hide) return;
      if (!catagories.includes(c.catagory)) catagories.push({name: c.catagory, commands: []});
      catagories.find(catagory => catagory.name === c.catagory).commands.push({help: c.help, args: c.args, name: k})
    });
    catagories.sort((a, b) => a.name > b.name).forEach(c => {
      if (c.commands.length < 1) return;
      final += ` ${c.name}:\n`;
      c.commands.sort((a, b) => a.name > b.name).map(cmd => {
        final += `  ${rightpad(cmd.name + ' ' + cmd.args, 38, ' ')} ${cmd.help}\n`;
      });
      final += '\n';
    });
    fs.readFile('./help.txt', 'utf8', (err, data) => {
      if (err) return bot.error(err);
      msg.author.sendMessage(data.replace('{{help_text}}', final)).catch(err => bot.error(err));
      msg.channel.sendMessage('Help has been sent!');
    })
  },
  help: 'Shows this message.',
  args: '',
  catagory: 'util'
};

commands.load = {
  main: (bot, msg) => {
    if (msg.author.id !== settings.OWNERID) return;
    var args = msg.content;
    try {
      delete commands[args];
      delete require.cache[path.join(__dirname, 'commands', args + '.js')];
      commands[args] = require(path.join(__dirname, 'commands', args + '.js'));
      msg.channel.sendMessage('Loaded', args);
    } catch (err) {
      msg.channel.sendMessage('Command not found or error loading\n`' + err.message + '`');
    }
  },
  hide: true
}

commands.unload = {
  main: (bot, msg) => {
    if (msg.author.id !== settings.OWNERID) return;
    var args = msg.content;
    try {
      delete commands[args];
      delete require.cache[path.join(__dirname, 'commands', args + '.js')];
      msg.channel.sendMessage('Unloaded', args);
    } catch (err) {
      msg.channel.sendMessage('Command not found or error unloading\n`' + err.message + '`');
    }
  },
  hide: true
}

commands.reload = {
  main: (bot, msg) => {
    if (msg.author.id !== settings.OWNERID) return;
    var args = msg.content;
    try {
      delete commands[args];
      delete require.cache[path.join(__dirname, 'commands', args + '.js')]; // this is the important part here, since require caches files, reloading would do nothing if we didn't clear it
      commands[args] = require(path.join(__dirname, 'commands', args + '.js'));
      msg.channel.sendMessage('Reloaded', args);
    } catch (err) {
      msg.channel.sendMessage('Command not found or error reloading\n`' + err.message + '`');
    }
  },
  hide: true
}

commands.servers = {
  main: (bot, msg, settings) => {
    msg.channel.sendMessage(settings.serverCount);
  },
  hide: true
}

const loadCommands = () => {
  var files = fs.readdirSync(path.join(__dirname, 'commands'));
  for (let file of files) {
    if (file.endsWith('.js')) {
      commands[file.slice(0, -3)] = require(path.join(__dirname, 'commands', file));
    }
  }
  bot.log('———— All Commands Loaded! ————');
}

const checkCommand = (msg, length, bot) => {
  try {
    if (rl.changeCommand(msg, true)) {
      if (msg.content.split(' ').length) {
        msg.content = msg.content.split(' ').slice(length);
        var original = msg.content.join(' ');
        var command = msg.content.shift();
        msg.content = msg.content.join(' ');
        try {
          commands[command].main(bot, msg, settings);
        } catch (err) {
          if (msg.content.split(' ').length) {
            msg.content = original;
            commands['search'].main(bot, msg, settings);
          }
        }
      }
    }
  } catch (err) {
    bot.error(err.message);
  }
}

bot.on('ready', () => {
  bot.log(`READY! Serving in ${bot.channels.size} channels and ${bot.guilds.size} servers`);
  bot.user.setStatus('online', {name: 'ok google, help'});
  loadCommands();
  rl.onReady();
  bot.sendIpc('_ready');
  bot.sendIpc('fetchServerCount', bot.guilds.size);
  bot.sendIpc('fetchChannelCount', bot.channels.size);
  bot.sendIpc('fetchUserCount', bot.users.size);
});

bot.on('message', msg => {
  if (msg.channel.type === 'dm' && msg.author.id !== '173547401905176585') return;
  if (msg.author.bot) return;
  if (msg.content.startsWith('<@' + bot.user.id + '>') || msg.content.startsWith('<@!' + bot.user.id + '>')) {
    checkCommand(msg, 1, bot);
  } else if (msg.content.toLowerCase().startsWith(settings.PREFIX)) {
    checkCommand(msg, settings.PREFIX.split(' ').length, bot);
  }
});

bot.on('messageDelete', msg => {
  try {
    if (settings.toBeDeleted.get(msg.id)) {
      msg.channel.messages.get(settings.toBeDeleted.get(msg.id)).delete().then(() => {
        settings.toBeDeleted.delete(msg.id);
      });
    }
  } catch (err) {
    bot.error(err);
  }
});

bot.on('error', err => {
  bot.error('————— BIG ERROR —————');
  bot.error(err);
  bot.error('——— END BIG ERROR ———');
});

bot.on('disconnect', () => {
  // alert the console
  bot.log('Disconnected!');
  rl.onDisconnect();
});

bot.on('guildCreate', server => {
  bot.log('SERVER GET:', server.name, server.id, bot.options.shard_id);
  r.db('google').table('servers').get(server.id).run(settings.dbconn, (err, res) => {
    if (err) return console.log(err);
    if (res === null) {
      fs.readFile('./welcome.txt', 'utf8', function (err, data) {
        if (err) {
          return bot.log(err);
        }
        server.channels.get(server.id).sendMessage('<@' + server.owner.id + '> ' + data);
        r.db('google').table('servers').insert({id: server.id, name: server.name, nsfw: '2', nick: 'Google'}).run(settings.dbconn);
      });
    }
  });
  bot.sendIpc('fetchServerCount', bot.guilds.size);
});

bot.on('guildDelete', server => {
  bot.log('SERVER LOST:', server.name, server.id, bot.options.shard_id);
  bot.sendIpc('fetchServerCount', bot.guilds.size);
});

bot.on('channelCreate', channel => {
  bot.sendIpc('fetchChannelCount', bot.channels.size)
})

bot.on('channelDelete', channel => {
  bot.sendIpc('fetchChannelCount', bot.channels.size)
})

bot.login(settings.config.token);

process.on('SIGHUP', () => {
  process.exit(0);
});
