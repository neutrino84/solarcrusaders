
var engine = require('engine');

function Explosion(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.events = ship.events;

  // temporary
  this.temp = new engine.Point();

  // create hit area
  this.hit = new engine.Circle(this.ship.x, this.ship.y, this.ship.data.size/2);
};

Explosion.prototype.constructor = Explosion;

Explosion.prototype.create = function() {};

Explosion.prototype.start = function() {
  var game = this.game,
      temp = this.temp,
      events = this.events,
      ship = this.ship,
      hit = this.hit,
      rnd = this.game.rnd;

  game.emitters.glow.explosion(ship.data.size);
  game.emitters.glow.at({ center: ship.movement.position });
  game.emitters.glow.explode(1);

  game.emitters.shockwave.explosion(ship.data.size/8);
  game.emitters.shockwave.at({ center: ship.movement.position });
  game.emitters.shockwave.explode(1);

  for(var i=0; i<16; i++) {
    game.emitters.flash.explosion();
    game.emitters.flash.at({ center: ship.movement.position });
    game.emitters.flash.explode(1);
  }

  events.repeat(20, 80, function() {
    if(rnd.frac() < 0.5) {
      game.emitters.glow.burst(ship.data.size);
      game.emitters.glow.at({ center: ship.movement.position });
      game.emitters.glow.explode(1);
    }
  });

  events.repeat(40, 80, function() {
    if(rnd.frac() < 0.75) {
      game.emitters.explosion.explosion();
      game.emitters.explosion.at({ center: hit.random(false, temp) });
      game.emitters.explosion.explode(1);
    }
  });

  // this.game.emit('fx/shockwave', {
  //   object: ship,
  //   width: ship.data.size * 18,
  //   height: ship.data.size * 18,
  //   duration: 1024
  // });
};

Explosion.prototype.update = function() {
  this.hit.x = this.ship.x;
  this.hit.y = this.ship.y;
};

Explosion.prototype.destroy = function() {
  
};

module.exports = Explosion;
