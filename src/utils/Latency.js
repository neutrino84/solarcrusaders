
function Latency(user) {
  this.user = user;
  this.socket = user.socket;
  this.game = user.game;

  this.elapsed = 0;
  this.rtt = 0;

  // listen to response
  this.game.on('drip', this.stop, this);
  
  // initiate ping/pong
  this.timer = this.game.clock.events.loop(2000, this.start, this);
};

Latency.prototype.constructor = Latency;

Latency.prototype.start = function() {
  this.started = this.game.clock.time
  this.socket.emit('drop');
};

Latency.prototype.stop = function() {
  this.elapsed = this.game.clock.time - this.started;
  this.rtt = this.elapsed;
};

Latency.prototype.destroy = function() {
  this.timer && this.game.clock.events.remove(this.timer);
  this.user = this.socket = this.game = undefined;
};

module.exports = Latency;
