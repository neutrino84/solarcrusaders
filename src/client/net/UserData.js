
var engine = require('engine'),
    EventEmitter = require('eventemitter3');

function UserData(game, data) {
  engine.Class.mixin(data, this);

  this.game = game;

  EventEmitter.call(this);
};

UserData.prototype = Object.create(EventEmitter.prototype);
UserData.prototype.constructor = UserData;

UserData.prototype.update = function(data) {
  engine.Class.mixin(data, this);

  this.emit('data', data);
};

module.exports = UserData;
