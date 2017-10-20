
var engine = require('engine'),
    Hud = require('../../../ui/components/HudStation'),
    Explosion = require('../Ship/Explosion');

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
  // this.explosion = new Explosion(this.manager.state.shipManager.player);
  this.explosion = new Explosion(this);
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


  this.explosion.create();

  // create hud
  this.hud.create();

  this.events.start();
  // subscribe to updates
  this.data.on('data', this.refresh, this);

  // get the explosion bug out of the way
  this.explode();
};

Station.prototype.refresh = function(data) {
  this.hud.show();
  this.hud.timer && this.events.remove(this.hud.timer);
  this.hud.timer = this.events.add(2000, this.hud.hide, this.hud);
  this.hud.data(data);
};

Station.prototype.update = function() {
  // calculate movement
  if(!this.destination.isZero()) {
    var elapsed = this.game.clock.elapsed,
        d1 = this.destination.distance(this.position),
        d2 = this.rotation-(this.rotation+this.spin),
        interpolate1 = (elapsed * (this.speed / 200)) / d1,
        interpolate2 = (elapsed * (this.spin / 200)) / d2,
        destination = engine.Point.interpolate(this.position, this.destination, interpolate1, this.vector), rotation;
        if(!this.disabled){
        rotation = engine.Math.linearInterpolation([this.rotation, this.rotation+this.spin], interpolate2);
        } else {
          rotation = this.rotation;
        }
    this.position.set(destination.x, destination.y);
    this.rotation = rotation;
    this.cap.rotation = -rotation*8;
  }

  // this.events.update(this.game.clock.time);

  // update
  this.hud.update();

  // engine.Sprite.prototype.update.call(this);
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
  this.hud.hide();
  this.hud.disable();

  // this.engineCore.stop();
  // this.engineCore.show(false);
  // this.shieldGenerator.stop();
  // this.repair.stop();
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
