module.exports = (url, title = url, description = 'ᅠ') => {
  if (description !== 'ᅠ') description += '\n';
  console.log(url);
  return {
    title: title,
    description: `${description}
[Help keep Googlebot running](https://www.change.org/p/google-inc-help-googlebot-not-die/)
[Donate to keep Googlebot alive](https://patreon.com/guscaplan)\n\u200b`,
    url: url,
    timestamp: new Date(),
    footer: {
      text: 'Powered by Google',
      icon_url: 'https://google.com/favicon.ico'
    }
  }
}
