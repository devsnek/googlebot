const TULPA_REGEX = /^\/\/ ?|^[\[{\(~"] ?| ?["~\)}\]]$/g;

module.exports = (message) => {
  return [
    message.content.replace(TULPA_REGEX, ''),
    message.cleanContent.replace(TULPA_REGEX, '')
  ]
}
