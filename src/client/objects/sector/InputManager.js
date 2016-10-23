
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

  this.world.on('inputDown', this._onInputDown, this);
  this.world.on('inputUp', this._onInputUp, this);
  this.world.on('inputMove', this._onInputMove, this);
}

Selection.prototype.constructor = Selection;

Selection.prototype._emitInputAction = function(dataType, pointer, emitPrimary, emitSecondary) {
  var data = {
        type: dataType,
        target: {
          x: pointer.x,
          y: pointer.y
        }
      };
  if (emitPrimary) {
    this.game.emit('ship/primary', data);
  }
  if (emitSecondary) {
    this.game.emit('ship/secondary', data);
  }
};

Selection.prototype._onInputDown = function(world, pointer) {
  this._emitInputAction('start', pointer, pointer.button === engine.Mouse.LEFT_BUTTON, pointer.button === engine.Mouse.RIGHT_BUTTON);
};

Selection.prototype._onInputUp = function(world, pointer) {
  this._emitInputAction('stop', pointer, pointer.button === engine.Mouse.LEFT_BUTTON, pointer.button === engine.Mouse.RIGHT_BUTTON);
};

Selection.prototype._onInputMove = function(world, pointer) {
  this._emitInputAction('move', pointer, pointer.leftButton.isDown, pointer.rightButton.isDown);
};

Selection.prototype.destroy = function() {
  this.input.destroy();

  this.world.removeListener('inputDown', this._onInputDown);
  this.world.removeListener('inputUp', this._onInputUp);
  this.world.removeListener('inputMove', this._onInputMove);

  this.game =
    this.input = undefined;
};

module.exports = Selection;
