const Discord = require('discord.js');
const config = require('../config.json').rethink;
const r = require('rethinkdbdash')({
  port: config.port,
  host: config.host
});

const resolve = guildOrId => guildOrId instanceof Discord.Guild ? guildOrId.id : guildOrId;

const guilds = r.db('google').table('servers');

module.exports = {
  raw: r,
  hasGuild: async guild => {
    return (await guilds.get(resolve(guild)).run()) !== null;
  },
  fetchGuild: async guild => {
    return await guilds.get(resolve(guild)).run();
  },
  createGuild: async guild => {
    return await guilds.insert({
      id: guild.id,
      name: guild.name,
      nsfw: '2',
      nick: 'Google',
      status: 'active'
    }).run();
  },
  vacateGuild: async guild => {
    return await guilds.get(resolve(guild)).update({
      status: 'vacated'
    }).run();
  },
  activateGuild: async guild => {
    return await guilds.get(resolve(guild)).update({
      status: 'active'
    }).run();
  },
  updateGuild: async (guild, settings) => {
    return await guilds.get(resolve(guild)).update(settings).run();
  },
  fetchGuilds: async () => {
    return guilds.run();
  },
  updateCommand: async command => {
    if (command.hide) return;
    let update = {
      id: command.name,
      description: command.help,
      usage: `@Google ${command.name} ${command.args}`
    }
    let rCommand = await r.db('google').table('commands').get(command.name).run();
    if (rCommand) return r.db('google').table('commands').get(command.name).update(update).run();
    else return r.db('google').table('commands').insert(update);
  },
  fetchWatched: async () => {
    return r.db('google').table('watched').run();
  }
}
