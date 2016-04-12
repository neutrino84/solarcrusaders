
function State() {
  this.game = null;
  this.key = '';
};

State.prototype = {
  init: function(args) {},

  preload: function() {},

  loadUpdate: function() {},

  loadRender: function() {},

  create: function() {},

  update: function() {},

  preRender: function() {},

  resize: function() {},

  paused: function() {},

  resumed: function() {},

  pauseUpdate: function() {},

  shutdown: function() {}
};

State.prototype.constructor = State;

module.exports = State;
