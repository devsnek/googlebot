module.exports = (m) => {
  const permissions = m.permissions.serialize();
  return (
    permissions.KICK_MEMBERS ||
    permissions.BAN_MEMBERS ||
    permissions.ADMINISTRATOR ||
    permissions.MANAGE_CHANNELS ||
    permissions.MANAGE_GUILD ||
    permissions.MANAGE_MESSAGES
  );
};
