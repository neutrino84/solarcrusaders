
var engine = require('engine');

function Focus(game) {
  this.game = game;

  // chain
  this._objects = [];

  // subscribe to messaging
  this.game.on('gui/focus/retain', this._retain, this);
  this.game.on('gui/focus/release', this._release, this);
};

Focus.prototype.constructor = Focus;

Focus.prototype._retain = function(object) {
  var objects = this._objects,
      last = objects.length-1,
      index = objects.indexOf(object),
      focussed = object,
      blurred = last >= 0 ? this._objects[last] : null;
  if(focussed) {
    // update chain
    if(index == -1) {
      objects.push(focussed);
    }
    
    // blur / focus
    if(blurred && !blurred._blurWasCalled) {
      blurred.blur && blurred.blur();
      blurred._blurWasCalled = true;
    }
    focussed.focus && focussed.focus();
    focussed._blurWasCalled = false;
  }
};

Focus.prototype._release = function(object) {
  var objects = this._objects,
      last = objects.length-1,
      index = objects.indexOf(object),
      focussed = objects[last] === object ? objects[objects.length-2] : null,
      blurred = object;
  if(blurred && index >= 0) {
    // update chain
    objects.splice(index, 1);

    // blur / focus
    if(!blurred._blurWasCalled) {
      blurred.blur && blurred.blur();
      blurred._blurWasCalled = true;
    }
    if(focussed) {
      focussed.focus && focussed.focus();
      focussed._blurWasCalled = false;
    }
  }
};
    
module.exports = Focus;
