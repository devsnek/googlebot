const path = require('path');
const http = require('http');
const express = require('express');
const hbs = require('hbs');

class Frontend {
  constructor (client) {
    this.client = client;

    this.express = express();
    const router = this.router = express.Router();

    this.server = http.createServer(this.express);

    this.express.set('view engine', 'hbs');
    this.express.set('views', path.join(__dirname, 'views'));
    this.express.use(express.static(path.join(__dirname, 'public')));
    hbs.registerPartials(path.join(__dirname, 'views', 'partials'));

    this.express.use(require('express-session')({
      secret: require('../config.json').backend.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: 86400000,
        httpOnly: false
      }
    }));

    this.express.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'blood, sweat, and tears');
      next();
    });

    this.sse = require('./sse')(this.server);

    this.ws = require('./ws')(this.server);

    router.use('/', require('./routes/index'));
    router.use('/panel', require('./routes/panel'));
    router.use('/setting', require('./routes/setting'));
    router.use('/invite', require('./routes/invite'));

    this.express.use(router);
  }

  listen (port) {
    return this.server.listen(port);
  }
}

module.exports = Frontend;
