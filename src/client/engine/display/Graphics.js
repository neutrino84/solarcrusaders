
var pixi = require('pixi'),
    Const = require('../const'),
    Core = require('./components/Core'),
    Destroy = require('./components/Destroy');

function Graphics(game) {
  this.type = Const.GRAPHICS;

  pixi.Graphics.call(this);

  Core.init.call(this, game, null, null);
};

Graphics.prototype = Object.create(pixi.Graphics.prototype);
Graphics.prototype.constructor = Graphics;

Core.install.call(Graphics.prototype, [
  'Mixin',
  'InputEnabled',
  'Destroy'
]);

Graphics.prototype.updateCore = Core.update;

Graphics.prototype.update = function() {
  this.updateCore();
};

// Graphics.prototype.destroy = function(destroyChildren) {
//   Destroy.prototype.destroy.call(this, destroyChildren);
// };

// Graphics.prototype._renderWebGL = function(renderer) {
//   if(this.glDirty) {
//     this.dirty = true;
//     this.glDirty = false;
//   }
//   renderer.setObjectRenderer(renderer.plugins[this.objectRenderer]);
//   renderer.plugins[this.objectRenderer].render(this);
// };

module.exports = Graphics;
