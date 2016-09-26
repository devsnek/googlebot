const isStaff = (m) => {
    let permissions = m.permissions.serialize();
    return (permissions.KICK_MEMBERS
        || permissions.BAN_MEMBERS
        || permissions.ADMINISTRATOR
        || permissions.MANAGE_CHANNELS
        || permissions.MANAGE_GUILD
        || permissions.MANAGE_MESSAGES);
};

const statusMap = {
  'online': '<:vpOnline:212789758110334977>',
  'idle': '<:vpAway:212789859071426561>',
  'offline': '<:vpOffline:212790005943369728>',
  'streaming': '<:vpStreaming:212789640799846400>'
}

const getStatus = m => statusMap[m.guild.presences.get(m.user.id) ? m.guild.presences.get(m.user.id).status : 'offline'];

module.exports = {
  main: (bot, msg, settings) => {
    let mods = msg.guild.members.array().filter(m => isStaff(m) && !m.user.bot);
    mods = mods.map(m => `${getStatus(m)} **${m.user.username}#${m.user.discriminator}**`)
    msg.channel.sendMessage([`Mods for **${msg.guild.name}**`].concat(mods));
  },
  args: '',
  help: 'list all mods and their statuses in a server',
  catagory: 'util'
}
