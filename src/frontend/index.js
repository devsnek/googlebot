const path = require('path');
const http = require('http');
const express = require('express');
const hbs = require('hbs');

class Frontend {
  constructor(client) {
    this.client = client;
    client.frontend = this;

    this.express = express();
    const router = this.router = new express.Router();

    this.server = http.createServer(this.express);

    this.express.set('view engine', 'hbs');
    this.express.set('views', path.join(__dirname, 'views'));
    hbs.registerPartials(path.join(__dirname, 'views', 'partials'));
    this.express.use(express.static(path.join(__dirname, 'public')));

    this.express.use(require('express-session')({
      secret: require('../../config.json').backend.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: 86400000,
        httpOnly: false,
      },
    }));

    this.express.use((req, res, next) => {
      res.setHeader('X-Powered-By', 'blood, sweat, and tears');
      next();
    });

    this.sse = require('./sse')(this);

    this.ws = require('./ws')(this);

    router.use('/', require('./routes/index'));
    router.use('/invite', require('./routes/invite'));
    router.use('/help', require('./routes/help')(this.client));

    this.express.use(router);
  }

  listen(port) {
    return this.server.listen(port);
  }

  get connected() {
    return this.ws.connections.length;
  }
}

module.exports = Frontend;
