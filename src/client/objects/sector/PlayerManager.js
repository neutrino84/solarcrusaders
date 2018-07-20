var engine = require('engine'),
    pixi = require('pixi'),
    client = require('client')
    EnhancementManager = require('./EnhancementManager');

function PlayerManager(game, state) {
  this.game = game;
  this.state = state;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  this.hud = null;
  this.creditsPane = state.ui.bottom.creditsPane;
  this.playerCredits = 0;
  this.playerLevel;
  
  // this.shipNetManager = game.states.current.shipNetManager;
  // this.enhancementManager = new EnhancementManager(this);

  // player
  this.playerShip = null;
  this.chassis = null;
  this.stockWeapons = null;
  this.respawnMultiplier = 1;

  // killpoints
  // this.killpoints = 0;
  // this.credits = 0;
  this.baseRespawnTime = 10;
  this.upgradeLevel = {
    1: 500,
    2: 800,
    3: 1000,
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
  this.game.on('player/disabled', this._death, this);
  this.game.on('player/upgrade', this._upgradeSystem, this);
  this.game.on('player/credits', this._player_credits, this);

  // this.game.on('player/credits', this.player_credits, this);
  
  // this.clock.events.add(2000, function(){
  //   console.log('yarp');
  //   this.game.emit('player/upgrade')
  // }, this)
};

PlayerManager.prototype.constructor = PlayerManager;

PlayerManager.prototype._player_credits = function () {
  // console.log('old credits: ', this.playerCredits, 'new credits: ', this.player.data.credits);
  
  this.creditsPane.updateCredits(this.player.data.credits);
  if (this.playerCredits < this.upgradeLevel[this.playerLevel] && this.player.data.credits >= this.upgradeLevel[this.playerLevel]) {
    console.log('just leveled up!')
    this.playerLevel++
    this._upgradeSystem();
    this.player.hud.showLevelUp();
  }
  // if(this.playerCredits < 1000 && this.player.data.credits >= 1000){
  //   console.log('just cracked a thousand!')
  // }
  this.playerCredits = this.player.data.credits;
};
PlayerManager.prototype._upgradeSystem = function(type) {
  var ship = this.player;

  console.log('in upgradeSystem, starting flasher');
  this.upgradeAvailableFlasherStart();

  if(this.upgradeAvailable){
    switch(type) {
      case 'weapon':
        var hardpoints = ship.data.hardpoints,
            newWeaponsArray = [],
            newWeaponsObj = {},
            nextWeaponLevel = this.systemLevels.weapon+1,
            stockWeapons = this.stockWeapons,
            weaponsCap = 3,
            newWeaponData, slot;

        // set current weapon cap
        if(nextWeaponLevel > weaponsCap){
          nextWeaponLevel = weaponsCap;
        };

        for(var b = 0; b < Object.keys(stockWeapons).length; b++){
            var type = this.stockWeapons[b].default.type,
                subtype = this.stockWeapons[b].default.subtype,
                newWeaponData = client.ItemConfiguration['hardpoint'][type][subtype+nextWeaponLevel], copy;  

          if(type === 'rocket' && nextWeaponLevel === 3) newWeaponData = client.ItemConfiguration['hardpoint'][this.stockWeapons[b].default.type]['medium']
          // console.log('new weapon data is ', newWeaponData)
          copy = newWeaponData.constructor();

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
        // console.log('new weapon is ', newWeaponsObj[0])

        // update backend      
        this.socket.emit('ship/upgrade/hardpoints', {uuid: ship.uuid, hardpoints: newWeaponsArray});
    
        //update frontend
        this.player.targetingComputer.create(newWeaponsObj);

        this.game.emit('upgrades/sound/upgraded', {key : 'weaponSystemsUpgraded', volume : 0.15});
        this.upgradeAvailable = false;
        this.upgrade.currentTier++
        this.systemLevels.weapon++
        this.upgradeAvailableFlasherStop();
        break

      case 'armor':
        console.log('UPGRADING ARMOR')

        // update backend      
        this.socket.emit('ship/upgrade/stats', {uuid: ship.uuid, stat: 'armor'});

        this.game.emit('upgrades/sound/upgraded', {key : 'armorUpgraded', volume : 0.15});

        this.upgradeAvailable = false;
        this.upgrade.currentTier++
        this.systemLevels.armor++
        this.upgradeAvailableFlasherStop();
        break

      case 'engine':
        console.log('UPGRADING ENGINE')

        // update backend      
        this.socket.emit('ship/upgrade/stats', {uuid: ship.uuid, stat: 'speed'});

        this.game.emit('upgrades/sound/upgraded', {key : 'reactorUpgraded', volume : 0.15});

        this.upgradeAvailable = false;
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
  console.log('in flasher start');
  
  var ship = this.player;
  ship.selector.flash();
    

  // ship.events.loop(100, flasher = function(){
  //   var ship = this.player;
  //   if(this.filters.length){
  //     this.filters = [];
  //     ship.selector.outline 
  //     ship.chassis.filters = [];
  //   } else {
  //     let colorMatrix = new pixi.filters.ColorMatrixFilter();
  //     this.filters = [colorMatrix];
  //     ship.chassis.filters = this.filters;
  //     colorMatrix.hue(540, false);
  //     colorMatrix.grayscale(0.2);
  //   }
  // }, this);
  // ship.events.loop(750, flasherOff = function(){
  //   var ship = this.player;
  //   ship.chassis.filters = [];
  // }, this);
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
    if(ship.events.events[i].callback.name === 'flasher' || ship.events.events[i].callback.name === 'flasherOff'){
      ship.events.remove(ship.events.events[i]);  
    }
  }
  ship.chassis.filters = [];
  this.filters = [];
};

PlayerManager.prototype._player = function(ship) {

  this.player = ship;
  this.hud = ship.hud;
  this.chassis = ship.data.chassis,
  this.stockWeapons = client.ShipConfiguration[this.chassis]['targeting']['hardpoints'],
  ship.chassis.filters = [],
  this.filters = ship.chassis.filters;

  //this needs to check the backend player object for level (to account for reconnects)
  this.playerLevel = 1;

  this._player_credits();
};

PlayerManager.prototype._death = function() {
  this.hud.respawnCountdownStart(this.baseRespawnTime * this.respawnMultiplier);
  this.respawnMultiplier++;
  this.socket.emit('updating/respawnMultiplier', this.game.auth.user.uuid, this.respawnMultiplier)
};

module.exports = PlayerManager;