const express = require('express');
const router = new express.Router();
const superagent = require('superagent');
const entities = new require('html-entities').XmlEntities; // eslint-disable-line
const marked = require('marked');

// AGHH
// router.use(async (req, res, next) => {
//   const quote = await superagent.get('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand');
//   res.locals.quote = entities.decode(quote.body[0].content).replace(/<\/?p>/g, '').trim();
//   return next();
// });

router.get('/', (req, res) => {
  res.render('index');
});

router.get('/compliance', (req, res) => {
  superagent.get('https://raw.githubusercontent.com/Roadcrosser/Compliance/master/enduser.md')
    .then((compliance) => {
      res.locals.compliance = marked(compliance.text.replace('**- for end users**\n', '').replace(/\+a/g, '@Google search'));
      res.render('compliance');
    });
});

module.exports = router;
