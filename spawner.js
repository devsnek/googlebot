const childProcess = require('child_process');
const EventEmitter = require('events').EventEmitter;
const sleep = require('sleep').sleep;
const chalk = require('chalk');
const unirest = require('unirest');

const cluster = new EventEmitter();
cluster.workers = [];

const config = require('./config.json');

const wantedShards = 2;

var running = {};
var serverCount = {};

const log = function() {
  console.log('⚠️ ', chalk.yellow('MASTER'), ...arguments);
}

cluster.on('fork', shard => {
  shard.on('message', msg => {
    if (msg.type == 'serverCount') {
      serverCount[msg.id] = msg.content;
      let total = 0;
      Object.keys(serverCount).forEach(function(k) {
        total += serverCount[k];
      });
      updateCount(total);
      Object.keys(cluster.workers).forEach(function(id) {
        cluster.workers[id].send({ type: 'serverCount', content: total});
      })
    } else if (msg.type == 'alive') {
      log('New shard! pid:', shard.pid, 'id:', msg.id);
      running[shard.pid] = msg.id;
    }
  });
  shard.on('exit', (code, signal) => {
    log('Shard Died! pid:', shard.pid, 'id:', running[shard.pid]);
    fork(running[shard.pid], wantedShards);
    delete cluster.workers[cluster.workers.indexOf(shard)];
  });
});

const fork = function (shard_id, shard_count) {
  let shard = childProcess.fork('googlebot.js', [], {env: { shard_id: shard_id, shard_count: shard_count }});
  cluster.emit('fork', shard);
  cluster.workers.push(shard);
}

for (var i = 0; i < wantedShards; i++) {
  fork(i, wantedShards);
  sleep(5);
}

const updateCount = count => {
  updateCarbon(count);
  updateAbal(count);
}


var updateCarbon = count => {
  console.log("updating carbon");
  unirest.post('https://www.carbonitex.net/discord/data/botdata.php')
  .headers({'Content-Type': 'multipart/form-data', 'cache-control': 'no-cache'})
  .field('key', config.carbon)
  .field('servercount', count)
  .end(res => {
    console.log(res.body);
  });
};

const updateAbal = count => {
  console.log("updating abal");
  unirest.post('https://bots.discord.pw/api/bots/187406062989606912/stats')
  .headers({
    'Content-Type': 'application/json',
    'Authorization': config.abal
  })
  .send({'server_count': count})
  .end(res => {
      console.log(res.body);
  })
};

process.stdin.resume();
