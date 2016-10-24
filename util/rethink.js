const Discord = require('discord.js');
const config = require('../config.json').rethink;
const r = require('rethinkdbdash')({
  port: config.port,
  host: config.host
});

const resolve = guildOrId => {
  return guildOrId instanceof Discord.Guild ? guildOrId.id : guildOrId;
}

module.exports = {
  raw: r,
  fetchGuild: async guild => {
    guild = resolve(guild);
    return await r.db('google').table('servers').get(guild).run();
  },
  createGuild: async guild => {
    return await r.db('google').table('servers').insert({
      id: guild.id,
      name: guild.name,
      nsfw: '2',
      nick: 'Google',
      status: 'active'
    }).run();
  },
  vacateGuild: async guild => {
    guild = resolve(guild);
    return await r.db('google').table('servers').get(guild).update({
      status: 'vacated'
    }).run();
  },
  activateGuild: async guild => {
    guild = resolve(guild);
    await r.db('google').table('servers').get(guild).update({
      status: 'active'
    }).run();
  },
  updateGuild: async (guild, settings) => {
    guild = resolve(guild);
    return await r.db('google').table('servers').get(guild).update(settings).run();
  },
  fetchGuilds: async () => {
    return r.db('google').table('servers').run();
  },
  updateCommand: async command => {
    if (command.hide) return;
    let update = {
      id: command.name,
      description: command.help,
      usage: `ok google, ${command.name} ${command.args}`
    }
    let rCommand = await r.db('google').table('commands').get(command.name).run();
    if (rCommand) r.db('google').table('commands').get(command.name).update(update).run();
    else r.db('google').table('commands').insert(update);
  }
}
