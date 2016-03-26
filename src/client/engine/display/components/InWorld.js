var Rectangle = require('../../geometry/Rectangle');

function InWorld() {};

InWorld.preUpdate = function() {
  var spriteInView,
      game = this.game;
  if(this.autoCull || this.checkWorldBounds) {
    this.autoCullBounds.copyFrom(this.getBounds());
    this.autoCullBounds.x += game.camera.view.x;
    this.autoCullBounds.y += game.camera.view.y;

    if(this.autoCull) {
      spriteInView = game.world.camera.view.intersects(this.autoCullBounds)

      if(this.autoCullFired && spriteInView) {
        this.autoCullFired = false;
        this.renderable = true;
        game.world.camera.totalInView++;
      } else if(!this.autoCullFired && !spriteInView) {
        this.autoCullFired = true;
        this.renderable = false;
        game.world.camera.totalInView--;
      }
    }

    if(this.checkWorldBounds) {
      if(this.outOfBoundsFired && spriteInView) {
        this.outOfBoundsFired = false;
        this.emit('enterBounds', this);
      } else if(!this.outOfBoundsFired && !spriteInView) {
        this.outOfBoundsFired = true;
        this.emit('exitBounds', this);
      }
    }
  }
};

InWorld.prototype = {
  autoCullBounds: new Rectangle(),
  autoCullFired: true,
  checkWorldBounds: false,
  outOfBoundsFired: false,

  inWorld: {
    get: function() {
      return this.game.world.bounds.intersects(this.getBounds());
    }
  }
};

module.exports = InWorld;
