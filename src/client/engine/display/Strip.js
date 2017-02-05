var pixi = require('pixi'),
    Const = require('../const'),
    Cache = require('../load/Cache'),
    Core = require('./components/Core'),
    Destroy = require('./components/Destroy');

function Strip(game, key, points) {
  pixi.mesh.Rope.call(this, game.cache.getItem('__default', Cache.TEXTURE).texture, points || []);

  this.type = Const.STRIP;

  Core.init.call(this, game, key);
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

module.exports = Strip;
