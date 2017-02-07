
var pixi = require('pixi'),
    engine = require('engine'),
    Nebula = require('./Nebula');

function NebulaCluster(game) {
  pixi.Container.call(this);

  this.game = game;
  this.sprites = [];

  this.pivot.set(512, 512);
};

NebulaCluster.prototype = Object.create(pixi.Container.prototype);
NebulaCluster.prototype.constructor = NebulaCluster;

NebulaCluster.prototype.create = function(density) {
  var game = this.game,
      nebula, tween, d = density/2,
      tweens = game.tweens;

  this.density = density;

  for(var i=0; i<density; i++) {
    nebula = new Nebula(game, i * 5.0);
    nebula.cache();
    nebula.pivot.set(256, 256);
    nebula.position.set(global.Math.random() * 128, global.Math.random() * 128);
    nebula.rotation = (2 * global.Math.PI / density) * i;
    nebula.scale.set(i%3+3/d, i%3+3/d)

    this.addChild(nebula);
    this.sprites.push(nebula);
  }
  
  this.lightning = new pixi.Sprite();
  this.lightning.blendMode = engine.BlendMode.ADD;
  this.lightning.pivot.set(256, 256);
  this.lightning.alpha = 0.0;

  this.lightningTween = tweens.create(this.lightning);
  this.lightningTween.to({ alpha: 0.3 }, 50, engine.Easing.Quadratic.InOut, false, 0, 0, true);

  this.addChildAt(this.lightning, 2);
};

NebulaCluster.prototype.update = function() {
  var nebula,
      rand = global.Math.random(),
      sprites = this.sprites,
      len = sprites.length;
  for(var i=0; i<len; i++) {
    nebula = sprites[i];
    nebula.rotation += 0.0005 * (this.density - i) * (i%2 != 1 ? -1 : 1);
  }
  if(!this.lightningTween.isRunning && rand > 0.99) {
    nebula = sprites[global.Math.floor(global.Math.random() * len)];
    this.lightning.texture = nebula.texture;
    this.lightning.rotation = nebula.rotation;
    this.lightning.position.copy(nebula.position);
    this.lightning.scale.copy(nebula.scale);
    this.lightningTween.start();
  }
};

module.exports = NebulaCluster;
