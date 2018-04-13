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
  this.detecting = false;
  this.shieldmaidenCooldown = false;

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/enhancement/cooled', this._cooled, this);
  this.game.on('hotkeys/refresh', this.refresh, this);
  // this.game.on('hotkeys/refresh', this.refresh, this);
  this.game.on('hotkey/shieldship', this._link, this)
};

HotkeyManager.prototype.constructor = HotkeyManager;

HotkeyManager.prototype.init = function() { 
};

HotkeyManager.prototype.create = function(manager) {
  this.config = this.game.cache.getJSON('item-configuration', false);
  this.squadManager = manager.squadManager;
  // this.playerManager = manager.playerManager;

};

HotkeyManager.prototype.listener = function(hotkey) {
  var player = this.player,
  	  hotkeys = this.hotkeys,
      key, shieldship;
      // this.hotkeys[hotkey] === 'shieldmaiden'
  if(hotkey){
    shieldship = hotkey.toString();
    this.game.input.on('keypress', function(event, key){
      if(key === shieldmaiden){
        if(this.shieldmaidenCooldown){return}
        this.game.emit('ship/player/shieldmaidenActivate', 'shieldmaidenActivate');
        this.shieldmaidenCooldown = true;
        this.game.clock.events.add(5000, function(){
          this.shieldmaidenCooldown = false;
        }, this);  
      };
    }, this)
  };
  if(player){
  	this.game.input.on('keypress', function(event, key){
  	//enhancements
    if(player.disabled){return}

  	  if(hotkeys['enhancements'][key]){
    		if(hotkeys['enhancements'][key] === 'booster' && this.isBoosting){return};
    		if(hotkeys['enhancements'][key] === 'heal' && this.isHealing){return};
    		if(hotkeys['enhancements'][key] === 'shield' && this.isShielded){return};
        if(hotkeys['enhancements'][key] === 'piercing' && this.isPiercing){return};
        if(hotkeys['enhancements'][key] === 'detect' && this.detecting){
        
          this.game.emit('squad/detectHostiles');
        };

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
          case 'detect':
            this.detecting = true;
            break;
        }
  	  };
    //squadron
      if(key.toLowerCase() === 'q'){
        console.log(this.player.x, this.player.y)
      };

      if(key.toLowerCase() === 'c'){
        console.log('this.player is ', this.player, this.player.movement.position)

        // x : 15971
        // y : 15332
        this.game.emit('hotkey/squad/closestHostile', 'closestHostile')
      };
      if(key.toLowerCase() === 'e'){
        this.game.emit('hotkey/squad/engageTarget', 'engageTarget')
      };
      if(key.toLowerCase() === 'r'){
        this.game.emit('hotkey/squad/regroup', 'regroup')
      };
      if(key.toLowerCase() === 's'){
        this.game.emit('hotkey/squad/shieldUp', 'shieldUp')
      };
      if(key.toLowerCase() === 'w'){
        this.game.emit('hotkey/squad/shieldDestination', 'shieldDestination')
        // this.game.emit('squad/shieldDestination', true)

           // this.game.emit('shieldDestination', true);
           // this.player.events.add(3000, function(){
           //   this.game.emit('shieldDestination', false);
           // }, this); 
      };
      if(key.toLowerCase() === 'd' || key === 5){
           this.game.emit('hotkey/squad/detectHostiles', 'detectHostiles')
           if(this.detecting){return};
           this.game.emit('ship/enhancement/start', {
             uuid: player.uuid,
             enhancement: hotkeys['enhancements'][5],
             subtype: 'basic'
           });
           this.detecting = true;
           this.game.clock.events.add(10000, function(){
             this.detecting = false;
           }, this);  
      };
      // if(key.toLowerCase() === '8'){
      //      this.playerManager.upgradeSystem('weapon');
      // };
      // if(key.toLowerCase() === '8'){
      //      this.playerManager.upgradeSystem('weapon');
      // };
      // if(key.toLowerCase() === '9'){
      //      this.playerManager.upgradeSystem('armor');
      // };
      // if(key.toLowerCase() === '0'){
      //      this.playerManager.upgradeSystem('engine');
      // };
    //
    }, this);
  };
};

HotkeyManager.prototype.refresh = function() {
  this.isHealing = this.isBoosting = this.isShielded = this.isPiercing = false;
};

HotkeyManager.prototype._cooled = function(data){
  if(!this.player){return}
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
      case 'detect':
        this.detecting = false;
        break;
    }
  }
};

HotkeyManager.prototype._player = function(ship){
  this.player = ship,
  this.enhancements = ship.config.enhancements;
  for(var e in this.enhancements){
  	var key = parseInt(e)+1;
  	this.hotkeys['enhancements'][key] = this.enhancements[e];
  }

  //turn on listener
  this.listener();
};

HotkeyManager.prototype._link = function(hotkey){
  this.hotkeys['squadron'][hotkey] = 'shieldship'
  //turn on listener
  this.listener(hotkey);
};

HotkeyManager.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = HotkeyManager;