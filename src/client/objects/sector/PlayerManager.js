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
  }

  this.game.on('ship/player', this._player, this);
  this.game.on('killpoints', this.playerKillpoints, this);

  //^ needs to be a private message listener from player (this came from front-end ship index.js)
  // ship.user.socket.emit? 
};

PlayerManager.prototype.constructor = PlayerManager;

PlayerManager.prototype.create = function(sectorState) {
  this.manager = sectorState.shipManager;
  this.ships = this.manager.ships;
  console.log('creating player manager')
};

PlayerManager.prototype.playerKillpoints = function(socket, killpoints) {
  this.killpoints += killpoints;
  console.log('PLAYERS KILLPOINTS ARE: ', this.killpoints)
};

PlayerManager.prototype.upgradeSystem = function(type) {
  var killpoints = this.killpoints,
      available = true,
      curTier = this.upgrade.currentTier,
      threshold = this.upgrade[curTier];
  // console.log('current upgrade tier is: ', curTier, 'current threshold is: ', threshold)
  // console.log('weapon is ', this.player)
  // console.log('player is ', this.player)

  if(this.killpoints > threshold){
    available = true;
    this.upgrade.currentTier++
  };



  if(available){
    switch(type) {
      case 'weapon':
        var hardpoint, config, slot,
            ship = this.player,
            hardpoints = ship.data.hardpoints;
            // console.log(ship)
        var chassis = ship.data.chassis;
        var skel = {};
        for( var i in hardpoints){
          skel[i] = hardpoints[i]
          // skel[i].subtype = hardpoints[i].subtype;
          // skel[i].type = hardpoints[i].type; 
        }
        console.log('skel is ', skel)

        var newWeaponData; 
        // var disintegrator = client.ItemConfiguration['hardpoint']['energy']['disintegrator'];
        var curWeapons = client.ShipConfiguration[chassis]['targeting']['hardpoints'];
        var newWeapon = [];
        var nextWeaponLevel = this.systemLevels.weapon+1;
        for(a in curWeapons){
          newWeapon[a] = curWeapons[a];
        }
        for(b in newWeapon){
          var newWeaponData = client.ItemConfiguration['hardpoint'][newWeapon[b].default.type][newWeapon[b].default.subtype+nextWeaponLevel];
          newWeapon[b].default.type = newWeaponData.type;
          newWeapon[b].default.subtype = newWeaponData.subtype;
        }
          console.log(newWeapon)

        console.log('UPGRADING WEAPON')
        // this.player.config.targeting.hardpoints[0].default.type = 'energy';
        // this.player.config.targeting.hardpoints[0].default.subtype = 'disintegrator';
        // console.log('weapon is ', this.player.config.targeting.hardpoints[0])
        // for(var h in this.player.targetingComputer.hardpoints){
        //   var hardpoint = this.player.targetingComputer.hardpoints[h];
        //   hardpoint.data.sound = "disintegratorBeam";
        //   hardpoint.data.type = "energy"
        //   hardpoint.data.subtype = "disintegrator"
        // }

        this.socket.emit('ship/upgrade/hardpoints', {uuid: ship.uuid, hardpoints: newWeapon});

        var counter = 0
        for(var h in this.player.targetingComputer.hardpoints) {
          var playerHardpoints = this.player.targetingComputer.hardpoints
          slot = hardpoints[h].slot;
          // console.log('hardpoints are: ', hardpoints, 'playerHardpoints is: ', playerHardpoints)
          // console.log(this.player.targetingComputer.hardpoints[h])
          // this.player.targetingComputer.hardpoints[h].data = disintegrator;
          // this.player.targetingComputer.hardpoints[h].data.slot = h;
          // this.player.data.hardpoints[h] = disintegrator;
          // this.player.data.hardpoints[h].slot = counter;
          // console.log(counter)
          counter++

        }
        // console.log(this.player)
        // console.log(this.player.targetingComputer.hardpoints)
        // console.log(this.player.targetingComputer.hardpoints)

        // this.player.targetingComputer.destroy();
        // this.player.targetingComputer.create();
        // debugger
        //0-3 is quantum pulse. 4 is basic rocket
        this.systemLevels.weapon++
        break
      case 'armor':
        console.log('UPGRADING ARMOR')
        this.systemLevels.armor++
        break
      case 'engine':
        console.log('UPGRADING ENGINE')
        this.systemLevels.engine++
        break
      default:
        break;
    }
  };
};

PlayerManager.prototype._player = function(ship) {
  this.player = ship;
  console.log('in player manger, player is ', this.player)
  this.player.squadron = {};
};

module.exports = PlayerManager;