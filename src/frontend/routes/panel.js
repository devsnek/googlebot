const express = require('express');
const router = express.Router();
const superagent = require('superagent');
const r = require('../../util/rethink');
const config = require('../../../config.json').backend;

const CLIENT_ID = config.CLIENT_ID;
const CLIENT_SECRET = config.CLIENT_SECRET;
const REDIR_URI = config.REDIR_URI;
const SCOPES = ['identify', 'guilds'];
const AUTH_URI = `https://discordapp.com/oauth2/authorize?client_id=${CLIENT_ID}&scope=${SCOPES.join('%20')}&redirect_uri=${REDIR_URI}&response_type=code`

router.get('/', (req, res) => {
  if (!req.session.loggedIn) return res.redirect('/panel/login');
  res.locals.user = req.session.user;
  res.locals.guilds = req.session.guilds;
  res.render('panel');
})

router.get('/login', (req, res) => {
  res.redirect(AUTH_URI);
});

router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error(err);
    res.redirect('/');
  });
});

router.get('/callback', async (req, res) => {
  let availGuilds = await r.raw.db('google').table('servers').filter({status: 'active'}).run();
  let tokenUri = `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${req.query.code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIR_URI}`;
  let tokenRes = await superagent.post(tokenUri);
  let token = `${tokenRes.body.token_type} ${tokenRes.body.access_token}`;
  let userRes = await superagent.get('https://discordapp.com/api/users/@me').set({'Authorization': token});
  let guildsRes = await superagent.get('https://discordapp.com/api/users/@me/guilds').set({'Authorization': token});
  guildsRes = guildsRes.body.filter(g => {
    if (g.permissions & (1 << 3)) return true;
    if (g.permissions & (1 << 5)) return true;
    return false;
  });
  for (const guild of availGuilds) {
    if (!guildsRes.find(g => g.id === guild.id)) continue;
    guildsRes.find(g => g.id === guild.id).settings = guild;
  }
  req.session.guilds = guildsRes;
  req.session.user = userRes.body;
  req.session.loggedIn = true;
  res.redirect('/panel');
});

module.exports = router;
