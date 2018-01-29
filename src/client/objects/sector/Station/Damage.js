
var engine = require('engine')

function Damage(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.events = parent.events;

  // vars
  this.smoking = false;
  this.temp = new engine.Point();
  this.hit = new engine.Circle(this.parent.x, this.parent.y, this.parent.data.size);
};

Damage.prototype.constructor = Damage;

Damage.prototype.create = function() {};

Damage.prototype.critical = function() {};

Damage.prototype.smoke = function() {
  this.smoking = true;
};

Damage.prototype.update = function() {
  var game = this.game,
      parent = this.parent,
      smoking = this.smoking,
      hit = this.hit,
      rnd, count, speed;

  if(smoking && game.rnd.frac() < 0.12) {
    hit.x = parent.x;
    hit.y = parent.y;

    game.emitters.explosion.smoke(parent.data.size);
    game.emitters.explosion.at({ center: hit.random(false, this.temp) });
    game.emitters.explosion.explode(1);

    if(game.rnd.frac() < 0.04) {
      rnd = hit.random(false, this.temp);
      count = game.rnd.integerInRange(4, 6);

      game.emitters.glow.glitch();
      game.emitters.glow.at({ center: rnd });
      game.emitters.glow.explode(1);

      for(var i=0; i<count; i++) {
        game.emitters.flash.glitch();
        game.emitters.flash.at({ center: rnd });
        game.emitters.flash.explode(1);
      }
    }
  }
};

Damage.prototype.destroy = function() {
  this.parent = this.game = this.events = undefined;
};

module.exports = Damage;
