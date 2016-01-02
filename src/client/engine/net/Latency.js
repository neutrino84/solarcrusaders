
function Latency(game) {
  this.game = game;
  this.socket = game.net.socket;
  this.timer = undefined;
  this.startTime = 0;
  this.endTime = 0;
  this.rtt = 0;

  this.socket.on('ping', this.ping.bind(this));
};

Latency.prototype.constructor = Latency;

Latency.prototype.ping = function(data) {
  this.rtt = data.rtt;
  this.socket.emit('pong');
};

module.exports = Latency;
