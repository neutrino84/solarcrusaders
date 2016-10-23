
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

  this.world.on('inputUp', this._onInputUpDown, this);
  this.world.on('inputDown', this._onInputUpDown, this);
  this.world.on('inputMove', this._onInputMove, this);
}

Selection.prototype.constructor = Selection;

Selection.prototype._emitInputAction = function(dataType, pointer) {
  var data = {
        type: dataType,
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

Selection.prototype._onInputUpDown = function(world, pointer) {
  this._emitInputAction(pointer.isDown ? 'start' : 'stop', pointer);
};

Selection.prototype._onInputMove = function(world, pointer) {
  this._emitInputAction('move', pointer);
};

Selection.prototype.destroy = function() {
  this.input.destroy();

  this.world.removeListener('inputDown', this._onInputUpDown);
  this.world.removeListener('inputUp', this._onInputUpDown);
  this.world.removeListener('inputMove', this._onInputMove);

  this.game =
    this.input = undefined;
};

module.exports = Selection;
