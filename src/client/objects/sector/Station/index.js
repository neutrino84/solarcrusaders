
var engine = require('engine'),
    Hud = require('../../../ui/components/Hud'),
    Explosion = require('../Ship/Explosion');

function Station(manager, data) {
  engine.Sprite.call(this, manager.game, data.chassis);

  this.name = data.name;
  this.manager = manager;
  this.data = data;
  this.speed = data.speed;

  // config data
  this.config = data.config.station;

  // timer events
  this.events = new engine.Timer(this.game, false);

  // core ship classes
  this.rotation = this.rot = data.rotation;
  this.position.set(this.data.x, this.data.y);
  this.pivot.set(this.width/2, this.height/2);

  // destination
  this.vector = new engine.Point();
  this.destination = new engine.Point();
  this.direction = new engine.Point();
  this.movement = {
    direction: this.direction,
    position: this.position
  };
  
  this.explosion = new Explosion(this);
  // console.log('explosion is ', this.explosion)
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


  this.explosion.create();

  // add cap
  this.addChild(this.cap);

  // create hud
  this.hud.create();
  // this.hud.show();

  // start events
  this.events.start();

  // subscribe to updates
  this.data.on('data', this.refresh, this);
};

Station.prototype.refresh = function(data) {
  if(data.damage){
    this.hud.show()
    this.hud.timer && this.events.remove(this.hud.timer);
    this.hud.timer = this.events.add(1500, this.hud.hide, this.hud);
  }
  this.hud.data(data);
};

Station.prototype.update = function() {
  // calculate movement]
  if(!this.destination.isZero()) {
    var elapsed = this.game.clock.elapsed,
        d1 = this.destination.distance(this.position),
        d2 = this.rotation-(this.rotation+this.spin),
        interpolate1 = (elapsed * (this.speed / 200)) / d1,
        interpolate2 = (elapsed * (this.spin / 200)) / d2,
        destination = engine.Point.interpolate(this.position, this.destination, interpolate1, this.vector),
        rotation = engine.Math.linearInterpolation([this.rotation, this.rotation+this.spin], interpolate2);
    this.direction.set(this.destination.x - destination.x, this.destination.y - destination.y);
    this.position.set(destination.x, destination.y);
    this.rotation = rotation;
    this.cap.rotation = -rotation*8;
    this.events.update(this.game.clock.time);
  }

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

Station.prototype.disable = function() {
  this.disabled = true;
  this.tint = 0x333333;
  this.cap.tint = 0x333333;
  this.hud.disable();
};

Station.prototype.explode = function() {
  this.explosion.start();
};

Station.prototype.destroy = function(options) {
  engine.Sprite.prototype.destroy.call(this, options);

  this.manager = this.game = this.target =
    this.targeted = undefined;
};

module.exports = Station;
