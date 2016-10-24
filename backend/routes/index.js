const express = require('express');
const router = express.Router();
const r = require('../../util/rethink');
const axios = require('axios');
const entities = new require('html-entities').XmlEntities; // eslint-disable-line
const config = require('../../config.json');

router.use(async (req, res, next) => {
  const quote = await axios.get('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand');
  res.locals.quote = entities.decode(quote.data[0].content).replace(/<\/?p>/g, '');
  return next();
});

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/help', async (req, res) => {
  res.locals.commands = await r.raw.db('google').table('commands').run();
  res.render('help');
});

router.get('/invite', (req, res) => {
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.backend.CLIENT_ID}&permissions=${config.backend.PERMISSIONS}&scope=bot`);
})

router.get('/logout', (req, res) => {
  res.redirect('/panel/logout');
});

router.get('/login', (req, res) => {
  res.redirect('/panel/login');
});

module.exports = router;
