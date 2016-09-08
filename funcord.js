const EventEmitter = require('events').EventEmitter;
const WebSocket = require('ws');
const request = require('superagent');

class Discord {
  constructor (options) {
    this.lastS = 0;
    this.guilds = new Map();
    this.users = new Map();
    this.channels = new Map();
    this.options = options;
    this.debug = options.debug || false;
    this.e = new EventEmitter();
  }
  log (t) {
    if (this.debug) {
      console.log(t);
      this.e.emit('DEBUG', t);
    }
  }
  heartbeat () {
    this.log('♥️ SENDING HEARTBEAT');
    this.socket.send(JSON.stringify({
      'op': 1,
      'd': this.lastS
    }));
  }
  callAPI (options, callback) {
    var base = 'https://discordapp.com/api';
    var headers = {
      'Authorization': this.options.token,
      'Content-Type': 'application/json'
    };
    if (options.body) options.body = JSON.stringify(options.body);
    request(options.method, base + options.uri)
    .set(headers)
    .send(options.body || {})
    .end((err, res) => {
      if (err) console.error(err);
      callback(res.body)
    });
  }
  login () {
    var self = this;
    this.callAPI({
      method: 'GET',
      uri: '/gateway'
    }, res => {
      self.socket = new WebSocket(res.url + '/?v=6&encoding=json');
      self.socket.addEventListener('message', self.onMessage.bind(self));
      self.socket.addEventListener('disconnect', self.onDisconnect.bind(self));
      self.socket.onopen = event => {
        self.log('SOCKET OPEN');
      };
    })
  }
  logout () {
    this.socket.close();
  }
  onMessage (event) {
    var self = this;
    var e = JSON.parse(event.data);
    this.lastS = e.s;
    switch (e.op) {
      case 10:
        if (this.beatInterval) clearInterval(this.beatInterval);
        this.socket.send(JSON.stringify({
          'op': 2,
          'd': {
            'token': this.options.token,
            'properties': {
              '$browser': 'funcord'
            },
            'large_threshold': 50
          }
        }));
        this.beatInterval = setInterval(function () {
          self.heartbeat();
        }, e.d.heartbeat_interval);
        break;
      case 11:
        this.log('♥️ GOT HEARTBEAT');
        break;
      case 0:
        switch (e.t) {
          case 'READY':
            this.user = e.d.user;
            if (e.d.guilds) {
              e.d.guilds.forEach(function (guild) {
                self.guilds.set(guild.id, guild);
              })
            }
            this.e.emit('READY', e);
            break;
          case 'GUILD_CREATE':
            this.log('GUILD_CREATE', e.d.id);
            self.guilds.set(e.d.id, e.d);
            e.d.members.forEach(function (member) {
              self.users.set(member.user.id, member.user);
            });
            e.d.channels.forEach(function (channel) {
              channel.guild_id = e.d.id;
              self.channels.set(channel.id, channel);
            });
            break;
          case 'PRESENCE_UPDATE':
            self.users[e.d.user.id] = e.d;
            self.guilds.forEach(function (guild) {
              if (!guild.hasOwnProperty('members')) return;
              if (guild.members.includes(e.d.user.id)) {
                guild.members[e.d.user.id].game === e.d.game;
              }
            })
            break;
          default:
            this.e.emit(e.t, e);
            break;
        }
        break;
    }
  }
  onDisconnect (event) {
    this.log('DISCONNECT!');
  }
  sendMessage (id, content, callback) {
    this.callAPI({
      method: 'POST',
      uri: '/channels/' + id + '/messages',
      body: {
        content: content
      }
    }, function (res) {
      if (callback) callback(res);
    })
  }
  editMessage (channel, id, content, callback) {
    this.callAPI({
      method: 'PATCH',
      uri: '/channels/' + channel + '/messages/' + id,
      body: {
        content: content
      }
    }, function (res) {
      if (callback) callback(res);
    })
  }
  deleteMessage (channel, id, callback) {
    this.callAPI({
      method: 'DELETE',
      uri: '/channels/' + channel + '/messages/' + id
    }, function (res) {
      if (callback) callback(res);
    });
  }
  setStatus (idle, game) {
    this.socket.send(JSON.stringify({
      op: 3,
      d: {
        'idle_since': idle,
        'game': game
      }
    }));
  }
  startTyping (channel, callback) {
    this.callAPI({
      method: 'POST',
      uri: '/channels/' + channel + '/typing'
    }, function (res) {
      if (callback) callback(res);
    })
  }
  setNickname (guild, nick, user, callback) {
    this.callAPI({method: 'PATCH', uri: '/guilds/' + guild + '/members/' + user, body: {nick: nick}}, res => {
      if (callback) callback(res);
    })
  }
  getChannelLogs (channel, options, callback) {
    var uri = '/channels/' + channel + '/messages?';
    if (options.around) uri += '&around=' + options.around;
    if (options.before) uri += '&around=' + options.before;
    if (options.after) uri += '&around=' + options.after
    if (options.alimit) uri += '&around=' + options.limit;
    this.callAPI({
      method: 'GET',
      uri: uri
    }, function (res) {
      if (callback) callback(res);
    })
  }
}

module.exports = Discord;

