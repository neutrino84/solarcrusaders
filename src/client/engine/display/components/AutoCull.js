
function AutoCull() {};

AutoCull.prototype = {
  autoCull: false,

  inCamera: {
    get: function() {
      if(!this.autoCull && !this.checkWorldBounds) {
        this._bounds.copyFrom(this.getBounds());
        this._bounds.x += this.game.camera.view.x;
        this._bounds.y += this.game.camera.view.y;
      }
      return this.game.world.camera.view.intersects(this._bounds);
    }
  }
};

module.exports = AutoCull;
