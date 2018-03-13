
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

NebulaCluster.prototype.create = function(density, speed, spread, color) {
  var game = this.game,
      sprites = this.sprites,
      nebula, rnd, scale;

  this.density = density || 2;
  this.speed = speed || 0.00006;
  this.spread = spread || 212.0;
  this.color = color;

  for(var i=0; i<density; i++) {
    rnd = i/(density-1);
    scale = game.rnd.realInRange(1.8, 3.6);
    nebula = new Nebula(game, rnd * 4.4 + 2.6, this.color);
    nebula.cache();
    nebula.pivot.set(512, 512);
    nebula.position.set(
      game.rnd.realInRange(-this.spread, this.spread),
      game.rnd.realInRange(-this.spread, this.spread));
    nebula.rotation = 2 * global.Math.PI * rnd;
    nebula.scale.set(scale, scale);

    sprites.push(nebula);

    this.addChild(nebula);
  }

  // lightning
  this.lightning = new pixi.Sprite();
  this.lightning.blendMode = engine.BlendMode.ADD;
  this.lightning.pivot.set(512, 512);
  this.lightning.alpha = 1.0;

  // start storm
  this.storm();

  this.addChild(this.lightning);
};

NebulaCluster.prototype.update = function() {
  var nebula,
      game = this.game,
      sprites = this.sprites,
      len = sprites.length;

  for(var i=0; i<len; i++) {
    nebula = sprites[i];
    nebula.rotation += this.speed * (this.density - i) * (i%2 != 1 ? -1 : 1);
  }
};

NebulaCluster.prototype.storm = function() {
  var nebula,
      game = this.game,
      sprites = this.sprites,
      lightning = this.lightning,
      tween;

  nebula = sprites[game.rnd.integerInRange(0, sprites.length-1)];

  game.clock.events.add(game.rnd.integerInRange(250, 3000),
    function() {
      lightning.alpha = game.rnd.realInRange(0.16, 0.48);
      lightning.texture = nebula.texture;
      lightning.rotation = nebula.rotation;
      lightning.position.copy(nebula.position);
      lightning.scale.copy(nebula.scale);

      tween = game.tweens.create(lightning);
      tween.to({ alpha: 0.0 }, game.rnd.integerInRange(250, 500), engine.Easing.Quadratic.InOut, false, 0, 0);
      tween.start();

      game.clock.events.add(game.rnd.integerInRange(500, 3000), this.storm, this);
    }, this
  );
};

module.exports = NebulaCluster;
