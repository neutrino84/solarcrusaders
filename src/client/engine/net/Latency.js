
function Latency(game) {
  this.game = game;
  this.socket = game.net.socket;
  this.timer = undefined;
  this.startTime = 0;
  this.endTime = 0;
  this.rtt = 100;

  this.socket.on('pong', this.pong.bind(this));
};

Latency.prototype.constructor = Latency;

Latency.prototype.start = function() {
  this.stop();
  this.ping();
  this.timer = this.game.clock.events.loop(3000, this.ping, this);
};

Latency.prototype.stop = function() {
  this.timer && this.game.clock.events.remove(this.timer);
};

Latency.prototype.ping = function() {
  this.startTime = this.game.clock.time;
  this.socket.emit('ping');
};

Latency.prototype.pong = function() {
  this.endTime = this.game.clock.time
  this.rtt = this.endTime - this.startTime;
};

module.exports = Latency;
