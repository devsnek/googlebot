module.exports = (client, event, shardID) => {
  client.error('————      DISCONNECT      ————', event, shardID);
};
