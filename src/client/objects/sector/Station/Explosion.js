
var engine = require('engine');

function Explosion(station) {
  this.station = station;
  this.game = station.game;
  this.events = station.events;

  // vars
  this.temp = new engine.Point();
  this.hit = new engine.Circle(this.station.x, this.station.y, this.station.data.size);
};

Explosion.prototype.constructor = Explosion;

Explosion.prototype.create = function() {
  
};

Explosion.prototype.start = function() {
  var game = this.game,
      temp = this.temp,
      events = this.events,
      station = this.station,
      hit = this.hit,
      rnd = this.game.rnd;

  game.emitters.glow.explosion(station.data.size);
  game.emitters.glow.at({ center: station.movement.position });
  game.emitters.glow.explode(1);

  game.emitters.shockwave.slow(station.data.size);
  game.emitters.shockwave.at({ center: station.movement.position });
  game.emitters.shockwave.explode(1);

  for(var i=0; i<48; i++) {
    game.emitters.flash.large();
    game.emitters.flash.at({ center: station.movement.position });
    game.emitters.flash.explode(1);
  }

  events.repeat(20, 40, function() {
    game.emitters.glow.burst(station.data.size);
    game.emitters.glow.at({ center: station.movement.position });
    game.emitters.glow.explode(1);
  });

  events.repeat(40, 80, function() {
    game.emitters.glow.burst(station.data.size);
    game.emitters.glow.at({ center: station.movement.position });
    game.emitters.glow.explode(1);

    if(rnd.frac() < 0.5) {
      game.emitters.explosion.large();
      game.emitters.explosion.at({ center: hit.random(false, temp) });
      game.emitters.explosion.explode(1);
    }
  });

  // this.game.emit('fx/shockwave', {
  //   object: station,
  //   width: station.data.size * 18,
  //   height: station.data.size * 18,
  //   duration: 1024
  // });
};

Explosion.prototype.update = function() {
  this.hit.x = this.station.x;
  this.hit.y = this.station.y;
};

Explosion.prototype.destroy = function() {
  
};

module.exports = Explosion;
