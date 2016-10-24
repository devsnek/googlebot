const express = require('express');
const router = express.Router();
const axios = require('axios');
const r = require('../../util/rethink');
const config = require('../../config.json').backend;

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
  let availGuilds = await r.raw.db('google').table('servers').run();
  let tokenUri = `https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${req.query.code}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${REDIR_URI}`;
  let tokenRes = await axios.post(tokenUri);
  let token = `${tokenRes.data.token_type} ${tokenRes.data.access_token}`;
  let userRes = await axios.get('https://discordapp.com/api/users/@me', {headers: {'Authorization': token}});
  let guildsRes = await axios.get('https://discordapp.com/api/users/@me/guilds', {headers: {'Authorization': token}});
  req.session.guilds = guildsRes.data.filter(g => {
    if (g.permissions & (1 << 3)) return true;
    if (g.permissions & (1 << 5)) return true;
    return false;
  }).map(guild => {
    guild.settings = availGuilds.find(g => g.id === guild.id);
    return guild;
  });
  req.session.user = userRes.data;
  req.session.loggedIn = true;
  res.redirect('/panel');
});

module.exports = router;
