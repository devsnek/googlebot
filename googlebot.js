'use strict';

String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ");}; // i would never use a nodejs package for this ;)
function shuffle(a){for(var c,d,b=a.length;b;)d=Math.floor(Math.random()*b--),c=a[b],a[b]=a[d],a[d]=c;return a}

const Discord = require("discord.js");
const fs = require('fs');
const Ratelimits = require('./ratelimits');
const r = require('rethinkdb');
const os = require('os');

const chalk = require('chalk');
const unirest = require('unirest');

var bot = new Discord.Client({
  autoReconnect: true,
  shard_count: parseInt(process.env.shard_count),
  shard_id: parseInt(process.env.shard_id),
  maxCachedMessages: 1
});

process.send({type: 'alive', id: bot.options.shard_id, content: bot.options.shard_id});

// there are those that would say extending the client like this is bad. those people are 100% correct.

bot.sendIpc = function(t, c) {
  if (!process.connected) process.exit(1);
  process.send({type: t, id: bot.options.shard_id, content: c});
};

bot.log = function() {
  console.log(chalk.green(`⚙  SHARD ${bot.options.shard_id}:`), ...arguments);
};

bot.error = function() {
  console.log(chalk.bgRed.white(`🔥  SHARD ${bot.options.shard_id}:`), ...arguments);
}

var rl = new Ratelimits();

var settings = {};

process.on('message', function(msg) {
  if (msg.type == 'serverCount') {
    settings.serverCount = msg.content;
  }
});

settings.config = require('./config.json');

r.connect({ host: settings.config.rethink, port: settings.config.rethinkport}, (err, conn) => {
  if (err) console.error("DB ERROR:", err);
  settings.dbconn = conn;
});

settings.OWNERID = '173547401905176585';
settings.PREFIX = 'ok google';

settings.startuptime = new Date() / 1000;

settings.KEYS = fs.readFileSync('keys.txt').toString().split("\n");
settings.KEYS.splice(-1, 1);

settings.KEYS = shuffle(settings.KEYS);

settings.lastKey = 0;

settings.cacheTime = 21600000;

settings.commands = {};

settings.toBeDeleted = new Map();

var commands = settings.commands;

// this command makes help
commands.help = {};
commands.help.main = function(bot, msg) {
  fs.readFile('./help.txt', 'utf8', function (err,data) {
    if (err) {
      return bot.error(err);
    }
    msg.author.sendMessage(data).catch(err => bot.error(err));
    msg.channel.sendMessage('Help has been sent!');
  });
};

commands.load = {};
commands.load.main = function(bot, msg) {
  if (msg.author.id == settings.OWNERID){
  var args = msg.content;
  try {
    delete commands[args];
    delete require.cache[__dirname+'/commands/'+args+'.js'];
    commands[args] = require(__dirname+'/commands/'+args+'.js');
    msg.channel.sendMessage('Loaded '+args);
  } catch(err) {
    msg.channel.sendMessage("Command not found or error loading\n`"+err.message+"`");
  }
  }
}

commands.unload = {};
commands.unload.main = function(bot, msg) {
  if (msg.author.id == settings.OWNERID){
      var args = msg.content;
      try {
        delete commands[args];
        delete require.cache[__dirname+'/commands/'+args+'.js'];
        msg.channel.sendMessage('Unloaded '+args);
      }
      catch(err){
        msg.channel.sendMessage("Command not found or error unloading\n`"+err.message+"`");
      }
  }
}

commands.reload = {};
commands.reload.main = function(bot, msg) {
  if (msg.author.id == settings.OWNERID){
      var args = msg.content;
      try {
        delete commands[args];
        delete require.cache[__dirname+'/commands/'+args+'.js']; // this is the important part here, since require caches files, reloading would do nothing if we didn't clear it
        commands[args] = require(__dirname+'/commands/'+args+'.js');
        msg.channel.sendMessage('Reloaded '+args);
      } catch(err) {
        msg.channel.sendMessage("Command not found or error reloading\n`"+err.message+"`");
      }
  }
}

commands.servers = {};
commands.servers.main = function(bot, msg, settings) {
  msg.channel.sendMessage(settings.serverCount);
}

var loadCommands = function() {
  var files = fs.readdirSync(__dirname+'/commands');
  for (let file of files) {
    if (file.endsWith('.js')) {
      commands[file.slice(0, -3)] = require(__dirname+'/commands/'+file);
    }
  }
  bot.log("———— All Commands Loaded! ————");
}

var checkCommand = function(msg, length, bot) {
  try {
    if (rl.changeCommand(msg, true)) {
      if(typeof msg.content.split(' ')[length] !== 'undefined') {
        msg.content = msg.content.substr(msg.content.split(" ", length).join(" ").length);
        var original = msg.content;
        var command = msg.content.split(' ')[1]; // friggin space at the beginning >:(
        msg.content = msg.content.split(' ').splice(2, msg.content.split(' ').length).join(' ');
        try {
          commands[command].main(bot, msg, settings);
        } catch (err) {
          if (original.split(' ').length > 1) {
            msg.content = original;
            commands['search'].main(bot, msg, settings);
          }
        }
      }
    }
  }
  catch(err) {
    bot.error(err.message);
  }
}


bot.on('ready', function() {
  bot.log(`READY! Serving in ${bot.channels.size} channels and ${bot.guilds.size} servers`);
  bot.user.setStatus("online", {name: "ok google, help"});
  loadCommands();
  rl.onReady();
  bot.sendIpc('serverCount', bot.guilds.size);
});

bot.on('message', function(msg) {
  if (msg.guild === undefined) return;
  if (msg.content.startsWith('<@'+bot.user.id+'>') || msg.content.startsWith('<@!'+bot.user.id+'>')) {
    checkCommand(msg, 1, bot);
  } else if (msg.content.toLowerCase().startsWith(settings.PREFIX)) {
    checkCommand(msg, settings.PREFIX.split(' ').length, bot);
  }
});

bot.on('messageDelete', msg => {
  if (settings.toBeDeleted.get(msg.id)) {
    msg.channel.messages.get(settings.toBeDeleted.get(msg.id)).delete().then(() => {
      settings.toBeDeleted.delete(msg.id);
    });
  }
});

bot.on('error', function(err) {
  bot.error(`————— BIG ERROR —————`);
  bot.error(err);
  bot.error("——— END BIG ERROR ———");
});

bot.on('disconnect', function(bot) {
  //alert the console
  bot.log("Disconnected!");
  rl.onDisconnect();
});

bot.on('guildCreate', function(server) {
  bot.log('SERVER GET:', server.name, server.id, bot.options.shard_id);
  r.db('google').table('servers').get(server.id).run(settings.dbconn, function(err, res) {
    if (res === null) {
      fs.readFile('./welcome.txt', 'utf8', function (err,data) {
        if (err) {
          return bot.log(err);
        }
        server.channels.get(server.id).sendMessage("<@" + server.owner.id + "> " + data);
        r.db('google').table('servers').insert({id: server.id, name: server.name, nsfw: '2', nick: 'Google'}).run(settings.dbconn);
      });
    }
  });
  bot.sendIpc('serverCount', bot.guilds.size);
});

bot.on('guildDelete', function(server) {
  bot.log('SERVER LOST:', server.name, server.id, bot.options.shard_id);
  bot.sendIpc('serverCount', bot.guilds.size);
});

bot.login(settings.config.token);

process.on('SIGHUP', () => {
  process.exit(0);
});
