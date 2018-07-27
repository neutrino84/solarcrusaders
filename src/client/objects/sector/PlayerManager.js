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
  
  // player
  this.playerShip = null;
  this.chassis = null;
  this.stockWeapons = null;
  this.respawnMultiplier = 1;

  this.baseRespawnTime = 10;
  this.upgradeLevel = {
    1: 300,
    2: 600,
    3: 880,
    4: 1000,
    5: 60000,
    currentTier : 1
  };
  this.systemLevels = {
    weapon: 1,
    armor: 1,
    engine: 1
  };
  this.playerSquadron = [];
  this.upgradeAvailable = false;

  this.game.on('ship/player', this._player, this);
  this.game.on('player/disabled', this._death, this);
  this.game.on('player/upgrade', this._upgradeSystem, this);
  this.game.on('player/credits', this._player_credits, this);
  this.game.on('squad/select', this._squad_select, this);
  this.game.on('ship/player/squadSync', this._squad_sync, this);
};

PlayerManager.prototype.constructor = PlayerManager;

PlayerManager.prototype._player_credits = function () {
  this.creditsPane.updateCredits(this.player.data.credits);
  if (this.playerCredits < this.upgradeLevel[this.playerLevel] && this.player.data.credits >= this.upgradeLevel[this.playerLevel]) {
    this.playerLevel++
    this._upgradeSystem();
    this.player.hud.showLevelUp();
  };
  this.playerCredits = this.player.data.credits;
};

PlayerManager.prototype._squad_select = function(ship){
  if(this.playerSquadron.length < 4){
    this.socket.emit('player/select/squadship', {ship: ship, uuid: this.player.uuid});
    this.game.emit('SFX/selectionHover', 'selectionSFX3')
    this.upgradeAvailableFlasherStop();
  };
};

PlayerManager.prototype._squad_sync = function (data) {
    this.playerSquadron.push(data);
    this.game.emit('hide/upgrade_pane');
};

PlayerManager.prototype._upgradeSystem = function(type) {
  var ship = this.player;
  this.playerLevel++
  this.upgradeAvailableFlasherStart();
  this.game.emit('ship/player/upgrade');

  return

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

          if(type === 'rocket' && nextWeaponLevel === 3) newWeaponData = client.ItemConfiguration['hardpoint'][this.stockWeapons[b].default.type]['medium'];
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
        // update backend      
        this.socket.emit('ship/upgrade/stats', {uuid: ship.uuid, stat: 'armor'});

        this.game.emit('upgrades/sound/upgraded', {key : 'armorUpgraded', volume : 0.15});

        this.upgradeAvailable = false;
        this.upgrade.currentTier++
        this.systemLevels.armor++
        this.upgradeAvailableFlasherStop();
        break

      case 'engine':
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
  var ship = this.player;
  ship.selector.flash();
  this.game.emit('player/levelUpSFX')
};

PlayerManager.prototype.upgradeAvailableFlasherStop = function () {
  var ship = this.player;
  ship.selector.flashStop();
};

PlayerManager.prototype._player = function(ship) {
  this.player = ship;
  this.hud = ship.hud;
  this.chassis = ship.data.chassis,
  this.stockWeapons = client.ShipConfiguration[this.chassis]['targeting']['hardpoints'],
  ship.chassis.filters = [],
  this.filters = ship.chassis.filters;
  this.playerLevel = 1;

  this.game.emit('ship/player/upgrade');

  this._player_credits();
};

PlayerManager.prototype._death = function() {
  this.hud.respawnCountdownStart(this.baseRespawnTime * this.respawnMultiplier);
  this.respawnMultiplier++;
  this.socket.emit('updating/respawnMultiplier', this.game.auth.user.uuid, this.respawnMultiplier)
};

module.exports = PlayerManager;