
var engine = require('engine'),
    Hud = require('../../../ui/components/HudStation');

function Station(manager, data) {
  engine.Sprite.call(this, manager.game, data.chassis);

  this.name = data.name;
  this.manager = manager;
  this.data = data;

  // config data
  this.config = data.config.station;

  // layer chassis
  // this.chassis = new engine.Sprite(manager.game, data.chassis + '.png');
  
  // core ship classes
  this.hud = new Hud(this);
  this.period = this.data.period;
  if(this.data.chassis === 'ubadian-station-x01'){
    // console.log('station front end data is ', data)
    // var newRadius = this.game.world.worldTransform.applyInverse(this.data.radius*1.5)
    // console.log(newRadius)
    this.orbit = new engine.Circle(this.data.x/4, this.data.y/4, this.data.radius*1.5);
    // this.orbit = new engine.Circle(0, 0, this.data.radius);
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

    // this.orbit.circumferencePoint(this.period, false, false, this.position);
    // console.log(this.orbit.x, this.orbit.y, this.orbit.radius, this.data.x, this.data.y)
  console.log('orbit radius is ', this.orbit.radius)

  // add cap
  this.addChild(this.cap);

  // create hud
  this.hud.create();
  this.hud.show();

  // subscribe to updates
  this.data.on('data', this.data, this);
};

Station.prototype.data = function(data) {
  console.log('HIT STATION DATA')
  // this.period = this.data.period
  this.hud.data(data);
};

Station.prototype.update = function() {
  var delta = this.data.speed * (1/60) * (1/100),
      rotation = delta/6;

  // console.log(this.period)
  this.orbit.circumferencePoint(this.period, false, false, this.position);
  // console.log(this.orbit)
  // debugger
  // this.rotation += rotation;
  this.cap.rotation -= 0.01;

  engine.Sprite.prototype.update.call(this);
};

Station.prototype.destroy = function(options) {
  this.manager = this.game = this.target =
    this.targeted = undefined;
  engine.Sprite.prototype.destroy.call(this, options);
};

module.exports = Station;
