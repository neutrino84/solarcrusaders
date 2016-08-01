
var engine = require('engine');

function Selection(manager) {
  this.manager = manager;
  this.game = manager.game;
  this.input = game.input,

  this.input.on('onDown', this._onInput, this);
  this.input.on('onUp', this._onInput, this);
};

Selection.prototype.constructor = Selection;

Selection.prototype._onInput = function(pointer) {
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
  this.input.removeListener('onDown', this._onInput);
  this.input.removeListener('onUp', this._onInput);
  this.manager = this.game =
    this.input = undefined;
};

module.exports = Selection;
