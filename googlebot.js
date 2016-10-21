#!/usr/bin/env node --harmony

const rightpad = (v, n, c = '0') => String(v).length >= n ? '' + v : String(v) + String(c).repeat(n - String(v).length);
const shuffle = (a) => {for(let c,d,b=a.length;b;)d=Math.floor(Math.random()*b--),c=a[b],a[b]=a[d],a[d]=c;return a} // eslint-disable-line

const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');
const Ratelimits = require('./ratelimits');
const r = require('rethinkdb');
const chalk = require('chalk');

if (!process.send) process.send = () => {};

const client = new Discord.Client({
  autoReconnect: true,
  messageCacheMaxSize: 1,
  // api_request_method: 'burst'
  disabledEvents: ['PRESENCE_UPDATE', 'TYPING_START', 'TYPING_STOP', 'VOICE_STATE_UPDATE', 'FRIEND_ADD', 'FRIEND_REMOVE']
});

process.send({type: 'alive', id: client.options.shard_id, content: client.options.shard_id});

// there are those that would say extending the client like this is bad. those people are 100% correct.

client.sendIpc = (t, c) => {
  if (!process.connected) process.exit(1);
  process.send({type: t, id: client.shard.id, content: c});
};

client.log = function () { // needs to be es5 function for dat ...arguments
  console.log(chalk.green(`⚙  SHARD ${client.shard.id + 1}:`), ...arguments);
};

client.error = function () {
  console.log(chalk.bgRed.white(`🔥  SHARD ${client.shard.id}:`), ...arguments);
}

const rl = new Ratelimits(client);

const settings = {};

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

settings.rethink = id => {
  return require('./util/RethinkPromises')(id, settings.dbconn);
}

settings.KEYS = fs.readFileSync('keys.txt').toString().split('\n');
settings.KEYS.splice(-1, 1);

settings.KEYS = shuffle(settings.KEYS);

settings.lastKey = 0;

settings.cacheTime = 21600000;

settings.commands = {};

settings.toBeDeleted = new Map();

let commands = settings.commands;

// this command makes help
commands.help = {
  main: async (client, msg, settings) => {
    const catagories = [];
    let final = '';
    Object.keys(settings.commands).forEach(k => {
      const c = settings.commands[k];
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
      if (err) return client.error(err);
      data = data.replace('{{servers}}', Math.round(settings.serverCount / 500) * 500).replace('{{help_text}}', final);
      msg.author.sendMessage(data).catch(err => client.error(err));
      msg.channel.sendMessage('Help has been sent!');
    })
  },
  help: 'Shows this message.',
  args: '',
  catagory: 'util'
};

commands.load = {
  main: async (client, msg) => {
    if (msg.author.id !== settings.OWNERID) return;
    const args = msg.content;
    try {
      delete commands[args];
      delete require.cache[path.join(__dirname, 'commands', args + '.js')];
      commands[args] = require(path.join(__dirname, 'commands', args + '.js'));
      msg.channel.sendMessage('Loaded', args);
      require('./generatehelp')()
    } catch (err) {
      msg.channel.sendMessage('Command not found or error loading\n`' + err.message + '`');
    }
  },
  hide: true
}

commands.unload = {
  main: async (client, msg) => {
    if (msg.author.id !== settings.OWNERID) return;
    const args = msg.content;
    try {
      delete commands[args];
      delete require.cache[path.join(__dirname, 'commands', args + '.js')];
      msg.channel.sendMessage('Unloaded', args);
      require('./generatehelp')()
    } catch (err) {
      msg.channel.sendMessage('Command not found or error unloading\n`' + err.message + '`');
    }
  },
  hide: true
}

commands.reload = {
  main: async (client, msg) => {
    if (msg.author.id !== settings.OWNERID) return;
    const args = msg.content;
    try {
      delete commands[args];
      delete require.cache[path.join(__dirname, 'commands', args + '.js')];
      commands[args] = require(path.join(__dirname, 'commands', args + '.js'));
      msg.channel.sendMessage('Reloaded', args);
      require('./generatehelp')()
    } catch (err) {
      msg.channel.sendMessage('Command not found or error reloading\n`' + err.message + '`');
    }
  },
  hide: true
}

