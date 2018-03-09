
var engine = require('engine');

function Asteroid(game) {
  engine.Sprite.call(this, game, 'texture-atlas', 'asteroid-x0' + (global.Math.floor(global.Math.random() * 4) + 1) + '.png');

  this.temp = new engine.Point();

  this.angle = this.game.rnd.realInRange(-global.Math.PI, global.Math.PI);
  this.movspeed = this.game.rnd.realInRange(-0.0005, 0.0005);
  this.rotspeed = this.game.rnd.realInRange(-0.005, 0.005);
  this.orbit = this.createOrbit();

  this.scale.copy(this.createScale());
  this.pivot.set(this.texture.frame.width/2, this.texture.frame.height/2);
  this.rotation = this.angle;
};

Asteroid.prototype = Object.create(engine.Sprite.prototype);
Asteroid.prototype.constructor = Asteroid;

Asteroid.prototype.update = function() {
  engine.Sprite.prototype.update.call(this);

  if(this.visible) {
    this.orbit.circumferencePoint(this.angle, false, this.position);
    this.rotation += this.rotspeed;
    this.angle += this.movspeed;
  }
};

Asteroid.prototype.createOrbit = function() {
  var x = 2048 / 4,
      y = 2048 / 4,
      game = this.game,
      width = game.rnd.integerInRange(256, 2048),
      height = game.rnd.integerInRange(256, 2048),
      ellipse = new engine.Ellipse(x, y, width, height);
  return ellipse;
};

Asteroid.prototype.createScale = function() {
  var scale = this.game.rnd.realInRange(0.4, 1.2),
      point = { x: scale, y: scale };
  return point;
};

module.exports = Asteroid;
