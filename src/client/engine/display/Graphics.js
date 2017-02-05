
var pixi = require('pixi'),
    Const = require('../const'),
    Core = require('./components/Core'),
    Destroy = require('./components/Destroy');

function Graphics(game) {
  pixi.Graphics.call(this);

  this.type = Const.GRAPHICS;

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

module.exports = Graphics;
