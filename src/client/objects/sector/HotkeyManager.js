
var engine = require('engine');

function HotkeyManager(game) {
  this.game = game;

  // registered
  // key presses
  this.registered = {
    'press': {}
  };

  // register
  this.game.emit('ui/focus/register', this);

  // add messaging
  this.game.on('ui/hotkey/register', this.register, this);
};

HotkeyManager.prototype.constructor = HotkeyManager;

HotkeyManager.prototype.focus = function() {
  this.game.input.on('keypress', this.keypress, this); 
};

HotkeyManager.prototype.blur = function() {
  this.game.input.removeListener('keypress', this.keypress, this); 
};

HotkeyManager.prototype.register = function(type, char, callback, context, args) {
  this.registered[type][char] = {
    callback: callback,
    context: context,
    args: args
  }
};

HotkeyManager.prototype.keypress = function(event, char) {
  var registered = this.registered['press'][char] || {},
      callback = registered.callback,
      context = registered.context,
      args = registered.args || [];
  if(callback && context) {
    callback.call(context, event, char);
  }
};

HotkeyManager.prototype.destroy = function() {
  // remove
  // listener
  this.blur();

  // reset registered
  // key presses
  this.registered = {
    'press': {}
  };
};

module.exports = HotkeyManager;