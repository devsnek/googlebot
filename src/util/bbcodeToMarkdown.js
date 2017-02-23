module.exports = (str) => str
  .replace(/\[b]((?:.|\n)+?)\[\/b]/gmi, '**$1**')
  .replace(/\[\u]((?:.|\n)+?)\[\/\u]/gmi, '__$1__')
  .replace(/\[s]((?:.|\n)+?)\[\/s]/gmi, '~~$1~~')
  .replace(/\[color=.+?]((?:.|\n)+?)\[\/color]/gmi, '$1')
  .replace(/\[list=1]((?:.|\n)+?)\[\/list]/gmi, (match, p1) => p1.replace(/\[\*]/gmi, '1. '))
  .replace(/(\n)\[\*]/gmi, '$1* ')
  .replace(/\[\/*list]/gmi, '')
  .replace(/\[img]((?:.|\n)+?)\[\/img]/gmi, '![]($1)')
  .replace(/\[url=(.+?)]((?:.|\n)+?)\[\/url]/gmi, '[$2]($1)')
  .replace(/\[code](.*?)\[\/code]/gmi, '`$1`')
  .replace(/\[code]((?:.|\n)+?)\[\/code]/gmi, (match, p1) => p1.replace(/^/gmi, '    '));
