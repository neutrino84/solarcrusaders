
function Latency(user) {
  this.user = user;
  this.socket = user.socket;
  this.game = user.game;

  this.started = 0;
  this.rtt = 0;
};

Latency.PING_INTERVAL = 3000;

Latency.prototype.constructor = Latency;

Latency.prototype.connect = function(socket) {
  // update reference
  this.socket = socket;
  this.started = 0;
  this.rtt = 0;

  // listen to beacon
  this.socket.on('beacon', this.beacon.bind(this));

  // set ping timer
  this.game.clock.events.loop(Latency.PING_INTERVAL, this.ping, this);
};

Latency.prototype.ping = function(data) {
  this.started = this.game.clock.time;
  this.socket.emit('beacon');
};

Latency.prototype.beacon = function(data) {
  this.rtt = this.game.clock.time - this.started;
  this.started = this.game.clock.time;
};

module.exports = Latency;
