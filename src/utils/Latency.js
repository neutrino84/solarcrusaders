
function Latency(user) {
  this.user = user;
  this.socket = user.socket;
  this.game = user.game;

  this.elapsed = 0;
  this.started = 0;
  this.history = [];

  // set ping timer
  this.game.clock.events.loop(Latency.PING_INTERVAL, this.ping, this);
};

Latency.PING_INTERVAL = 500;

Latency.prototype.constructor = Latency;

Latency.prototype.connect = function(socket) {
  // update reference
  this.socket = socket;
  this.started = 0;
  this.rtt = 0;

  // listen to beacon
  this.socket.on('beacon', this.beacon.bind(this));
};

Latency.prototype.ping = function(data) {
  this.started = this.game.clock.time;
  this.socket.emit('beacon');
};

Latency.prototype.beacon = function(data) {
  // compute elapsed time
  this.elapsed = this.game.clock.time - this.started;
  this.started = this.game.clock.time;
  
  // average rtt
  this.history.unshift(this.elapsed);
  this.history = this.history.slice(0, global.Math.min(this.history.length, 6));
  this.rtt = this.average();
};

Latency.prototype.average = function() {
  var total = 0,
      history = this.history;
  for(var i=0; i<history.length; i++) {
    total += history[i];
  }
  return total / history.length;
};

module.exports = Latency;
