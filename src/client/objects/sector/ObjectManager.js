
var engine = require('engine'),
    Marker = require('./misc/Marker'),
    Movement = require('./Movement'),
    // /Users/GalvanizeComp/Desktop/solarcrusaders/src/client/objects/sector/misc/Marker.js
    Asteroid = require('./misc/Indicator');
    // Indicator = require('./misc/Indicator');
    // EnhancementManager = require('./EnhancementManager'),
    // ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    // FlashEmitter = require('./emitters/FlashEmitter'),
    // GlowEmitter = require('./emitters/GlowEmitter'),
    // ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    // FireEmitter = require('./emitters/FireEmitter'),

function ObjectManager(game) {
  this.game = game;

  this.net = game.net;
  this.socket = game.net.socket;

  // ship cache
  this.objects = {};

  // create containers
  this.objGroup = new engine.Group(game);
  this.markerCount = 0;

  this.startingPosition = null;

  this.markerPositions = {
    // botRight: [{x : 16004, y: 15494 },{ x: 15971, y: 15332 },{x: 16410, y: 15745}, {x: 15541, y: 15745}, {x: 15526, y: 16297}, {x: 16422, y: 16308}],
    // botRight: [{ x: 15990, y: 15520 }, { x: 15526, y: 16297 }, { x: 16422, y: 16308 }],
    botRight: [{ x: 15465, y: 15511 }, { x: 15991, y: 16598 }, { x: 16558, y: 15527 }],
    topRight : []
  }

  this.game.world.addAt(this.objGroup, 0);

  this.game.on('ship/player', this._player, this);
  this.game.on('create/sectorBeacon', this.createSectorBeacon, this);
  this.game.on('create/markers', this.createTutorialMarkers, this);
};

ObjectManager.prototype.constructor = ObjectManager;

ObjectManager.prototype.create = function(data) {
  var game = this.game,
      container = this.objGroup,
      objects = this.objects, object;

  switch(data.type){
    case 'marker':
    object = new Marker(this, data)
    object.id = 'marker-x0'+this.markerCount;
    this.markerCount++
    break;

    case 'yellow_circle':
    
    break;
  };

  if(object){
    // set position
    object.position.set(data.pos.x, data.pos.y);
    // display
    container.add(object);
    // boot
    object.boot();
  };

  // add object registry
  objects[object.id] = object;
  return object;
};

ObjectManager.prototype.createMovement = function(object){
  
};

ObjectManager.prototype.remove = function(data) {
  var game = this.game,
      camera = game.camera,
      objects = this.objects,
      object = objects[data.uuid];
  if(object !== undefined) {
    object.destroy();
    delete objects[object.uuid];
  }
};

// ObjectManager.prototype.objective = function(objective) {
//   var game = this.game,
//       camera = game.camera,
//       objects = this.objects,
//       object = objects[data.uuid];
//   if(object !== undefined) {
//     object.destroy();
//     delete objects[object.uuid];
//   }
// };

ObjectManager.prototype.removeAll = function() {
  var objects = this.objects;
  for(var s in objects) {
    this.remove(objects[s]);
  }
};

ObjectManager.prototype.createTutorialMarkers = function(startingPosition) {
  var game = this.game;

  this.startingPosition = startingPosition;
  for(var i =0; i<3; i++){
    this.create({type: 'marker', pos: this.markerPositions[this.startingPosition][i]})
  }
};
ObjectManager.prototype.createSectorBeacon = function (position) {
  var game = this.game;
  
  this.create({ type: 'marker', pos: { x: 2395, y: 1177 } })
  // this.startingPosition = startingPosition;
  // for (var i = 0; i < 3; i++) {
  //   this.create({ type: 'marker', pos: this.markerPositions[this.startingPosition][i] })
  // }
};

ObjectManager.prototype._player = function(ship){
  this.player = ship;

  switch(this.player.x){
    case -17000:
      this.startingPosition = 'topLeft';
    break;
    case 20000:
      this.startingPosition = 'topRight';
    break;
    case -18000:
      this.startingPosition = 'botLeft';
    break;
    case 16000:
      this.startingPosition = 'botRight';
    break;
  }
};

ObjectManager.prototype.destroy = function() {
  var game = this.game;

  // game.particles.remove(this.explosionEmitter);
  // game.particles.remove(this.flashEmitter);
  // game.particles.remove(this.glowEmitter);
  // game.particles.remove(this.shockwaveEmitter);
  // game.particles.remove(this.explosionEmitter);

  // game.world.remove(this.subGroup);
  // game.world.remove(this.objectsGroup);
  // game.world.remove(this.fxGroup);
  // game.world.remove(this.fireEmitter);
  // game.world.remove(this.explosionEmitter);
  // game.world.remove(this.flashEmitter);
  // game.world.remove(this.shockwaveEmitter);
  // game.world.remove(this.glowEmitter);
  // game.world.remove(this.indicator);

  this.removeAll();

  this.game = this.socket = undefined;
};

ObjectManager.prototype._sync = function(data) {
  // var game = this.game,
  //     netManager = this.state.netManager,
  //     objects = data.objects,
  //     length = objects.length,
  //     sync, ship, d;
  // for(var s=0; s<length; s++) {
  //   sync = objects[s];
  //   ship = this.objects[sync.uuid];

  //   if(ship) {
  //     ship.movement.plot(sync);
  //   } else {
  //     d = netManager.getShipData(sync.uuid);
  //     d && this.create(d, sync);
  //   }
  // }
};

ObjectManager.prototype._player = function(ship) {
};

ObjectManager.prototype._removed = function(ship) {
  var tween,
      game = this.game,
      s = this.objects[ship.uuid];
  if(s !== undefined) {
    this.remove(ship);
  }
};

ObjectManager.prototype._resume = function() {
  //..
};

ObjectManager.prototype._pause = function() {
  //..
};

ObjectManager.prototype._disconnect = function() {
  this.removeAll();
};

module.exports = ObjectManager;
