
var Point = require('../../geometry/Point');

function FixedToCamera() {};

FixedToCamera.preUpdate = function () {
  var game = this.game;
  if(this.fixedToCamera) {
    this.position.x = game.camera.x;
    this.position.y = game.camera.y;
  }
};

FixedToCamera.prototype = {

  _fixedToCamera: false,

  fixedToCamera: {
    get: function () {
      return this._fixedToCamera;
    },

    set: function (value) {
      if(value) {
        this._fixedToCamera = true;
        this.cameraOffset.set(this.x, this.y);
      } else {
        this._fixedToCamera = false;
      }
    }
  },

  cameraOffset: new Point()

};

module.exports = FixedToCamera;
