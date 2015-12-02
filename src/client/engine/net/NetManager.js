
var Socket = require('socket'),
    Latency = require('./Latency');

function NetManager(game) {
  this.game = game;
};

NetManager.prototype = {
  boot: function() {
    this.connected = false;

    this.socket = Socket({
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    });

    // calc latency
    this.latency = new Latency(this.game);
    this.latency.start();

    // socket events
    this.socket.on('connect', this._connect.bind(this));
    this.socket.on('reconnecting', this._reconnecting.bind(this));
    this.socket.on('reconnect_failed', this._reconnectingFailed.bind(this));
    this.socket.on('event', this._event.bind(this));
    this.socket.on('error', this._error.bind(this));
    this.socket.on('disconnect', this._disconnect.bind(this));
  },

  connect: function() {
    this.socket.connect();
  },

  disconnect: function() {
    this.socket.disconnect();
  },

  reconnect: function() {
    this.disconnect();
    this.connect();
  },

  _connect: function() {
    this.connected = true;
    console.log('connected');
  },

  _reconnecting: function(number) {
    console.log('trying to reconnect (attempt ' + number + ')');
  },

  _reconnectingFailed: function() {
    console.log('socket could not reconnect, try again later');
  },

  _reconnect: function() {
    console.log('socket successfully reconnected');
  },

  _event: function(data) {
    console.log('event', data);
  },

  _error: function(error) {
    console.log('error', error);
  },

  _disconnect: function() {
    this.connected = false;
    console.log('socket closed');
  }
};

NetManager.prototype.constructor = NetManager;

Object.defineProperty(NetManager.prototype, 'rtt', {
  get: function() {
    return this.latency.rtt;
  }
});

Object.defineProperty(NetManager.prototype, 'ping', {
  get: function() {
    return this.latency.rtt / 2;
  }
});

module.exports = NetManager;
