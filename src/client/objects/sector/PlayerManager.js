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
            console.log(ship)
        var chassis = this.player.chassis;
        var disintegrator = client.ItemConfiguration['hardpoint']['energy']['disintegrator'];
        var curWeapon = client.ShipConfiguration['ubaidian-x01e']['targeting']['hardpoints'];
        var newWeapon = [];
        for(a in curWeapon){
          newWeapon[a] = curWeapon[a]
        }
        for(a in newWeapon){
          newWeapon[a].default = {subtype: "disintegrator", type : "energy"}
        }
        console.log(newWeapon)      
        // newWeapon[a].position = curWeapon[a].position;
        // newWeapon[a].pivot = curWeapon[a].pivot;
        // newWeapon[a].type = curWeapon[a].type;
        // newWeapon[a].default = {subtype: "disintegrator", type : "energy"}

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

        for(var h in this.player.targetingComputer.hardpoints) {
          slot = hardpoints[h].slot;

          // console.log(thiss.player.targetingComputer.hardpoints[h].data)
          // console.log(hardpoints)
          // console.log(hardpoints[h])
          // hardpoint = new Hardpoint(this.player.targetingComputer, hardpoints[h], null);
          // hardpoint.subGroup = ship.manager.subGroup;
          // hardpoint.fxGroup = ship.manager.fxGroup;
          // hardpoint.flashEmitter = ship.manager.flashEmitter;
          // hardpoint.explosionEmitter = ship.manager.explosionEmitter;
          // hardpoint.glowEmitter = ship.manager.glowEmitter;
          // hardpoint.fireEmitter = ship.manager.fireEmitter;
          // hardpoint.shockwaveEmitter = ship.manager.shockwaveEmitter;

          this.player.targetingComputer.hardpoints[slot].data = disintegrator;
        }
        // console.log(this.player.targetingComputer.hardpoints)
        // console.log(this.player.targetingComputer.hardpoints)

        // this.player.targetingComputer.destroy();
        // this.player.targetingComputer.create();
        // debugger
        //0-3 is quantum pulse. 4 is basic rocket
        break
      case 'armor':
        console.log('UPGRADING ARMOR')
        break
      case 'engine':
        console.log('UPGRADING ENGINE')
        break
      default:
        break;
    }
  };
};

PlayerManager.prototype._player = function(ship) {
  this.player = ship;
  // console.log('in player manger, player is ', this.player)
  this.player.squadron = {};
};

module.exports = PlayerManager;