const express = require('express');

module.exports = (client) => {
  const router = new express.Router();

  router.get('/', (req, res) => {
    res.render('help', { commands: Array.from(client.commands.values()).filter(x => !x.owner && !x.hide) });
  });

  router.get('/:command', (req, res) => {
    const command = client.commands.get(req.params.command.toLowerCase());
    res.render('help', { command });
  });

  return router;
};
