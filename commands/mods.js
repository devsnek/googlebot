const statusMap = {
  'online': '<:vpOnline:212789758110334977>',
  'idle': '<:vpAway:212789859071426561>',
  'offline': '<:vpOffline:212790005943369728>',
  'dnd': '<:vpDnD:236744731088912384>',
  'streaming': '<:vpStreaming:212789640799846400>'
}

const sortMap = { 'online': 1, 'idle': 2, 'streaming': 3, 'dnd': 4, 'offline': 5 }

const getStatus = (m, map = true) => {
  let status = m.guild.presences.get(m.user.id) ? m.guild.presences.get(m.user.id).status : 'offline';
  return (map ? statusMap[status] : status);
}

module.exports = {
  main: async message => {
    let mods = message.guild.members.array().filter(m => message.client.util.isStaff(m) && !m.user.bot).sort((a, b) => sortMap[getStatus(a, false)] > sortMap[getStatus(b, false)]);
    mods = mods.map(m => `${getStatus(m)} **${m.user.username}#${m.user.discriminator}**`)
    message.channel.sendMessage([`Mods for **${message.guild.name}**`].concat(mods));
  },
  args: '',
  help: 'list all mods and their statuses in a server',
  catagory: 'util'
}
