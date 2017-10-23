
var engine = require('engine');

function Explosion(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.events = ship.events;
  this.state = ship.manager.state;

  this.temp = new engine.Point();

  // create hit area
  this.hit = new engine.Circle(this.ship.x, this.ship.y, this.ship.data.size/2);
};

Explosion.prototype.constructor = Explosion;

Explosion.prototype.create = function() {
  
};

Explosion.prototype.start = function() {
  var temp = this.temp,
      events = this.events,
      ship = this.ship,
      hit = this.hit,
      rnd = this.game.rnd,
      state = this.state;

  state.glowEmitter.explosion(ship.data.size);
  state.glowEmitter.at({ center: ship.movement.position });
  state.glowEmitter.explode(1);

  events.repeat(20, 50, function() {
    state.glowEmitter.burst(ship.data.size);
    state.glowEmitter.at({ center: ship.movement.position });
    state.glowEmitter.explode(1);
  });

  state.shockwaveEmitter.explosion(ship.data.size/8);
  state.shockwaveEmitter.at({ center: ship.movement.position });
  state.shockwaveEmitter.explode(1);

  events.repeat(30, 50, function() {
    if(rnd.frac() > 0.2) {
      state.explosionEmitter.explosion();
      state.explosionEmitter.at({ center: hit.random(undefined, temp) });
      state.explosionEmitter.explode(rnd.frac() > 0.5 ? 1 : 2);
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
