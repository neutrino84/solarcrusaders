
var Socket = require('socket'),
    Latency = require('./Latency');

function NetManager(game) {
  this.game = game;
};

NetManager.prototype = {
  boot: function() {
    this.connected = false;

    this.socket = Socket('/', {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 10000,
      transports: ['websocket']
    });

    this.latency = new Latency(this);

    // socket events
    this.socket.on('connect', this._connect.bind(this));
    this.socket.on('reconnect', this._reconnect.bind(this));
    this.socket.on('reconnecting', this._reconnecting.bind(this));
    this.socket.on('connect_timeout', this._reconnectingFailed.bind(this));
    this.socket.on('reconnect_error', this._reconnectingFailed.bind(this));
    this.socket.on('reconnect_failed', this._reconnectingFailed.bind(this));
    this.socket.on('event', this._event.bind(this));
    this.socket.on('error', this._error.bind(this));
    this.socket.on('disconnect', this._disconnect.bind(this));
    this.socket.on('disconnecting', this._disconnecting.bind(this));
  },

  connect: function() {
    this.socket.connect();
  },

  disconnect: function() {
    this.socket.disconnect();
  },

  _connect: function() {
    this.connected = true;
    console.log('initial socket connection');
  },

  _reconnect: function() {
    this.connected = true;
    console.log('socket successfully reconnected')
  },

  _reconnecting: function(number) {
    console.log('trying to reconnect (attempt ' + number + ')');
  },

  _reconnectingFailed: function(data) {
    console.log('socket could not reconnect, try again later');
  },

  _event: function(data) {
    console.log('event', data);
  },

  _error: function(error) {
    console.log('error', error);
  },

  _disconnect: function() {
    this.connected = false;
  },

  _disconnecting: function() {
    console.log('disconnecting socket');
  }
};

NetManager.prototype.constructor = NetManager;

Object.defineProperty(NetManager.prototype, 'rtt', {
  get: function() {
    return this.latency.rtt;
  }
});

module.exports = NetManager;
