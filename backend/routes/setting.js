const express = require('express');
const router = express.Router();
const r = require('../../util/rethink');

router.get('/:method/:guild/:setting/:value?', async (req, res) => {
  if (!req.session.guilds) return res.status(403).json({'error': 'nu nu nu permz kthxbye'});
  if (!req.session.guilds.map(g => g.id).includes(req.params.guild)) {
    return res.status(403).json({'error': 'nu nu nu perms kthxbye'});
  }
  if (req.params.method === 'set') {
    let old = await r.raw.db('google').table('servers').get(req.params.guild).run();
    old[req.params.setting] = req.params.value;
    r.raw.db('google').table('servers').get(req.params.guild).update(old).run()
    .then(() => res.end('yay'))
    .catch(err => res.status(500).json(err));
  } else if (req.params.method === 'get') {
    let settings = await r.raw.db('google').table('servers').get(req.params.guild).run();
    if (req.params.setting && req.params.setting in settings) {
      return res.json(settings[req.params.setting]);
    } else {
      return res.json(settings);
    }
  }
});

module.exports = router;
