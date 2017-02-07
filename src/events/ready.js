const chalk = require('chalk');
const leftpad = (v, n, c = ' ') => String(v).length >= n ? `${v}` : (String(c).repeat(n) + v).slice(-n);
const pad = text => leftpad(text, 8);
const center = require('center-text');

module.exports = (client, shard) => {
  logReady(client, shard);

  client.user.setPresence({ status: 'online', game: { name: `@${client.user.username} help` } });
};

function logReady(client, shard) {
  let top = shard !== undefined ? `╔══ SHARD ${leftpad(shard + 1, 2, '0')} READY ══╗` : '╔═══ CLIENT READY ═══╗';
  let info = `${client.user.username.replace('\u1160', '')}#${client.user.discriminator}`;
  const guilds = shard ? client.guilds.filter(g => g.shardID === shard) : client.guilds;
  const final = [
    '',
    top,
    `║${center(info, { columns: top.length - 2 })}║`,
    `║${center(client.user.id, { columns: top.length - 2 })}║`,
    `║   Guilds: ${pad(guilds.size)} ║`,
    `║ Channels: ${pad(client.channels.size)} ║`,
    `║    Users: ${pad(guilds.map(g => g.memberCount).reduce((a, b) => a + b))} ║`,
    `║   Emojis: ${pad(client.emojis.size)} ║`,
    `╚════════════════════╝`,
    '',
  ];
  console.log(final.map(f => chalk.bgMagenta.white.bold(f)).join('\n'));
}
