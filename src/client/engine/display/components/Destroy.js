
var pixi = require('pixi'),
    Group = require('../../core/Group');

function Destroy() {};

Destroy.prototype = {
  destroyPhase: false,

  destroy: function(destroyChildren) {
    if(this.game === null || this.destroyPhase) { return; }
    if(destroyChildren === undefined) { destroyChildren = true; }

    this.destroyPhase = true;

    // if(this.events) {
    //   this.events.onDestroy$dispatch(this);
    // }

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

    // if(this.events) {
    //   this.events.destroy();
    // }

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

    // if(this._crop) {
    //   this._crop = null;
    // }

    if(this._frame) {
      this._frame = null;
    }

    // if(Phaser.Video && this.key instanceof Phaser.Video) {
    //   this.key.onChangeSource.remove(this.resizeFrame, this);
    // }

    // if(Phaser.BitmapText && this._glyphs) {
    //   this._glyphs = [];
    // }

    this.alive = false;
    this.exists = false;
    this.visible = false;
    this.game = null;

    // in-case pixi is still going to try and
    // render it even though destroyed
    this.renderable = false;

    // pixi level destroy
    pixi.Sprite.prototype.destroy.call(this);

    this.destroyPhase = false;
    this.pendingDestroy = false;
  }
};

module.exports = Destroy;
