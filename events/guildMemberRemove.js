module.exports = async (member) => {
  member.client.util.watching({
    type: 'LEFT GUILD',
    user: member.user,
    context: member.guild.name,
    content: ''
  });
}
