
var engine = require('engine');

function Explosion(ship) {
  this.ship = ship;
  this.game = ship.game;
  this.events = ship.game.clock.events;

  this.temp = new engine.Point();

  // create hit area
  this.hit = new engine.Circle(this.ship.width/2, this.ship.height/2, this.ship.data.size/2);
};

Explosion.prototype.constructor = Explosion;

Explosion.prototype.create = function() {
  
};

Explosion.prototype.critical = function() {
  var temp = this.temp,
      events = this.events,
      ship = this.ship,
      hit = this.hit,
      manager = ship.manager;

  this.events.repeat(100, 10, function() {
    manager.explosionEmitter.small(ship);
    manager.explosionEmitter.at({ center: hit.random(false, temp) });
    manager.explosionEmitter.explode(2);
  });
};

Explosion.prototype.start = function() {
  var temp = this.temp,
      events = this.events,
      ship = this.ship,
      hit = this.hit,
      manager = ship.manager;

  manager.shockwaveEmitter.explosion(ship);
  manager.shockwaveEmitter.at({ center: ship.position });
  manager.shockwaveEmitter.explode(1);

  manager.glowEmitter.explosion(ship);
  manager.glowEmitter.at({ center: ship.position });
  manager.glowEmitter.explode(1);

  this.events.repeat(50, 200, function() {
    manager.explosionEmitter.smulder(ship);
    manager.explosionEmitter.at({ center: hit.random(false, temp) });
    manager.explosionEmitter.explode(1);
  });

  this.events.repeat(50, 20, function() {
    manager.explosionEmitter.explosion(ship);
    manager.explosionEmitter.at({ center: hit.random(false, temp) });
    manager.explosionEmitter.explode(1);
  });

  this.events.repeat(50, 40, function() {
    manager.explosionEmitter.medium(ship);
    manager.explosionEmitter.at({ center: hit.random(false, temp) });
    manager.explosionEmitter.explode(1);
  });

  this.events.repeat(50, 40, function() {
    manager.explosionEmitter.small(ship);
    manager.explosionEmitter.at({ center: hit.random(false, temp) });
    manager.explosionEmitter.explode(1);
  });

  this.game.emit('fx/shockwave', {
    position: ship.position,
    width: ship.data.size * 14,
    height: ship.data.size * 14
  });
};

Explosion.prototype.update = function() {
  this.hit.x = this.ship.x;
  this.hit.y = this.ship.y;
};

Explosion.prototype.destroy = function() {
  
};

module.exports = Explosion;
