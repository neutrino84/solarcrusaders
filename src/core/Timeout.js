
function Timeout(game) {
  this.game = game;
  this.loop = null;
  this.timeout = null;
};

Timeout.prototype.constructor = Timeout;

Timeout.prototype.init = function() {
  var self = this;
  this.loop = function() {
    return self.update();
  };
  this.timeout = global.setTimeout(this.loop, 0);
};

Timeout.prototype.stop = function() {
  global.clearTimeout(this.timeout);
};

Timeout.prototype.update = function() {
  this.game.update();
  this.timeout = global.setTimeout(this.loop, 0);
};

module.exports = Timeout;
