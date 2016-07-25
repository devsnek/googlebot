"use strict";

String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ")} // i would never use a nodejs package for this ;)

var Discord = require("discord.js");
var fs = require('fs');
var JsonDB = require('node-json-db');

var bots = {};

bots[0] = new Discord.Client({
    autoReconnect: true,
    shardCount: 2,
    shardId: 0, 
    maxCachedMessages: 1
});

bots[1] = new Discord.Client({
    autoReconnect: true,
    shardCount: 2,
    shardId: 1,
    maxCachedMessages: 1
});

var settings = {};

settings.config = require('./config.json');

settings.stats = new JsonDB("stats", true, true);

settings.pushSearch = function() {
    var searches = 0;
    try {
        searches = settings.stats.getData('/searches');
    } catch(err) {
        settings.stats.push('/searches', 0);
    }
    settings.stats.push('/searches', searches+1);
}

settings.OWNERID = '173547401905176585';
settings.PREFIX = 'ok google';

settings.startuptime = new Date() / 1000;

settings.KEYS = fs.readFileSync('keys.txt').toString().split("\n");

settings.commands = {}

var commands = settings.commands;

// this command makes help
commands.help = {};
commands.help.args = '';
commands.help.help = "view this message";
commands.help.main = function(bot, msg) {
    fs.readFile('./help.txt', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        bot.sendMessage(msg.author, data);
        bot.sendMessage(msg, 'Help has been sent!');
    });
}

commands.load = {};
commands.load.args = '<command>';
commands.load.help = '';
commands.load.hide = true;
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
commands.unload.args = '<command>';
commands.unload.help = '';
commands.unload.hide = true;
commands.unload.main = function(bot, msg) {
    if (msg.author.id == settings.OWNERID){
        var args = msg;
        try {
            delete commands[args];
            delete require.cache[__dirname+'/commands/'+args+'.js'];
            bot.sendMessage(msg, 'Unloaded '+args);
        }
        catch(err){
            bot.sendMessage(msg, "Command not found");
        }
    }
}

commands.reload = {};
commands.reload.args = '';
commands.reload.help = '';
commands.reload.hide = true;
commands.reload.main = function(bot, msg) {
    if (msg.author.id == settings.OWNERID){
        var args = msg;
        try {
            delete commands[args];
            delete require.cache[__dirname+'/commands/'+args+'.js']; // this is the important part here, since require caches files, reloading would do nothing if we didn't clear it
            commands[args] = require(__dirname+'/commands/'+args+'.js');
            bot.sendMessage(msg, 'Reloaded '+args);
        }
        catch(err){
            bot.sendMessage(msg, "Command not found");
        }
    }
}

commands.servers = {};
commands.servers.main = function(bot, msg, settings) {
    var servers = 0;
    for (var i in bots) {
        servers += bots[i].servers.length;
    }
    bot.sendMessage(msg, servers);
}

var loadCommands = function() {
    var files = fs.readdirSync(__dirname+'/commands');
    for (let file of files) {
        if (file.endsWith('.js')) {
            commands[file.slice(0, -3)] = require(__dirname+'/commands/'+file);
        }
    }
    console.log("———— All Commands Loaded! ————");
}

var checkCommand = function(msg, length, bot) {
    try {
        if(typeof msg.content.split(' ')[length] === 'undefined') {
            
        } else {
            msg.content = msg.content.substr(msg.content.split(" ", length).join(" ").length);
            var command = msg.content.split(' ')[1]; // friggin space at the beginning >:(
            msg.content = msg.content.split(' ').splice(2, msg.content.split(' ').length).join(' ');
            commands[command].main(bot, msg, settings, bots);
        }
    }
    catch(err) {
        console.log(err.message);
    }
}


var onReady = function(bot) {
	console.log(`Shard ${bot.options.shardId} is ready to begin! Serving in ${bot.channels.length} channels`);
    bot.setStatus("online", "ok google, help");
    loadCommands();
}

var onMessage = function(msg, bot) {
	if (msg.content.startsWith('<@'+bot.user.id+'>') || msg.content.startsWith('<@!'+bot.user.id+'>')) {
        checkCommand(msg, 1, bot);
    } else if (msg.content.toLowerCase().startsWith(settings.PREFIX)) {
        checkCommand(msg, settings.PREFIX.split(' ').length, bot);
    }
}

var onError = function(err, bot) {
    console.log(`————— BIG ERROR (Shard ${bot.options.shardId}) —————`);
    console.log(err);
    console.log("——— END BIG ERROR ———");
}

var onDisconnect = function(bot) {
	//alert the console
	console.log("Disconnected!");
}

var serverCreated = function(server, bot) {
    fs.readFile('./welcome.txt', 'utf8', function (err,data) {
        if (err) {
            return console.log(err);
        }
        bot.sendMessage(server.defaultChannel, server.owner.mention() + " " + data);
    });
}

var serverDeleted = function(server, bot) {
}

// this shit here makes me sad, but i'm too lazy to make it nicer

//when bot is ready load commands
bots[0].on("ready", () => {
    onReady(bots[0]);
});

//when bot is ready load commands
bots[1].on("ready", () => {
    onReady(bots[1]);
});

//when the bot receives a message
bots[0].on("message", msg => {
	onMessage(msg, bots[0]);
});

//when the bot receives a message
bots[1].on("message", msg => {
    onMessage(msg, bots[1]);
});


// when things break
bots[0].on('error', (err) => {
    onError(err, bots[0]);
});

// when things break
bots[1].on('error', (err) => {
    onError(err, bots[1]);
});


//when the bot disconnects
bots[0].on("disconnected", () => {
	onDisconnect(bots[0]);
});

//when the bot disconnects
bots[1].on("disconnected", () => {
	onDisconnect(bots[1]);
});

bots[0].on("serverDeleted", function(server){
    serverDeleted(server, bots[0]);
});

bots[1].on("serverDeleted", function(server){
    serverDeleted(server, bots[1]);
});

bots[0].on("serverCreated", function(server){
    serverCreated(server, bots[0]);
});

bots[1].on("serverCreated", function(server){
    serverCreated(server, bots[1]);
});

bots[0].loginWithToken(settings.config.token);
bots[1].loginWithToken(settings.config.token);

function exitHandler() {
    for (let bot in bots) {
        bots[bot].destroy();
    }
}

process.on('exit', exitHandler.bind(null))
  .on('SIGINT', exitHandler.bind(null))
//  .on('uncaughtException', exitHandler.bind(null))
  .stdin.resume();
