const superagent = require('superagent');

module.exports = {
  main: async (message) => {
    const preloadable = (await superagent.get(`https://hstspreload.org/api/v2/preloadable?domain=${message.content}`)).body;
    const status = (await superagent.get(`https://hstspreload.org/api/v2/status?domain=${message.content}`)).body;
    const errors = preloadable.errors.map(e => e.summary).join('\n');
    const warnings = preloadable.warnings.map(e => e.summary).join('\n');
    const final = `__**${status.name}** HSTS Preload Information__
**Status:** ${status.status}
${warnings.length ? `**Warnings:**\n${warnings}` : ''}
${errors.length ? `**Errors:**\n${errors}` : ''}`;
    message.channel.send(final);
  },
  hide: true,
};
