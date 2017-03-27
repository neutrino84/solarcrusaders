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

  this.game.on('ship/player', this._player, this);
};

HotkeyManager.prototype.constructor = HotkeyManager;

HotkeyManager.prototype.init = function() { 
  console.log('in HotkeyManager init()')
};

HotkeyManager.prototype.create = function(manager) {
  this.config = this.game.cache.getJSON('item-configuration', false);
  this.manager = manager;
  this.shipManager = manager.shipManager;
  this.ships = this.shipManager.ships;
};

HotkeyManager.prototype.listener = function() {
	console.log('got to listener function')
  var player = this.player,
  	  hotkeys = this.hotkeys;
  if(player){
  	this.game.input.on('keypress', function(event, key){
	   if(hotkeys['enhancements'][key]){

	    this.game.emit('ship/enhancement/started', {
	      uuid: player.uuid,
	      enhancement: hotkeys['enhancements'][key],
	      subtype: 'basic'
	    });

	    this.game.emit('ship/enhancement/start', {
	      uuid: player.uuid,
	      enhancement: hotkeys['enhancements'][key],
	      subtype: 'basic'
	    });
	   } 
    }, this);
  };
};

HotkeyManager.prototype._player = function(ship){
  this.player = ship,
  this.enhancements = ship.config.enhancements;

  for(var e in this.enhancements){
  	var key = parseInt(e)+1;
  	// console.log(key)
  	this.hotkeys['enhancements'][key] = this.enhancements[e];
  }

  //turn on listener
  this.listener();
};

HotkeyManager.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = HotkeyManager;