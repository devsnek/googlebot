const chalk = require('chalk');
const leftpad = (v, n, c = ' ') => String(v).length >= n ? '' + v : (String(c).repeat(n) + v).slice(-n);
const pad = text => leftpad(text, 8);
const center = require('center-text');

module.exports = async client => {
  client.config.prefixes = client.config.prefixes.map(p => p.replace('{ID}', client.user.id));
  client.config.prefix = new RegExp(`^${client.config.prefixes.join('|^')}`, 'i');

  const guilds = await client.rethink.fetchGuilds();
  for (const guild of guilds) {
    if (!client.guilds.has(guild.id)) continue;
    client.guilds.get(guild.id).settings = guild;
  }

  client.rethink.raw.db('google').table('servers').changes().run((err, cursor) => {
    if (err) client.error(err);
    cursor.each((err, change) => {
      if (err) client.error(err);
      if (!change.new_val) return;
      if (!client.guilds.has(change.new_val.id)) return;
      let guild = client.guilds.get(change.new_val.id);
      guild.settings = change.new_val;
      if (change.new_val.nick) guild.member(client.user).setNickname(change.new_val.nick).catch(err => client.error('NICKNAME', err.message));
    });
  })

  let top = client.shard ? `| — SHARD ${leftpad(client.shard.id + 1, 2, '0')} READY — |` : '| —  CLIENT READY  — |';
  let info = `${client.user.username.replace('\u1160', '')}#${client.user.discriminator}`;
  const final = [
    top,
    `|${center(info, {columns: top.length - 2})}|`,
    `|${center(client.user.id, {columns: top.length - 2})}|`,
    `|   Guilds: ${pad(client.guilds.size)} |`,
    `| Channels: ${pad(client.channels.size)} |`,
    `|    Users: ${pad(client.users.size)} |`,
    `|   Emojis: ${pad(client.emojis.size)} |`,
    `|  —  —  —  —  —  —  |`
  ]
  console.log(final.map(f => chalk.bgMagenta.white.bold(f)).join('\n'));
  client.sendIpc('alive', client.shard.id);

  client.user.setPresence({ status: 'online', game: { name: `@${client.user.username} help` } });
}
