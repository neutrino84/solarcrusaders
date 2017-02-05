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

module.exports = Sprite;
