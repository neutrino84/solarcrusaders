var pixi = require('pixi'),
    Const = require('../const'),
    Point = require('../geometry/Point'),
    Rectangle = require('../geometry/Rectangle'),
    Core = require('./components/Core'),
    InWorld = require('./components/InWorld'),
    FixedToCamera = require('./components/FixedToCamera');

function Sprite(game, key, frame) {
  key = key || null;
  frame = frame || null;

  this.type = Const.SPRITE;

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
    'FixedToCamera',
    'LoadTexture',
    'InWorld',
    'InputEnabled',
    'Overlap'
    // 'Reset'
  ]
);

Sprite.prototype.preUpdateCore = Core.preUpdate;
Sprite.prototype.preUpdateInWorld = InWorld.preUpdate;
Sprite.prototype.preUpdateFixedToCamera = FixedToCamera.preUpdate;

Sprite.prototype.update = function() {
  this.preUpdateInWorld()
  this.preUpdateCore();
  this.preUpdateFixedToCamera();
};

Sprite.prototype.getBounds = function(matrix) {
  if(!this._currentBounds) {
    this._currentBounds = new Rectangle().copyFrom(
      pixi.Sprite.prototype.getBounds.call(this, matrix)
    );
  }
  return this._currentBounds;
};

module.exports = Sprite;
