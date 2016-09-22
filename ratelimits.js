/**
 * Created by macdja38 on 2016-07-11.
 * major edits involving config were done by Gus 2016-07-28
 */

module.exports = class rateLimits {
  constructor (e) {
    this.client = e;

    this.channelRateLimitWhiteList = [];

    this.userCommandCount = {};
    this.channelCommandCount = {};
    this.serverCommandCount = {};

    this.userLimit = 3;
    this.userPerTick = 3;
    this.userTickInterval = 5000;

    this.channelLimit = 8;
    this.channelPerTick = 2;
    this.channelTickInterval = 2500;

    this.serverLimit = 15;
    this.serverPerTick = 10;
    this.serverTickInterval = 10000;
  }

  /**
   * Get's called every time the bot connects, not just the first time.
   */
  onReady () {
    this.reduceUsers = setInterval(() => {
      try {
        for (let user of Object.keys(this.userCommandCount)) {
          if (this.userCommandCount.hasOwnProperty(user)) {
            if (this.userCommandCount[user] > this.userPerTick) {
              this.userCommandCount[user] -= this.userPerTick;
            } else {
              delete this.userCommandCount[user];
            }
          }
        }
      } catch (err) {
        this.client.error(err);
      }
    }, this.userTickInterval);

    this.reduceChannels = setInterval(() => {
      try {
        for (let channel of Object.keys(this.channelCommandCount)) {
          if (this.channelCommandCount.hasOwnProperty(channel)) {
            if (this.channelCommandCount[channel] > this.channelPerTick) {
              this.channelCommandCount[channel] -= this.channelPerTick;
            } else {
              delete this.channelCommandCount[channel];
            }
          }
        }
      } catch (err) {
        this.client.error(err);
      }
    }, this.channelTickInterval);

    this.reduceServers = setInterval(() => {
      try {
        for (let server of Object.keys(this.serverCommandCount)) {
          if (this.serverCommandCount.hasOwnProperty(server)) {
            if (this.serverCommandCount[server] > this.serverPerTick) {
              this.serverCommandCount[server] -= this.serverPerTick;
            } else {
              delete this.serverCommandCount[server];
            }
          }
        }
      } catch (err) {
        this.client.error(err);
      }
    }, this.serverTickInterval);
  }

  /**
   * Get's called every time the bot disconnects.
   */
  onDisconnect () {
    clearInterval(this.reduceUsers);
    clearInterval(this.reduceChannels);
    clearInterval(this.reduceServers);
    this.userCommandCount = {};
    this.channelCommandCount = {};
    this.serverCommandCount = {};
  }

  /**
   * get's called every Command, (unless a previous middleware on the list override it.) can modify message.
   * @param msg
   * @param command
   * @param perms
   * @param l
   * @returns {command || boolean} object (may be modified.)
   */
  changeCommand (msg, command, perms, l) {
    if (!this.userCommandCount.hasOwnProperty(msg.author.id)) {
      this.userCommandCount[msg.author.id] = 1;
    } else {
      this.userCommandCount[msg.author.id]++;
    }
    if (this.userCommandCount[msg.author.id] === this.userLimit + 1) {
      this.userCommandCount[msg.author.id] += this.userLimit * 2;
      msg.reply('WOAH THERE. WAY TOO SPICY\nYou have exceeded the ratelimit.');
      this.client.log(`User ${msg.author.username} was ratelimited running command ${command.prefix}${command.command}, userId:${msg.author.id}`.magenta);
    }
    if (this.userCommandCount[msg.author.id] > this.userLimit) {
      return false;
    }

    if (msg.server) {
      if (this.channelRateLimitWhiteList.indexOf(command.commandnos) > -1) {
        return command;
      }
      if (!this.channelCommandCount.hasOwnProperty(msg.channel.id)) {
        this.channelCommandCount[msg.channel.id] = 1;
      } else {
        this.channelCommandCount[msg.channel.id]++;
      }
      if (this.channelCommandCount[msg.channel.id] === this.channelLimit + 1) {
        this.channelCommandCount[msg.channel.id] += this.channelLimit * 2;
        msg.reply('WOAH THERE. WAY TOO SPICY\nChannel has exceeded the ratelimits.');
        this.client.log(`Channel ${msg.channel.name}:${msg.channel.id} was ratelimited running command ${command.prefix}${command.command} in ${msg.server.name}:${msg.server.id}`.magenta);
      }
      if (this.channelCommandCount[msg.channel.id] > this.channelLimit) {
        return false;
      }

      if (!this.serverCommandCount.hasOwnProperty(msg.server.id)) {
        this.serverCommandCount[msg.server.id] = 1;
      } else {
        this.serverCommandCount[msg.server.id]++;
      }
      if (this.serverCommandCount[msg.server.id] === this.serverLimit + 1) {
        this.serverCommandCount[msg.server.id] += this.serverLimit * 2;
        msg.reply('WOAH THERE. WAY TOO SPICY\nServer has exceeded the ratelimit.');
        this.client.log(`Server ${msg.server.name}:${msg.server.id} was ratelimited running command ${command.prefix}${command.command}`.magenta);
      }
      if (this.serverCommandCount[msg.server.id] > this.serverLimit) {
        return false;
      }
    }

    return command;
  }
};
