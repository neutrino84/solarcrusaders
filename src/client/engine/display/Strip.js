var pixi = require('pixi'),
    Const = require('../const'),
    Cache = require('../load/Cache'),
    Core = require('./components/Core');

function Strip(game, key, points) {
  key = key || null;
  points = points || [];

  this.points = [];

  this._hasUpdateAnimation = false;
  this._updateAnimationCallback = null;

  this.type = Const.STRIP;

  pixi.mesh.Rope.call(this, game.cache.getItem('__default', Cache.TEXTURE).texture, points);

  Core.init.call(this, game, key); // frame not supported
};

Strip.prototype = Object.create(pixi.mesh.Rope.prototype);
Strip.prototype.constructor = Strip;

Core.install.call(
  Strip.prototype, [
    'Mixin',
    'Bounds',
    'Destroy',
    'LoadTexture'
  ]
);

Strip.prototype.preUpdateCore = Core.preUpdate;

Strip.prototype.update = function() {
  this.preUpdateCore();

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
