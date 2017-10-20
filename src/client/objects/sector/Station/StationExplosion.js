
var engine = require('engine');

function StationExplosion(station) {
  this.station = station;
  this.game = station.game;
  this.events = station.events;
  // this.playership = station.manager.state.shipManager.player
  this.temp = new engine.Point();

  // create hit area
  this.hit = new engine.Circle(this.station.width/2, this.station.height/2, this.station.data.size/2);
  console.log('station hit area is ', this.hit)
};

StationExplosion.prototype.constructor = StationExplosion;

StationExplosion.prototype.create = function() {
  
};

StationExplosion.prototype.start = function() {
  var temp = this.temp,
      events = this.events,
      station = this.station,
      hit = this.hit,
      rnd = this.game.rnd,
      manager = station.manager,
      player = manager.state.shipManager.player;

  console.log('playership is ', player)
  manager.shockwaveEmitter.explosion(player);
  // console.log(station.position.x, station.position.y)
  // station.position.x = station.position.x*4; station.position.y = station.position.y *4
  // console.log({x: station.position._x*4, y: station.position._y*4})
  // manager.shockwaveEmitter.at({ center: {x: station.position._x*4, y: station.position._y*4} });
  manager.shockwaveEmitter.at({ center: player.position });
// console.log('checkin', manager.game)
// console.log('station position is ', station.position)
  // manager.shockwaveEmitter.explode(2);
  manager.shockwaveEmitter.explode(1);

  manager.glowEmitter.explosion(player);
  // manager.glowEmitter.at({ center: {x: station.position._x*4, y: station.position._y*4} });
  manager.glowEmitter.at({ center: player.position });
  manager.glowEmitter.explode(1.3);

  events.repeat(50, 100, function() {
    if(rnd.frac() > 0.35) {
      manager.explosionEmitter.explosion(player);
      manager.explosionEmitter.at({ center: hit.random(false, temp) });
      manager.explosionEmitter.explode(2);
    }
  });

  // this.game.emit('fx/shockwave', {
  //   object: station,
  //   width: station.data.size * 18,
  //   height: station.data.size * 18,
  //   duration: 1024
  // });
};

StationExplosion.prototype.update = function() {
  this.hit.x = this.ship.x;
  this.hit.y = this.ship.y;
};

StationExplosion.prototype.destroy = function() {
  
};

module.exports = StationExplosion;
