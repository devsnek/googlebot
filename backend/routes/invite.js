const express = require('express');
const router = express.Router();
const config = require('../../config.json');
const axios = require('axios');

router.get('/', (req, res) => {
  res.redirect(`https://discordapp.com/oauth2/authorize?client_id=${config.backend.CLIENT_ID}&permissions=${config.backend.PERMISSIONS}&redirect_uri=${encodeURIComponent(config.backend.INVITE_REDIR)}&scope=bot&response_type=code`);
});

router.get('/callback', async (req, res) => {
  const guild = await axios.get(`https://discordapp.com/api/guilds/${req.query.guild_id}`, {
    headers: {'Authorization': `Bot ${config.discord[config.env]}`}
  });
  res.render('invite', {guild: guild.data});
});

module.exports = router;
