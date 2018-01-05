
var engine = require('engine');

function User(manager, data) {
  this.name = data.name;
  this.manager = manager;
  this.game = this.manager.game;
  this.playerUserObj = this.game.auth.user;
  this.data = data;
};

User.prototype = Object.create(engine.Sprite.prototype);
User.prototype.constructor = User;

User.prototype.boot = function() {
  this.data.on('data', this.refresh, this);
};

User.prototype.refresh = function(data) {
  if(data.wave){
    if(this.playerUserObj.uuid === data.uuid){
      // console.log('wave is ', data)
      this.game.auth.user.wave = data.wave
      this.game.emit('user/wave/update', data.wave)
    // console.log('data.wave, player obj is ', this.playerUserObj, 'game.auth.user is ', this.game.auth.user)
    }
  }
  if(data.ship){
    // console.log('data.ship', data)
    this.playerUserObj.ship = data.ship;
    this.game.clock.events.add(100, function(){
      this.game.emit('user/wave/update', data.wave)
    }, this)
    // debugger
  }
};

User.prototype.update = function() {
};

User.prototype.destroy = function(options) {
};

module.exports = User;
