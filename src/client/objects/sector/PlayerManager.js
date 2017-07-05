var engine = require('engine'),
    Ship = require('./Ship'),
    pixi = require('pixi'),
    client = require('client')
    EnhancementManager = require('./EnhancementManager'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter'),
    Indicator = require('./misc/Indicator');

function PlayerManager(game) {
  this.game = game;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  // this.shipNetManager = game.states.current.shipNetManager;
  // this.enhancementManager = new EnhancementManager(this);

  // player
  this.player = null;
  this.chassis = null;
  this.stockWeapons = null;

  // killpoints
  this.killpoints = 0;
  this.credits = 0;
  this.upgrade = {
    1: 50,
    2: 1500,
    3: 6000,
    4: 13000,
    5: 60000,
    currentTier : 1
  };
  this.systemLevels = {
    weapon: 1,
    armor: 1,
    engine: 1
  };
  this.upgradeAvailable = false;

  this.game.on('ship/player', this._player, this);
  this.game.on('killpoints', this.playerKillpoints, this);

  //^ needs to be a private message listener from player (this came from front-end ship index.js)
  // ship.user.socket.emit? 
};

PlayerManager.prototype.constructor = PlayerManager;

PlayerManager.prototype.create = function(sectorState) {
  this.manager = sectorState.shipManager;
  this.ships = this.manager.ships;
};

PlayerManager.prototype.playerKillpoints = function(socket, killpoints) {
  var curTier = this.upgrade.currentTier,
      threshold = this.upgrade[curTier];

  this.killpoints += killpoints;
  console.log('PLAYERS KILLPOINTS ARE: ', this.killpoints)
  
  if(this.killpoints > threshold){
    console.log('upgrade available')
    this.upgradeAvailable = true;
    this.upgradeAvailableFlasherStart();
  }
};

PlayerManager.prototype.upgradeSystem = function(type) {
  var killpoints = this.killpoints,
      available = false,
      curTier = this.upgrade.currentTier,
      threshold = this.upgrade[curTier],
      ship = this.player;

  if(this.upgradeAvailable){
    switch(type) {
      case 'weapon':
        var hardpoints = ship.data.hardpoints,
            newWeaponsArray = [],
            newWeaponsObj = {},
            nextWeaponLevel = this.systemLevels.weapon+1,
            stockWeapons = this.stockWeapons,
            newWeaponData, slot;

        // set current weapon cap
        if(nextWeaponLevel > 2){
          nextWeaponLevel = 2;
        };

        for(var b = 0; b < Object.keys(stockWeapons).length; b++){
          newWeaponData = client.ItemConfiguration['hardpoint'][this.stockWeapons[b].default.type][this.stockWeapons[b].default.subtype+nextWeaponLevel];

          var copy = newWeaponData.constructor();

          for (var attr in newWeaponData) {
            if (newWeaponData.hasOwnProperty(attr)) copy[attr] = newWeaponData[attr];
          }
          newWeaponsObj[b] = copy;
          newWeaponsObj[b].slot = b;

          newWeaponsArray[b] = {};

          newWeaponsArray[b].default = {};
          newWeaponsArray[b].default.type = newWeaponData.type;
          newWeaponsArray[b].default.subtype = newWeaponData.subtype;
          newWeaponsArray[b].pivot = stockWeapons[b].pivot;
          newWeaponsArray[b].position = stockWeapons[b].position;
          newWeaponsArray[b].type = stockWeapons[b].type;

          
        };

        // update backend      
        this.socket.emit('ship/upgrade/hardpoints', {uuid: ship.uuid, hardpoints: newWeaponsArray});
    
        //update frontend
        this.player.targetingComputer.create(newWeaponsObj);


        this.upgrade.currentTier++
        this.systemLevels.weapon++
        this.upgradeAvailableFlasherStop();
        break

      case 'armor':
        console.log('UPGRADING ARMOR')
        this.upgrade.currentTier++
        this.systemLevels.armor++
        this.upgradeAvailableFlasherStop();
        break
      case 'engine':
        console.log('UPGRADING ENGINE')
        this.upgrade.currentTier++
        this.systemLevels.engine++
        this.upgradeAvailableFlasherStop();
        break
      default:
        break;
    }
  };
};

PlayerManager.prototype.upgradeAvailableFlasherStart = function(){
  var ship = this.player;
  ship.events.loop(500, flasherOn = function(){
    var ship = this.player;
    let colorMatrix = new pixi.filters.ColorMatrixFilter();
    ship.chassis.filters = [colorMatrix];
    colorMatrix.hue(240, false);
    colorMatrix.grayscale(0.7);
  }, this);
  ship.events.loop(750, flasherOff = function(){
    var ship = this.player;
    ship.chassis.filters = [];
  }, this);
};

// PlayerManager.prototype.flasherOn = function(){
//   var ship = this.player;
//   let colorMatrix = new pixi.filters.ColorMatrixFilter();
//   ship.chassis.filters = [colorMatrix];
//   colorMatrix.hue(440, false);
// };

// PlayerManager.prototype.flasherOff = function(){
//   var ship = this.player;
//   ship.chassis.filters = [];
// };

PlayerManager.prototype.upgradeAvailableFlasherStop = function(){
  var ship = this.player;

  for(var i = 0; i < ship.events.events.length; i++){
    if(ship.events.events[i].callback.name === 'flasherOn' || ship.events.events[i].callback.name === 'flasherOff'){
      ship.events.remove(ship.events.events[i]);  
    }
  }
  ship.chassis.filters = [];
};

PlayerManager.prototype._player = function(ship) {
  this.player = ship;
  this.chassis = ship.data.chassis,
  this.stockWeapons = client.ShipConfiguration[this.chassis]['targeting']['hardpoints'],
  this.player.squadron = {};
};

module.exports = PlayerManager;