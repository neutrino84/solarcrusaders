
var engine = require('engine'),
    Movement = require('../Movement'),
    MarkerSelector = require('./MarkerSelector');

function Marker(manager, data) {
  
  // engine.Sprite.call(this, manager.game, 'texture-atlas','squad-shield_upright.png')

  engine.Sprite.call(this, manager.game, 'beacon-cap')
  // .call(this, manager.game, 'texture-atlas','squad-shield_upright.png');

  this.manager = manager;
  this.data = data;
  this.speed = data.speed;
  this.selector = new MarkerSelector(this);
  // this.movement = new Movement(this);
  this.rotation = 1;
  this.position.set(this.data.pos.x, this.data.pos.y);
    // console.log('marker data.rotation is ', this.rotation, 'data is ', data);
    
  // this.rotation = this.rot = data.rotation;
  // this.position.set(this.data.x, this.data.y);
  this.pivot.set(this.width / 2, this.height / 2);

  // timer events
  
  // this.position.set(this.data.x, this.data.y);

  this.events = new engine.Timer(this.game, false);

};

Marker.prototype = Object.create(engine.Sprite.prototype);
Marker.prototype.constructor = Marker;

Marker.prototype.boot = function() {
  this.selector.create();

  this.cap = new engine.Sprite(this.game, 'beacon');
  this.cap.pivot.set(this.cap.width / 2, this.cap.height / 2);
  this.cap.position.set(this.width / 2, this.height / 2);
  this.cap.rotation = global.Math.random() * global.Math.PI;
  // console.log(this)

  // this.explosion.create();

  // add cap
  this.addChild(this.cap);
};

Marker.prototype.update = function () {
    var elapsed = this.game.clock.elapsed;
      var d2 = this.rotation - (this.rotation-0.1);

      var interpolate2 = (elapsed * (0.1 / 200)) / d2;
      var rotation = engine.Math.linearInterpolation([this.rotation, this.rotation], interpolate2);

      this.rotation += 0.01
      this.cap.rotation -= 0.01;
  this.events.update(this.game.clock.time);
  engine.Sprite.prototype.update.call(this);
};


module.exports = Marker;
