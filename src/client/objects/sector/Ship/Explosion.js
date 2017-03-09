
var engine = require('engine');

function Explosion(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.events = ship.game.clock.events;
  this.temp = new engine.Point();
  this.hit = new engine.Circle(this.ship.width/2, this.ship.height/2, this.ship.details.size/2);
};

Explosion.prototype.constructor = Explosion;

Explosion.prototype.create = function() {
  
};

Explosion.prototype.start = function() {
  this.ship.manager.glowEmitter.explosion(this.ship);
  this.ship.manager.glowEmitter.at({ center: this.ship.position });
  this.ship.manager.glowEmitter.explode(1);

  this.ship.manager.glowEmitter.mini(this.ship);
  this.ship.manager.glowEmitter.at({ center: this.ship.position });
  this.ship.manager.glowEmitter.explode(3);

  this.events.repeat(50, 200, function() {
    this.ship.manager.explosionEmitter.smulder(this.ship);
    this.ship.manager.explosionEmitter.at({ center: this.hit.random(false, this.temp) });
    this.ship.manager.explosionEmitter.explode(1);
  }, this);

  this.events.repeat(50, 20, function() {
    this.ship.manager.explosionEmitter.explosion(this.ship);
    this.ship.manager.explosionEmitter.at({ center: this.hit.random(false, this.temp) });
    this.ship.manager.explosionEmitter.explode(1);
  }, this);

  this.events.repeat(50, 40, function() {
    this.ship.manager.explosionEmitter.medium(this.ship);
    this.ship.manager.explosionEmitter.at({ center: this.hit.random(false, this.temp) });
    this.ship.manager.explosionEmitter.explode(1);
  }, this);

  this.events.repeat(50, 40, function() {
    this.ship.manager.explosionEmitter.small(this.ship);
    this.ship.manager.explosionEmitter.at({ center: this.hit.random(false, this.temp) });
    this.ship.manager.explosionEmitter.explode(1);
  }, this);

  this.game.emit('fx/shockwave', {
    position: this.ship.position,
    width: this.ship.details.size * 14,
    height: this.ship.details.size * 14
  });
};

Explosion.prototype.update = function() {
  this.hit.x = this.ship.x;
  this.hit.y = this.ship.y;
};

Explosion.prototype.destroy = function() {
  
};

module.exports = Explosion;
