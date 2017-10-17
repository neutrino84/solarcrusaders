var engine = require('engine');

function HotkeyManager(game) {
  this.game = game;

  this.registered = {
    'down': {},
    'up': {},
    'press': {}
  };

  // add messaging
  this.game.on('/hotkey/register', this.register, this);

  // add callbacks
  this.game.input.keyboard.addCallbacks(this, this.onDown, this.onUp, this.onPress);
};

HotkeyManager.prototype.constructor = HotkeyManager;

HotkeyManager.prototype.register = function(type, char, callback, context, args) {
  this.registered[type][char] = {
    callback: callback,
    context: context,
    args: args
  }
};

HotkeyManager.prototype.onDown = function(event, char) {
  var registered = this.registered['down'][char] || {},
      callback = registered.callback,
      context = registered.context,
      args = registered.args;
  if(callback) {
    args.unshift(char);
    callback.apply(context, args);
  }
};

HotkeyManager.prototype.onUp = function(event, char) {
  var registered = this.registered['up'][char] || {},
      callback = registered.callback,
      context = registered.context,
      args = registered.args;
  if(callback) {
    args.unshift(char);
    callback.apply(context, args);
  }
};

HotkeyManager.prototype.onPress = function(event, char) {
  var registered = this.registered['press'][char] || {},
      callback = registered.callback,
      context = registered.context,
      args = registered.args;
  if(callback) {
    args.unshift(char);
    callback.apply(context, args);
  }
};

HotkeyManager.prototype.destroy = function() {
  //..
};

module.exports = HotkeyManager;