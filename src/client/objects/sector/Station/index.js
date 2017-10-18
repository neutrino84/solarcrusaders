
var engine = require('engine'),
    Hud = require('../../../ui/components/HudStation');

function Station(manager, data) {
  engine.Sprite.call(this, manager.game, data.chassis);

  this.name = data.name;
  this.manager = manager;
  this.data = data;
  this.speed = data.speed;

  // config data
  this.config = data.config.station;

  // destination
  this.vector = new engine.Point();
  this.destination = new engine.Point();

  // core ship classes
  this.rotation = this.rot = data.rotation;
  this.position.set(this.data.x, this.data.y);
  this.pivot.set(this.width/2, this.height/2);

  // timer events
  this.events = new engine.Timer(this.game, false);

  this.hud = new Hud(this);
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
  this.hud.show();
  // this.hud.show();

  this.game.on('station/data', this.test, this);
  // subscribe to updates
  this.data.on('data', this.refresh, this);
};

Station.prototype.test = function(data) {
  console.log('in station test')
  // this.hud.data(data);
};

Station.prototype.refresh = function(data) {
  console.log('in station refresh')
  this.hud.data(data);
};

Station.prototype.update = function() {
  // calculate movement]
  if(!this.destination.isZero()) {
    var elapsed = this.game.clock.elapsed,
        d1 = this.destination.distance(this.position),
        d2 = this.rotation-(this.rotation+this.spin),
        interpolate1 = (elapsed * (this.speed / 200)) / d1;
        interpolate2 = (elapsed * (this.spin / 200)) / d2;
        destination = engine.Point.interpolate(this.position, this.destination, interpolate1, this.vector),
        rotation = engine.Math.linearInterpolation([this.rotation, this.rotation+this.spin], interpolate2);
    this.position.set(destination.x, destination.y);
    this.rotation = rotation;
    this.cap.rotation = -rotation*8;
  }
  // console.log('in station update. data is ', data)

  // update
  this.hud.update();

  engine.Sprite.prototype.update.call(this);
};

Station.prototype.plot = function(data) {
  this.speed = data.spd;
  this.rot = data.rot;
  this.spin = data.spn;
  this.destination.copyFrom(data.pos);
};

Station.prototype.destroy = function(options) {
  engine.Sprite.prototype.destroy.call(this, options);

  this.manager = this.game = this.target =
    this.targeted = undefined;
};

module.exports = Station;
