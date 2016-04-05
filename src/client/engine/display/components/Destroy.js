
var pixi = require('pixi'),
    Group = require('../../core/Group');

function Destroy() {};

Destroy.prototype = {
  destroyPhase: false,

  destroy: function(destroyChildren) {
    if(this.game === null || this.destroyPhase) { return; }
    if(destroyChildren === undefined) { destroyChildren = true; }

    this.destroyPhase = true;

    if(this.parent) {
      if(this.parent instanceof Group) {
        this.parent.remove(this);
      } else {
        this.parent.removeChild(this);
      }
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

    if(this._frame) {
      this._frame = null;
    }

    this.exists = false;
    this.visible = false;
    this.game = null;

    this.renderable = false;

    pixi.Sprite.prototype.destroy.call(this);

    this.destroyPhase = false;
    this.pendingDestroy = false;
  }
};

module.exports = Destroy;
