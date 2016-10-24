const chalk = require('chalk');
const leftpad = (v, n, c = ' ') => String(v).length >= n ? '' + v : (String(c).repeat(n) + v).slice(-n);
const pad = text => leftpad(text, 8);
const center = require('center-text');

module.exports = async client => {
  client.config.prefixes = client.config.prefixes.map(p => p.replace('{ID}', client.user.id));
  client.config.prefix = new RegExp(`^${client.config.prefixes.join('|')}`);

  const guilds = await client.rethink.fetchGuilds();
  for (const guild of guilds) {
    if (!client.guilds.has(guild.id)) continue;
    client.guilds.get(guild.id).settings = guild;
  }

  let top = client.shard ? `| — SHARD ${leftpad(client.shard.id + 1, 2, '0')} READY — |` : '| —  CLIENT READY  — |';
  let info = `${client.user.username.replace('\u1160', '')}#${client.user.discriminator}`;
  console.log(chalk.bgMagenta.white.bold(`${top}
|${center(info, {columns: top.length - 2})}|
|${center(client.user.id, {columns: top.length - 2})}|
|   Guilds: ${pad(client.guilds.size)}${' |'}
| Channels: ${pad(client.channels.size)}${' |'}
|    Users: ${pad(client.users.size)}${' |'}
|   Emojis: ${pad(client.emojis.size)}${' |'}
|  —  —  —  —  —  —  |`));
  client.sendIpc('alive', client.shard.id);
}
