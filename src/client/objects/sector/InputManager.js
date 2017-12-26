
var engine = require('engine');

function Selection(game) {
  this.game = game;
  this.world = game.world;

  this.input = new engine.InputHandler(this.world.static);
  this.input.start();

  this.world.static.on('inputUp', this._onInput, this);
  this.world.static.on('inputDown', this._onInput, this);

  
  this.shieldCheck = false;
  this.game.on('squad/shieldDestination', this._shield, this);
};

Selection.prototype.constructor = Selection;

Selection.prototype._onInput = function(world, pointer) {
  var data = {
        target: {
          x: pointer.x,
          y: pointer.y
        }
      };
  if(pointer.button === engine.Mouse.LEFT_BUTTON) {
    data.type = pointer.leftButton.isDown ? 'start' : 'stop';
    this.game.emit('ship/primary', data);
  } else if(pointer.button === engine.Mouse.RIGHT_BUTTON) {
    data.type = pointer.rightButton.isDown ? 'start' : 'stop';
    if(this.shieldCheck){
      data.shield = true;
    }
    this.game.emit('ship/secondary', data);

    this.shieldCheck = false;
  }
};

Selection.prototype._shield = function() {
  this.shieldCheck = true;
  this.game.clock.events.add(3000, function(){
    this.shieldCheck = false;
  }, this)
};

Selection.prototype.destroy = function() {
  this.input.destroy();

  this.world.static.removeListener('onDown', this._onInput);
  this.world.static.removeListener('onUp', this._onInput);

  this.game =
    this.input = undefined;
};

module.exports = Selection;
