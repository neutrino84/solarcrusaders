var pixi = require('pixi'),
    Const = require('../const'),
    Point = require('../geometry/Point'),
    Core = require('./components/Core'),
    Destroy = require('./components/Destroy');

function Sprite(game, key, frame) {
  pixi.Sprite.call(this);

  this.type = Const.SPRITE;

  Core.init.call(this, game, key, frame);
};

Sprite.prototype = Object.create(pixi.Sprite.prototype);
Sprite.prototype.constructor = Sprite;

Core.install.call(
  Sprite.prototype, [
    'Mixin',
    'Animation',
    'Destroy',
    'LoadTexture',
    'InputEnabled'
  ]
);

Sprite.prototype.updateCore = Core.update;

Sprite.prototype.update = function() {
  this.updateCore();
};

Sprite.prototype.cache = function(clear) {
  var renderer = this.game.renderer,
      renderTexture = pixi.RenderTexture.create(this.width, this.height);
  
  // renderer.currentRenderer.flush();
  renderer.render(this, renderTexture, clear || false);

  this.texture = renderTexture;
  this._cached = true;
};

Sprite.prototype.uncache = function() {
  this._cached = false;
};

module.exports = Sprite;
