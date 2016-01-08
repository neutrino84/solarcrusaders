
function Latency(game) {
  this.game = game;
  this.socket = game.net.socket;
  this.timer = undefined;
  this.startTime = 0;
  this.endTime = 0;
  this.rtt = 0;

  this._history = [];

  this.socket.on('ping', this.ping.bind(this));
};

Latency.HISTORY_SIZE = 10;

Latency.prototype.constructor = Latency;

Latency.prototype.ping = function(data) {
  this.socket.emit('pong');
  this._compute(data);
};

Latency.prototype._compute = function(data) {
  var average = 0,
      history = this._history;
      history.push(data.rtt);
  if(history.length > Latency.HISTORY_SIZE) {
    history.shift();
  }
  for(var rtt in history) {
    average += history[rtt];
  }
  this.rtt = global.Math.round(average / history.length);
};

module.exports = Latency;
