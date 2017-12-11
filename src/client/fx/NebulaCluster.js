
var pixi = require('pixi'),
    engine = require('engine'),
    Nebula = require('./Nebula');

function NebulaCluster(game) {
  pixi.Container.call(this);

  this.game = game;
  this.sprites = [];
  this.tweens = [];

  this.pivot.set(512, 512);
};

NebulaCluster.prototype = Object.create(pixi.Container.prototype);
NebulaCluster.prototype.constructor = NebulaCluster;

NebulaCluster.prototype.create = function(density, speed, spread, color) {
  var game = this.game,
      sprites = this.sprites,
      tweens = this.tweens,
      nebula, tween, rnd;

  this.density = density || 2;
  this.speed = speed || 0.00006;
  this.spread = spread || 212.0;
  this.color = color;

  for(var i=0; i<density; i++) {
    rnd = i/(density-1);
    nebula = new Nebula(game, rnd * 4.4 + 2.6, this.color);
    nebula.cache();
    nebula.pivot.set(512, 512);
    nebula.position.set(
      game.rnd.realInRange(-this.spread, this.spread),
      game.rnd.realInRange(-this.spread, this.spread));
    nebula.rotation = 2 * global.Math.PI * rnd;
    nebula.scale.set(2.4*rnd+1.4, 2.4*rnd+1.4);

    sprites.push(nebula);
    tweens.push(tween);

    this.addChild(nebula);
  }
  
  // this.lightning = new pixi.Sprite();
  // this.lightning.blendMode = engine.BlendMode.ADD;
  // this.lightning.pivot.set(256, 256);
  // this.lightning.alpha = 0.0;

  // this.lightningTween = tweens.create(this.lightning);
  // this.lightningTween.to({ alpha: 0.3 }, 50, engine.Easing.Quadratic.InOut, false, 0, 0, true);

  // this.addChildAt(this.lightning, 2);
};

NebulaCluster.prototype.update = function() {
  var nebula,
      rand = global.Math.random(),
      sprites = this.sprites,
      len = sprites.length;
  for(var i=0; i<len; i++) {
    nebula = sprites[i];
    nebula.rotation += this.speed * (this.density - i) * (i%2 != 1 ? -1 : 1);
  }
  // if(!this.lightningTween.isRunning && rand > 0.99) {
    // nebula = sprites[global.Math.floor(global.Math.random() * len)];
    // this.lightning.texture = nebula.texture;
    // this.lightning.rotation = nebula.rotation;
    // this.lightning.position.copy(nebula.position);
    // this.lightning.scale.copy(nebula.scale);
    // this.lightningTween.start();
  // }
};

module.exports = NebulaCluster;
