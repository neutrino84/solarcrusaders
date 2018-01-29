
var engine = require('engine'),
    Selector = require('./Selector'),
    Explosion = require('./Explosion'),
    Damage = require('./Damage'),
    HudStation = require('../../../ui/components/HudStation');

function Station(manager, data) {
  engine.Sprite.call(this, manager.game, data.chassis);

  this.name = data.name;
  this.manager = manager;
  this.data = data;

  this.config = data.config.station;

  // convenience vars
  this.uuid = data.uuid;
  this.disabled = data.disabled;

  // defaults
  this.speed = 0;
  this.step = 0;
  this.spin = 0;
  this.period = data.period;
  this.rotation = this.rot = data.rotation;
  this.pivot.set(this.width/2, this.height/2);

  this.last = new engine.Point();
  this.direction = new engine.Point();
  this.orbit = new engine.Circle(this.data.x, this.data.y, this.data.radius);
  this.orbit.circumferencePoint(this.period, false, false, this.position);
  this.circumference = this.orbit.circumference();
  this.movement = {
    direction: this.direction,
    position: this.position
  };

  // station timed events
  this.events = new engine.Timer(this.game, false);

  // helper  classes
  this.hud = new HudStation(this);
  this.selector = new Selector(this);
  this.explosion = new Explosion(this);
  this.damage = new Damage(this);
};

Station.prototype = Object.create(engine.Sprite.prototype);
Station.prototype.constructor = Station;

Station.STEP_SIZE = 1/6;
Station.CAP_ROTATION = -0.002;

Station.prototype.create = function() {
  this.cap = new engine.Sprite(this.game, this.data.chassis + '-cap');
  this.cap.pivot.set(this.cap.width/2, this.cap.height/2);
  this.cap.position.set(this.width/2, this.height/2);
  this.cap.rotation = global.Math.random() * global.Math.PI;

  // add cap
  this.addChild(this.cap);

  // create helpers
  this.hud.create();
  this.selector.create();
  this.explosion.create();
  this.damage.create();

  // start events
  this.events.start();

  // first refresh
  this.refresh(this.data);

  // subscribe to updates
  this.data.on('data', this.refresh, this);
};

Station.prototype.refresh = function(data) {
  // update hud
  this.hud.data(data);

  // set disabled state
  if(data.disabled === true) {
    if(data.disabled !== this.disabled) {
      this.explosion.start();
    }
    this.disable();
  } else if(data.disabled === false) {
    this.enable();
  }
};

Station.prototype.update = function() {
  // station orbital position
  this.last.set(this.position.x, this.position.y);
  this.orbit.circumferencePoint(this.period, false, false, this.position);
  this.direction.set(
    this.last.x-this.position.x,
    this.last.y-this.position.y);
  this.period += this.step;

  // station rotation
  this.rotation += this.spin;

  // disabled
  if(!this.disabled) {
    this.cap.rotation += Station.CAP_ROTATION;
  } else {
    this.cap.rotation += Station.CAP_ROTATION/4.0;
  }

  // update
  this.hud.update();
  this.explosion.update();
  this.damage.update();
  this.selector.update();

  // update events
  this.events.update(this.game.clock.time);

  // update inherited
  engine.Sprite.prototype.update.call(this);
};

Station.prototype.plot = function(data) {
  this.speed = data.spd;
  this.period = data.prd;
  this.rot = data.rot;
  this.step = data.spd * Station.STEP_SIZE;
  this.spin = data.spn * Station.STEP_SIZE;
};

Station.prototype.enable = function() {
  this.disabled = false;

  // helpers
  this.hud.enable();
  this.hud.show();
  this.selector.show();
};

Station.prototype.disable = function() {
  var children = this.children,
      child;

  // set disabled
  this.disabled = true;
  this.tint = 0x888888;

  // helpers
  this.hud.disable();
  this.hud.hide();
  this.selector.hide();
  this.damage.smoke();

  for(var i=0; i<children.length; i++) {
    child = children[i];
    child.tint = 0x888888;
  }
};

Station.prototype.destroy = function(options) {
  // remove timers
  this.events.destroy();

  // stop listening to data
  this.data.removeListener('data', this.data);

  // helpers
  this.hud.destroy();
  this.selector.destroy();
  this.explosion.destroy();
  this.damage.destroy();

  engine.Sprite.prototype.destroy.call(this, options);

  this.manager = this.data = this.config = undefined;
};

module.exports = Station;
