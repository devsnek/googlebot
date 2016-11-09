const superagent = require('superagent');
const rp = (v, n, c = ' ') => String(v).length >= n ? '' + v : (String(c).repeat(n) + v).slice(-n);

module.exports = {
  main: async message => {
    superagent.get('https://intf.nyt.com/newsgraphics/2016/11-08-election-forecast/president.json')
    .end((err, res) => {
      if (err) return message.client.error(err.stack);
      let counted = res.body.president.current.electoral_votes_counted;
      let predicted = res.body.president.current.win_prob;
      counted = Object.keys(counted).map(k => `${rp(k.slice(0, -1).toUpperCase(), 8)} || ${rp(counted[k], 7)} || ${rp(Math.round(predicted[k] * 100), 15)}% ||`).join('\n');
      const final = `    NAME || CURRENT || % CHANCE WINNING ||\n${counted}`;
      message.channel.sendCode('', final);
    });
  },
  hide: true
}
