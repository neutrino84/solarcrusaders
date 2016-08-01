var pixi = require('pixi'),
    Const = require('../const'),
    Point = require('../geometry/Point'),
    Rectangle = require('../geometry/Rectangle'),
    Core = require('./components/Core'),
    InWorld = require('./components/InWorld');

function Sprite(game, key, frame) {
  key = key || null;
  frame = frame || null;

  this.type = Const.SPRITE;
  this.bounds = new Rectangle();

  pixi.Sprite.call(this);

  Core.init.call(this, game, key, frame);
};

Sprite.prototype = Object.create(pixi.Sprite.prototype);
Sprite.prototype.constructor = Sprite;

Core.install.call(
  Sprite.prototype, [
    // 'Angle',
    'Mixin',
    'Animation',
    'AutoCull',
    'Bounds',
    'Destroy',
    'LoadTexture',
    'InWorld',
    'InputEnabled',
    'Overlap'
    // 'Reset'
  ]
);

Sprite.prototype.preUpdateCore = Core.preUpdate;
Sprite.prototype.preUpdateInWorld = InWorld.preUpdate;

Sprite.prototype.update = function() {
  this.preUpdateInWorld()
  this.preUpdateCore();
};

Sprite.prototype.getBounds = function() {
  return this.bounds.copyFrom(pixi.Sprite.prototype.getBounds.call(this));
};

module.exports = Sprite;
