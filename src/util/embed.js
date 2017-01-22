module.exports = (url, title = url, description = 'ᅠ') => {
  if (description !== 'ᅠ') description += '\n';
  return {
    title,
    description: `${description}\n[Donate to keep Googlebot alive](https://patreon.com/guscaplan)`,
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
