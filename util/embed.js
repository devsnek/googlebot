module.exports = (url, title = url, description = 'ᅠ') => {
  if (description !== 'ᅠ') description += '\n';
  return {
    title: title,
    description: `${description}
[Help keep Googlebot running](https://www.change.org/p/google-inc-help-googlebot-not-die/)
[Donate to keep Googlebot alive](https://patreon.com/guscaplan)\n\u200b`,
    url,
    timestamp: new Date(),
    video: { url },
    image: { url },
    footer: {
      text: 'Powered by Google',
      icon_url: 'https://google.com/favicon.ico'
    }
  }
}
