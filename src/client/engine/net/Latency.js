
function Latency(manager) {
  this.manager = manager,
  this.game = manager.game;
  this.socket = manager.socket;

  this.socket.on('beacon', this.beacon.bind(this));
};

Latency.prototype.constructor = Latency;

Latency.prototype.beacon = function() {
  this.socket.emit('beacon');
};

module.exports = Latency;
