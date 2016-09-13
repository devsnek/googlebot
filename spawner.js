const childProcess = require('child_process');
const EventEmitter = require('events').EventEmitter;
const sleep = require('sleep').sleep;
const chalk = require('chalk');
const unirest = require('unirest');

const config = require('./config.json');

const wantedShards = 4;

const cluster = new EventEmitter();
cluster.workers = [];

var running = {};
const stats = {
  serverCount: {},
  userCount: {},
  channelCount: {}
};

const log = function () {
  console.log('⚠️ ', chalk.yellow('MASTER'), ...arguments);
}

cluster.on('fork', shard => {
  shard.on('message', msg => {
    if (msg.type === 'serverCount') {
      stats.serverCount[msg.id] = msg.content;
      let total = 0;
      Object.keys(stats.serverCount).forEach(k => {
        total += stats.serverCount[k];
      });
      updateCount(total);
      Object.keys(cluster.workers).forEach(id => {
        cluster.workers[id].send({type: 'serverCount', content: total});
      })
    } else if (msg.type === 'userCount') {
      stats.userCount[msg.id] = msg.content;
      let total = 0;
      Object.keys(stats.userCount).forEach(k => {
        total += stats.userCount[k]
      });
      Object.keys(cluster.workers).forEach(id => {
        cluster.workers[id].send({type: 'userCount', content: total});
      });
    } else if (msg.type === 'channelCount') {
      stats.channelCount[msg.id] = msg.content;
      let total = 0;
      Object.keys(stats.channelCount).forEach(k => {
        total += stats.channelCount[k]
      });
      Object.keys(cluster.workers).forEach(id => {
        cluster.workers[id].send({type: 'channelCount', content: total});
      });
    } else if (msg.type === 'alive') {
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

const fork = (shardId, shardCount) => {
  let shard = childProcess.fork('googlebot.js', [], {env: { shard_id: shardId, shard_count: shardCount }});
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

const updateCarbon = count => {
  console.log('updating carbon');
  unirest.post('https://www.carbonitex.net/discord/data/botdata.php')
  .headers({'Content-Type': 'multipart/form-data', 'cache-control': 'no-cache'})
  .field('key', config.carbon)
  .field('servercount', count)
  .end(res => {
    console.log(res.body);
  });
};

const updateAbal = count => {
  console.log('updating abal');
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