const loadCommands = () => {
  const files = fs.readdirSync(path.join(__dirname, 'commands'));
  for (let file of files) {
    if (file.endsWith('.js')) {
      commands[file.slice(0, -3)] = require(path.join(__dirname, 'commands', file));
    }
  }
  client.log('———— All Commands Loaded! ————');
}

const checkCommand = (msg, length) => {
  try {
    if (rl.changeCommand(msg, true)) {
      if (msg.content.split(' ').length) {
        msg.content = msg.content.split(' ').slice(length);
        const original = msg.content.join(' ');
        const command = msg.content.shift();
        msg.content = msg.content.join(' ');
        try {
          commands[command].main(client, msg, settings);
        } catch (err) {
          client.error(`ERROR RUNNING COMMAND ${command} FALLING BACK TO SEARCH`);
          if (msg.content.split(' ').length) {
            msg.content = original;
            commands['search'].main(client, msg, settings);
          }
        }
      }
    }
  } catch (err) {
    client.error(err.message);
  }
}

client.on('ready', () => {
  if (client.shard.id === 0) require('./generatehelp')();
  client.log(`READY! Serving in ${client.channels.size} channels and ${client.guilds.size} servers`);
  client.user.setGame('ok google, help');
  loadCommands();
  rl.onReady();
  client.sendIpc('_ready');
  client.sendIpc('fetchServerCount', client.guilds.size);
  client.sendIpc('fetchChannelCount', client.channels.size);
  client.sendIpc('fetchUserCount', client.guilds.map(g => g.memberCount).reduce((a, b) => a + b));
  client.sendIpc('serverMap', client.guilds.array().map(s => s.id));
});

client.on('message', async msg => {
  if (msg.channel.type === 'dm' && msg.author.id !== settings.OWNERID) return;
  client.sendIpc('_message', {id: msg.id, content: msg.content});
  if (msg.author.bot) return;
  if (msg.content.startsWith('<@' + client.user.id + '>') || msg.content.startsWith('<@!' + client.user.id + '>')) {
    checkCommand(msg, 1, client);
  } else if (msg.content.toLowerCase().startsWith(settings.PREFIX)) {
    checkCommand(msg, settings.PREFIX.split(' ').length);
  } else {
    const guild = await settings.rethink(msg.guild.id);
    if (guild === null) return;
    if (!guild.settings) return;
    if (!guild.settings.prefix) return;
    if (msg.content.startsWith(guild.settings.prefix)) {
      checkCommand(msg, guild.settings.prefix.split(' ').length);
    }
  }
});

client.on('messageDelete', msg => {
  try {
    if (settings.toBeDeleted.get(msg.id)) {
      msg.channel.messages.get(settings.toBeDeleted.get(msg.id)).delete().then(() => {
        settings.toBeDeleted.delete(msg.id);
      });
    }
  } catch (err) {
    client.error(err);
  }
});

client.on('error', err => {
  client.error('————— BIG ERROR —————');
  client.error(err);
  client.error('——— END BIG ERROR ———');
});

client.on('disconnect', () => {
  // alert the console
  client.log('Disconnected!');
  rl.onDisconnect();
});

client.on('guildCreate', guild => {
  client.log('SERVER GET:', guild.name, guild.id, client.options.shard_id);
  r.db('google').table('servers').get(guild.id).run(settings.dbconn, (err, res) => {
    if (err) return console.log(err);
    if (res === null) {
      let data = fs.readFileSync('./welcome.txt', 'utf8')
      guild.defaultChannel.sendMessage(`${guild.owner} ${data}`);
      r.db('google').table('servers').insert({id: guild.id, name: guild.name, nsfw: '2', nick: 'Google'}).run(settings.dbconn);
    }
  });
  client.sendIpc('fetchServerCount', client.guilds.size);
});

client.on('guildDelete', guild => {
  client.log('SERVER LOST:', guild.name, guild.id, client.options.shard_id);
  client.sendIpc('fetchServerCount', client.guilds.size);
});

client.on('channelCreate', channel => {
  client.sendIpc('fetchChannelCount', client.channels.size)
})

client.on('channelDelete', channel => {
  client.sendIpc('fetchChannelCount', client.channels.size)
})

client.login(settings.config.token);

process.on('SIGHUP', () => {
  process.exit(0);
});

process.on('unhandledRejection', reason => {
  client.error('UNHANDLED REJECTION', reason);
});
