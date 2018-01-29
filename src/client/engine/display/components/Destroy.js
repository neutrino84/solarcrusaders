var pixi = require('pixi'),
    Const = require('../../const');

function Destroy() {};

Destroy.prototype = {
  destroy: function(options) {
    if(options === undefined) {
      options = {
        children: true,
        texture: true,
        baseTexture: false
      }
    }

    if(this.parent) {
      this.parent.removeChild(this);
    }

    if(this.input) {
      this.input.destroy();
    }

    if(this.animations) {
      this.animations.destroy();
    }

    this.game.tweens.removeFrom(this);

    switch(this.type) {
      case Const.PARTICLE:
      case Const.SPRITE:
        pixi.Sprite.prototype.destroy.call(this, options);
        break;
      case Const.GRAPHICS:
        pixi.Graphics.prototype.destroy.call(this, options);
        break;
      case Const.STRIP:
        pixi.mesh.Rope.prototype.destroy.call(this, options);
        break;
    }

    this.game = this.components = 
      this.animations = this.input = undefined;
  }
};

module.exports = Destroy;
