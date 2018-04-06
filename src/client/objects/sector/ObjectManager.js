
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

  // create indicator
  // this.indicator = new Indicator(game);

  // create containers
  this.objGroup = new engine.Group(game);
  this.markerCount = 0;

  this.startingPosition = null;

  this.markerPositions = {
    botRight : [{x: 16410, y: 15745}, {x: 15541, y: 15745}, {x: 15526, y: 16297}, {x: 16422, y: 16308}],
    topRight : []
  }
  // this.objectsGroup = new engine.Group(game);
  // this.fxGroup = new engine.Group(game);
  // this.trajectoryGroup = new engine.Group(game);

  // create emitters
  // this.explosionEmitter = new ExplosionEmitter(this.game);
  // this.flashEmitter = new FlashEmitter(this.game);
  // this.glowEmitter = new GlowEmitter(this.game);
  // this.shockwaveEmitter = new ShockwaveEmitter(this.game);
  // this.fireEmitter = new FireEmitter(this.game);

  // this.game.particles.add(this.explosionEmitter);
  // this.game.particles.add(this.flashEmitter);
  // this.game.particles.add(this.glowEmitter);
  // this.game.particles.add(this.shockwaveEmitter);
  // this.game.particles.add(this.fireEmitter);

  // add objects to world
  // this.game.world.add(this.trajectoryGroup);
  this.game.world.add(this.objGroup);
  // this.game.world.add(this.objectsGroup);
  // this.game.world.add(this.fxGroup);
  // this.game.world.add(this.fireEmitter);
  // this.game.world.add(this.explosionEmitter);
  // this.game.world.add(this.flashEmitter);
  // this.game.world.add(this.shockwaveEmitter);
  // this.game.world.add(this.glowEmitter);
  // this.game.world.add(this.indicator);

  // this.trajectoryGraphics = new engine.Graphics(game);
  // this.trajectoryGroup.addChild(this.trajectoryGraphics);

  // networking
  // this.socket.on('ship/test', this._test.bind(this));

  // subscribe to messages
  // this.game.on('sector/sync', this._sync, this);
  this.game.on('ship/player', this._player, this);
  this.game.on('create/markers', this.createMarkers, this);
};

ObjectManager.prototype.constructor = ObjectManager;

ObjectManager.prototype.create = function(data) {
  var game = this.game,
      container = this.objGroup,
      objects = this.objects, object;
      // object = new Ship(this, data);

  switch(data.type){
    case 'marker':
    // data.chassis = 'squad-shield_upright'
    object = new Marker(this, data)
    object.id = 'marker-x0'+this.markerCount;
    this.markerCount++
    break;

    case 'yellow_circle':
    
    break;
    // object = new Ship(this, data)
    // object = new engine.Sprite.call(this, null, 'texture-atlas','squad-shield_upright.png')
  };

      // this.detector = new engine.Graphics();
      // this.detector.lineStyle(1, 0xffff00, 1.0);
      // this.detector.drawCircle(this.detectorCircle.x, this.detectorCircle.y, this.detectorCircle.radius);
      // this.detector.pivot.set(halfWidth, halfHeight);
      // this.detector.position.set(halfWidth + (size/2), halfHeight + (size/2));
      // this.detector.blendMode = engine.BlendMode.ADD;
      // this.detector.alpha = 0;


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

ObjectManager.prototype.createMarkers = function(startingPosition) {
  console.log('in create markers, starting position is ', startingPosition)
  var game = this.game;

  this.startingPosition = startingPosition;
  for(var i =0; i<4; i++){
    this.create({type: 'marker', pos: this.markerPositions[this.startingPosition][i]})
  }
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
