var pixi = require('pixi'),
    Const = require('../../const');

function Destroy() {};

Destroy.prototype = {
  destroy: function(destroyChildren) {
    if(this.game === undefined) { return; }
    if(destroyChildren === undefined) { destroyChildren = true; }

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

    var i = this.children.length;
    if(destroyChildren) {
      while(i--) {
        this.children[i].destroy(destroyChildren);
      }
    } else {
      while(i--) {
        this.removeChild(this.children[i]);
      }
    }

    switch(this.type) {
      case Const.SPRITE:
        pixi.Sprite.prototype.destroy.call(this, false);
        break;
      case Const.GRAPHICS:
        pixi.Graphics.prototype.destroy.call(this, false);
        break;
      case Const.STRIP:
        pixi.mesh.Rope.prototype.destroy.call(this, false);
        break;
    }

    this.game = this.components = 
      this.animations = this.input = undefined;
  }
};

module.exports = Destroy;
