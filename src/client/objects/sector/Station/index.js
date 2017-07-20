
var engine = require('engine'),
    Hud = require('../../../ui/components/HudStation');

function Station(manager, data) {
  // console.log('position is ', this.position)
  engine.Sprite.call(this, manager.game, data.chassis);
  // console.log('position is ', this.position)
  // console.log('engine.Sprite is ', engine.Sprite.key)
  // this.position.x, this.position.y

  this.name = data.name;
  this.manager = manager;
  this.data = data;

  this.socket = manager.socket;
  // config data
  this.config = data.config.station;

  this.worldPosition;
  // layer chassis
  // this.chassis = new engine.Sprite(manager.game, data.chassis + '.png');
  
  // core ship classes
  this.hud = new Hud(this);
  this.period = this.data.period;
  if(this.data.chassis === 'ubadian-station-x01'){
    this.orbit = new engine.Circle(this.data.x/4, this.data.y/4, this.data.radius);
  } else {
    this.orbit = new engine.Circle(data.x, data.y, 0);
  };
  this.pivot.set(this.width/2, this.height/2);
  this.rotation = this.data.rotation;
};

Station.prototype = Object.create(engine.Sprite.prototype);
Station.prototype.constructor = Station;

Station.prototype.boot = function() {
  this.cap = new engine.Sprite(this.game, this.data.chassis + '-cap');
  this.cap.pivot.set(this.cap.width/2, this.cap.height/2);
  this.cap.position.set(this.width/2, this.height/2);
  this.cap.rotation = global.Math.random() * global.Math.PI;

  // add cap
  this.addChild(this.cap);

  // create hud
  this.hud.create();
  // this.hud.show();

  // subscribe to updates
  this.data.on('data', this.data, this);
};

Station.prototype.data = function(data) {
  console.log('in station data. data is ', data)
  this.hud.data(data);
};

// StationManager.prototype.refresh = function(data) {
//   var sation, delta,
//       stations = this.stations,
//       update, updates = [],
//       stats;
//   for(var s in stations) {
//     station = stations[s];
//     delta = station.data.speed * (1/60) * (1/100);
//     station.period += delta;
    
//       stats = station.config.stats;
//       update = { uuid: station.uuid };

//       update.period = station.period;
//       // update health
//       if(station.health < stats.health) {
//         update.health = engine.Math.roundTo(station.health, 1);
//       }

//       // push deltas
//       // if(delta !== undefined) {
//         updates.push(update);
//       // }
    
//   }
//   if(updates.length > 0) {
//     this.sockets.emit('station/data', {
//       type: 'update', stations: updates
//     });
//   }
// };

Station.prototype.update = function() {
  var delta = this.data.speed * (1/60) * (1/100),
      rotation = delta/6;

  this.period += delta;

  // this.orbit.circumferencePoint(this.period, false, false, this.position);
  this.worldPosition = this.game.world.worldTransform.applyInverse(this.position)
  // this.game.world.worldTransform.applyInverse(this.position)
    if(this.data.chassis === 'ubadian-station-x01'){
     // console.log('station uuid is ', this.data.uuid, '(',this.position.x, this.position.y, ') world position: ', worldPosition.x, worldPosition.y)
    }
    this.socket.emit('station/data', {uuids: [this.data.uuid], position: this.worldPosition});
  // this.rotation += rotation;
  this.cap.rotation -= 0.01;
  // engine.Sprite.prototype.update.call(this);
};

Station.prototype.destroy = function(options) {
  this.manager = this.game = this.target =
    this.targeted = undefined;
  engine.Sprite.prototype.destroy.call(this, options);
};

module.exports = Station;
