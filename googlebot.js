'use strict';

/* jshint esversion: 6 */
/* jshint node: true */

String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ");}; // i would never use a nodejs package for this ;)
function shuffle(a){for(var c,d,b=a.length;b;)d=Math.floor(Math.random()*b--),c=a[b],a[b]=a[d],a[d]=c;return a}

const Discord = require("discord.js");
const fs = require('fs');
const Ratelimits = require('./ratelimits');
const r = require('rethinkdb');
const os = require('os');
const cluster = require('cluster');
const sleep = require('sleep').sleep;
const chalk = require('chalk');
const unirest = require('unirest');

const wantedShards = 2; // or you could do `os.cpus().length` ¯\_(ツ)_/¯

const config = require('./config.json')

if (cluster.isMaster) {

  var updateCarbon = function(count){
    console.log("updating carbon");
    unirest.post('https://www.carbonitex.net/discord/data/botdata.php')
    .headers({'Content-Type': 'multipart/form-data', 'cache-control': 'no-cache'})
    .field('key', config.carbon)
    .field('servercount', count)
    .end(res => {
      console.log(res.body);
    });
  };

  var updateAbal = function(count){
    console.log("updating abal");
    unirest.post('https://bots.discord.pw/api/bots/187406062989606912/stats')
    .headers({
      'Content-Type': 'application/json',
      'Authorization': config.abal
    })
    .send({'server_count': count})
    .end(res => {
        console.log(res.body);
    })
  };

  var running = {};

  for (let i = 0; i < wantedShards; i++) {
    cluster.fork({ shardId: i, shardCount: wantedShards });
    sleep(5);
  }

  var serverCount = {};

  var log = function() {
    console.log('⚠️ ', chalk.yellow('MASTER'), ...arguments);
  }

  cluster.on('fork', function(shard) {
    shard.on('message', msg => {
      //bot.log(`Master received message from shard ${msg.id}: ${msg.content}`);
      if (msg.type == 'serverCount') {
        serverCount[msg.id] = msg.content;
        let total = 0;
        Object.keys(serverCount).forEach(function(k) {
          total += serverCount[k];
        });
        updateAbal(total);
        updateCarbon(total);
        Object.keys(cluster.workers).forEach(function(id) {
          cluster.workers[id].send({ type: 'serverCount', content: total});
        })
      } else if (msg.type == 'alive') {
        log('New shard! pid:', shard.process.pid, 'id:', msg.id);
        running[shard.process.pid] = msg.id;
      }
    });

    shard.on('exit', (code, signal) => {
      log('Shard Died! pid:', shard.process.pid, 'id:', running[shard.process.pid]);
      cluster.fork({ shardId: running[shard.process.pid], shardCount: wantedShards });
    });
  });

} else {

    var bot = new Discord.Client({
        autoReconnect: true,
        shardCount: parseInt(process.env.shardCount),
        shardId: parseInt(process.env.shardId),
        maxCachedMessages: 1,
        disableEveryone: true
    });

    process.send({type: 'alive', id: bot.options.shardId, content: bot.options.shardId});

    // there are those that would say extending the client like this is bad. those people are 100% correct.

    bot.sendIpc = function(t, c) {
        process.send({type: t, id: bot.options.shardId, content: c});
    };

    bot.log = function() {
        console.log(chalk.green(`⚙  SHARD ${bot.options.shardId}:`), ...arguments);
    };

    bot.error = function() {
        console.log(chalk.bgRed.white(`🔥  SHARD ${bot.options.shardId}:`), ...arguments);
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

    var commands = settings.commands;

    // this command makes help
    commands.help = {};
    commands.help.main = function(bot, msg) {
        fs.readFile('./help.txt', 'utf8', function (err,data) {
            if (err) {
                return bot.error(err);
            }
            bot.sendMessage(msg.author, data);
            bot.sendMessage(msg, 'Help has been sent!');
        });
    };

    commands.load = {};
    commands.load.main = function(bot, msg) {
        if (msg.author.id == settings.OWNERID){
        var args = msg;
        try {
            delete commands[args];
            delete require.cache[__dirname+'/commands/'+args+'.js'];
            commands[args] = require(__dirname+'/commands/'+args+'.js');
            bot.sendMessage(msg, 'Loaded '+args);
        } catch(err) {
            bot.sendMessage(msg, "Command not found or error loading\n`"+err.message+"`");
        }
        }
    }

    commands.unload = {};
    commands.unload.main = function(bot, msg) {
        if (msg.author.id == settings.OWNERID){
            var args = msg;
            try {
                delete commands[args];
                delete require.cache[__dirname+'/commands/'+args+'.js'];
                bot.sendMessage(msg, 'Unloaded '+args);
            }
            catch(err){
                bot.sendMessage(msg, "Command not found or error unloading\n`"+err.message+"`");
            }
        }
    }

    commands.reload = {};
    commands.reload.main = function(bot, msg) {
        if (msg.author.id == settings.OWNERID){
            var args = msg;
            try {
                delete commands[args];
                delete require.cache[__dirname+'/commands/'+args+'.js']; // this is the important part here, since require caches files, reloading would do nothing if we didn't clear it
                commands[args] = require(__dirname+'/commands/'+args+'.js');
                bot.sendMessage(msg, 'Reloaded '+args);
            } catch(err) {
                bot.sendMessage(msg, "Command not found or error reloading\n`"+err.message+"`");
            }
        }
    }

    commands.servers = {};
    commands.servers.main = function(bot, msg, settings) {
        bot.sendMessage(msg, settings.serverCount);
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
        bot.log(`READY! Serving in ${bot.channels.length} channels and ${bot.servers.length} servers`);
        bot.setStatus("online", "ok google, help");
        loadCommands();
        rl.onReady();
        bot.sendIpc('serverCount', bot.servers.length);
    });

    bot.on('message', function(msg) {
        if (msg.content.startsWith('<@'+bot.user.id+'>') || msg.content.startsWith('<@!'+bot.user.id+'>')) {
            checkCommand(msg, 1, bot);
        } else if (msg.content.toLowerCase().startsWith(settings.PREFIX)) {
            checkCommand(msg, settings.PREFIX.split(' ').length, bot);
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

    bot.on('serverCreated', function(server) {
        bot.log('SERVER GET:', server.name, server.id, bot.options.shardId);
        r.db('google').table('servers').get(server.id).run(settings.dbconn, function(err, res) {
            if (res === null) {
                fs.readFile('./welcome.txt', 'utf8', function (err,data) {
                    if (err) {
                        return bot.log(err);
                    }
                    bot.sendMessage(server.defaultChannel, server.owner.mention() + " " + data);
                    r.db('google').table('servers').insert({id: server.id, name: server.name, nsfw: '2', nick: 'Google'}).run(settings.dbconn);
                });
            }
        });
        bot.sendIpc('serverCount', bot.servers.length);
    });

    bot.on('serverDeleted', function(server) {
        bot.log('SERVER LOST:', server.name, server.id, bot.options.shardId);
        bot.sendIpc('serverCount', bot.servers.length);
    });

    bot.loginWithToken(settings.config.token);
}
