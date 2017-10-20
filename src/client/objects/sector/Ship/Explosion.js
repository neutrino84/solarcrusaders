
var engine = require('engine');

function Explosion(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.events = ship.events;
  this.state = ship.manager.state;

  this.temp = new engine.Point();

  // create hit area
  this.hit = new engine.Circle(this.ship.width/2, this.ship.height/2, this.ship.data.size/2);
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

  state.shockwaveEmitter.explosion();
  state.shockwaveEmitter.at({ center: ship.position });
  state.shockwaveEmitter.explode(2);

  state.glowEmitter.explosion(ship.size * 2.0);
  state.glowEmitter.at({ center: ship.position });
  state.glowEmitter.explode(3);

  events.repeat(50, 100, function() {
    if(rnd.frac() > 0.25) {
      state.explosionEmitter.explosion(ship.size);
      state.explosionEmitter.at({ center: hit.random(false, temp) });
      state.explosionEmitter.explode(2);
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
