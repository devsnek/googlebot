const express = require('express');
const router = express.Router();
const r = require('../../util/rethink');
const superagent = require('superagent');
const entities = new require('html-entities').XmlEntities; // eslint-disable-line

router.use(async (req, res, next) => {
  const quote = await superagent.get('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand');
  res.locals.quote = entities.decode(quote.body[0].content).replace(/<\/?p>/g, '');
  return next();
});

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/help', async (req, res) => {
  res.locals.commands = [{id: 'test', description: 'this is a description', usage: 'ok google test'}] // await r.raw.db('google').table('commands').run();
  res.render('help');
});

router.get('/logout', (req, res) => {
  res.redirect('/panel/logout');
});

router.get('/login', (req, res) => {
  res.redirect('/panel/login');
});

module.exports = router;
