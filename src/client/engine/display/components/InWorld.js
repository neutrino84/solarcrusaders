var Rectangle = require('../../geometry/Rectangle');

function InWorld() {};

InWorld.preUpdate = function() {
  var spriteInView;

  // Cache the bounds if we need it
  if(this.autoCull || this.checkWorldBounds) {
    this.autoCullBounds.copyFrom(this.getBounds());

    this.autoCullBounds.x += this.game.camera.view.x;
    this.autoCullBounds.y += this.game.camera.view.y;

    if(this.autoCull) {
      // Won't get rendered but will still get its transform updated
      if(spriteInView = this.game.world.camera.view.intersects(this.autoCullBounds)) {
        this.renderable = true;
        this.game.world.camera.totalInView++;
      } else {
        this.renderable = false;
      }
    }

    if(this.checkWorldBounds) {
      // The Sprite is already out of the world bounds, so let's check to see if it has come back again
      if(this._outOfBoundsFired && spriteInView) {
        this._outOfBoundsFired = false;
        this.onEnterBounds && this.onEnterBounds();
      } else if(!this._outOfBoundsFired && !spriteInView) {
        // The Sprite WAS in the screen, but has now left.
        this._outOfBoundsFired = true;
        this.onOutOfBounds && this.onOutOfBounds();
      }
    }
  }

  return true;
};

InWorld.prototype = {
  autoCullBounds: new Rectangle(),
  checkWorldBounds: false,
  outOfBoundsKill: false,

  _outOfBoundsFired: false,

  inWorld: {
    get: function() {
      return this.game.world.bounds.intersects(this.getBounds());
    }
  }
};

module.exports = InWorld;
