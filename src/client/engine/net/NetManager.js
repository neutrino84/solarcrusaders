
var Sockets = require('socket'),
    Latency = require('./Latency');

function NetManager(game) {
  this.game = game;
  this.socket = null;
};

NetManager.prototype = {
  boot: function() {},

  connect: function() {
    this.socket = Sockets('/', {
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      timeout: 10000,
      transports: ['websocket']
    });

    // server latency
    this.latency = new Latency(this);

    // socket events
    this.socket.on('connect', this._connect.bind(this));
    this.socket.on('reconnect', this._reconnect.bind(this));
    this.socket.on('reconnecting', this._reconnecting.bind(this));
    this.socket.on('reconnect_failed', this._failed.bind(this));
    this.socket.on('disconnect', this._disconnect.bind(this));

    return this.socket;
  },

  disconnect: function() {
    this.socket.disconnect();
  },

  _connect: function() {
    console.log('socket connected');
    this.game.emit('connected')
  },

  _reconnect: function() {
    console.log('socket successfully reconnected')
  },

  _reconnecting: function(number) {
    console.log('trying to reconnect (attempt ' + number + ')');
  },

  _failed: function(data) {
    console.log('socket could not reconnect, try again later');
  },

  _disconnect: function() {
    console.log('socket disconnected');
  }
};

NetManager.prototype.constructor = NetManager;

module.exports = NetManager;
