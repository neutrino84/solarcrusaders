var engine = require('engine'),
    Ship = require('./Ship'),
    ShipManager = require('./ShipManager'),
    EnhancementManager = require('./EnhancementManager'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter'),
    Indicator = require('./misc/Indicator');


function HotkeyManager(game) {
  this.game = game;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  this.hotkeys = {
  	'enhancements' : {},
  	'squadron' : {}
  };

  this.isBoosting = false;
  this.isShielded = false;
  this.isHealing = false;
  this.isPiercing = false;

  this.game.on('ship/player', this._player, this);
};

HotkeyManager.prototype.constructor = HotkeyManager;

HotkeyManager.prototype.init = function() { 
};

HotkeyManager.prototype.create = function(manager) {
  this.config = this.game.cache.getJSON('item-configuration', false);
  this.manager = manager;
  this.shipManager = manager.shipManager;
  this.ships = this.shipManager.ships;
};

HotkeyManager.prototype.listener = function() {
  var player = this.player,
  	  hotkeys = this.hotkeys,
      key;
  if(player){
  	this.game.input.on('keypress', function(event, key){
      console.log(key)
  	//enhancements
	   if(hotkeys['enhancements'][key]){

  		if(hotkeys['enhancements'][key] === 'booster' && this.isBoosting){return};
  		if(hotkeys['enhancements'][key] === 'heal' && this.isHealing){return};
  		if(hotkeys['enhancements'][key] === 'shield' && this.isShielded){return};
      if(hotkeys['enhancements'][key] === 'piercing' && this.isPiercing){return};

	    this.game.emit('ship/enhancement/start', {
	      uuid: player.uuid,
	      enhancement: hotkeys['enhancements'][key],
	      subtype: 'basic'
	    });

      switch(hotkeys['enhancements'][key]) {
        case 'heal':
          this.isHealing = true;
          break;
        case 'booster':
          this.isBoosting = true;
          break;
        case 'shield':
          this.isShielded = true;
          break;
        case 'piercing':
          this.isPiercing = true;
          break;
      }
	   };

     if(key === 'c'){
        //squadron hotkeys
        this.socket.emit('ship/hostile', this.player.uuid)
          // this.game.on('target/hostile', this._hostile, this)

     }
    }, this);

    this.game.on('ship/enhancement/cancelled', this._cooled, this);
  };
};

HotkeyManager.prototype._cooled = function(data){
  if(data.uuid === this.player.uuid){
    switch(data.enhancement) {
      case 'heal':
        this.isHealing = false;
        break;
      case 'booster':
        this.isBoosting = false;
        break;
      case 'shield':
        this.isShielded = false;
        break;
      case 'piercing':
        this.isPiercing = false;
        break;
    }
  }
};

HotkeyManager.prototype._player = function(ship){
  this.player = ship,
  this.enhancements = ship.config.enhancements;
  for(var e in this.enhancements){
  	var key = parseInt(e)+1;
  	// console.log(key)
  	this.hotkeys['enhancements'][key] = this.enhancements[e];
  }
  this.hotkeys['squadron']['c']

  //turn on listener
  this.listener();
};

HotkeyManager.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = HotkeyManager;