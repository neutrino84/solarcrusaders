
function Focus(game) {
  this.game = game;

  // focusable
  this.focused = null;
  this.focusable = [];

  // subscribe to messaging
  this.game.on('ui/focus/register', this.register, this);
  this.game.on('ui/focus/capture', this.capture, this);
  this.game.on('ui/focus/release', this.release, this);
};

Focus.prototype.register = function(focus) {
  var focusable = this.focusable;
      focusable.push(focus);
  if(focusable.length == 1) {
    this.capture(focus);
  }
};

Focus.prototype.capture = function(focus) {
  var layer,
      focused = this.focused,
      focusable = this.focusable,
      index = focusable.indexOf(focus);
  if(index >= 0 && focused != focus) {
    for(var i=0; i<focusable.length; i++) {
      layer = focusable[i];

      // update focus state 
      // through the chain
      if(focus == layer) {
        layer.focus();
      } else {
        layer.blur();
      }
    }

    // set focused
    this.focused = focus;
  }
};

Focus.prototype.release = function() {
  this.capture(this.focusable[0]);
};

module.exports = Focus;
