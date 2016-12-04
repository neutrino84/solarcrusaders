
var engine = require('engine');

function Selection(game) {
  this.game = game;
  this.world = game.world;

  this.input = new engine.InputHandler(this.world);
  this.input.start(1);
  this.input.checkPointerOver =
    this.input.checkPointerDown = function(pointer, fastTest) {
      return true;
    };

  this.world.on('inputUp', this._onInput, this);
  this.world.on('inputDown', this._onInput, this);
};

Selection.prototype.constructor = Selection;

Selection.prototype._onInput = function(world, pointer) {
  var data = {
        type: pointer.isDown ? 'start' : 'stop',
        target: {
          x: pointer.x,
          y: pointer.y
        }
      };
  if(pointer.button === engine.Mouse.LEFT_BUTTON) {
    this.game.emit('ship/primary', data);
  } else if(pointer.button === engine.Mouse.RIGHT_BUTTON) {
    this.game.emit('ship/secondary', data);
  }
};

Selection.prototype.destroy = function() {
  this.input.destroy();
  this.world.removeListener('onDown', this._onInput);
  this.world.removeListener('onUp', this._onInput);

  this.game =
    this.input = undefined;
};

module.exports = Selection;
