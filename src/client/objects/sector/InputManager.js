
var engine = require('engine');

function InputManager(game) {
  this.game = game;
  this.world = game.world;

  this.input = new engine.InputHandler(this.world.static);
  this.input.start();

  this.world.static.on('inputUp', this.onInput, this);
  this.world.static.on('inputDown', this.onInput, this);
};

InputManager.prototype.constructor = InputManager;

InputManager.prototype.onInput = function(world, pointer) {
  // emit ship input
  if(pointer.button === engine.Mouse.LEFT_BUTTON) {
    this.game.emit('ship/primary', {
      type: pointer.leftButton.isDown ? 'start' : 'stop',
      target: {
        x: pointer.x,
        y: pointer.y
      }
    });
  } else if(pointer.button === engine.Mouse.RIGHT_BUTTON) {
    this.game.emit('ship/secondary', {
      type: pointer.rightButton.isDown ? 'start' : 'stop',
      target: {
        x: pointer.x,
        y: pointer.y
      }
    });
  }

  // release focus
  this.game.emit('ui/focus/release');
};

InputManager.prototype.destroy = function() {
  this.input.destroy();

  this.world.static.removeListener('onDown', this.onInput);
  this.world.static.removeListener('onUp', this.onInput);

  this.game = this.world = this.input = undefined;
};

module.exports = InputManager;
