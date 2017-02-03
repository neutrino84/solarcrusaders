var pixi = require('pixi'),
    Const = require('../const'),
    Cache = require('../load/Cache'),
    Core = require('./components/Core'),
    Destroy = require('./components/Destroy');

function Strip(game, key, points) {
  key = key || null;
  points = points || [];

  this.type = Const.STRIP;

  pixi.mesh.Rope.call(this, game.cache.getItem('__default', Cache.TEXTURE).texture, points);

  Core.init.call(this, game, key); // frame not supported
};

Strip.prototype = Object.create(pixi.mesh.Rope.prototype);
Strip.prototype.constructor = Strip;

Core.install.call(
  Strip.prototype, [
    'Mixin',
    'Destroy',
    'LoadTexture'
  ]
);

Strip.prototype.updateCore = Core.update;

Strip.prototype.update = function() {
  this.updateCore();
};

// Strip.prototype.destroy = function(destroyChildren) {
//   Destroy.prototype.destroy.call(this, destroyChildren);
//   // pixi.mesh.Rope.prototype.destroy.call(this, destroyChildren);
// };

module.exports = Strip;
