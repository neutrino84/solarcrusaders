
function Latency(manager) {
  this.manager = manager,
  this.game = manager.game;
  this.socket = manager.socket;
  this.rtt = 0;

  this.socket.on('drop', this.pong.bind(this));
};

Latency.prototype.constructor = Latency;

Latency.prototype.pong = function(data) {
  this.socket.emit('drip');
};

module.exports = Latency;
