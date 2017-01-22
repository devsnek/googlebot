module.exports = async (member) => {
  member.client.util.watching({
    type: 'JOINED GUILD',
    user: member.user,
    context: member.guild.name,
    content: ''
  });
}
