var pixi = require('pixi'),
    Const = require('../const'),
    Cache = require('../load/Cache'),
    // Point = require('../geometry/Point'),
    // Rectangle = require('../geometry/Rectangle'),
    Core = require('./components/Core'),
    InWorld = require('./components/InWorld');

function Strip(game, key, points) {
  key = key || null;
  points = points || [];

  this.points = [];

  this._hasUpdateAnimation = false;
  this._updateAnimationCallback = null;

  this.type = Const.STRIP;

  pixi.mesh.Rope.call(this,
    game.cache.getItem('__default', Cache.TEXTURE).texture, points);

  Core.init.call(this, game, key); // frame not supported
};

Strip.prototype = Object.create(pixi.mesh.Rope.prototype);
Strip.prototype.constructor = Strip;

Core.install.call(
  Strip.prototype, [
    // 'Angle',
    'Mixin',
    // 'Animation',
    // 'AutoCull',
    'Bounds',
    'Destroy',
    // 'FixedToCamera',
    'LoadTexture',
    // 'InWorld',
    // 'InputEnabled'
    // 'Reset'
  ]
);

Strip.prototype.preUpdateCore = Core.preUpdate;
Strip.prototype.preUpdateInWorld = InWorld.preUpdate;

Strip.prototype.preUpdate = function() {
  this.preUpdateInWorld()
  this.preUpdateCore();
};

Strip.prototype.update = function() {
  if(this._hasUpdateAnimation) {
    this.updateAnimation.call(this);
  }
};

Object.defineProperty(Strip.prototype, 'updateAnimation', {
  get: function () {
    return this._updateAnimation;
  },

  set: function (value) {
    if (value && typeof value === 'function') {
      this._hasUpdateAnimation = true;
      this._updateAnimation = value;
    } else {
      this._hasUpdateAnimation = false;
      this._updateAnimation = null;
    }
  }
});

module.exports = Strip;
