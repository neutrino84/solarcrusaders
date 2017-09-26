var engine = require('engine'),
    Ship = require('./Ship'),
    pixi = require('pixi'),
    EnhancementManager = require('./EnhancementManager'),
    ExplosionEmitter = require('./emitters/ExplosionEmitter'),
    FlashEmitter = require('./emitters/FlashEmitter'),
    GlowEmitter = require('./emitters/GlowEmitter'),
    ShockwaveEmitter = require('./emitters/ShockwaveEmitter'),
    FireEmitter = require('./emitters/FireEmitter'),
    Indicator = require('./misc/Indicator');

function SquadManager(game) {
  this.game = game;
  this.clock = game.clock;
  this.net = game.net;
  this.socket = game.net.socket;
  this.shipNetManager = game.states.current.shipNetManager;
  // this.enhancementManager = new EnhancementManager(this);

  // player
  this.player = null;

  // squad target
  this.acquired = null;

  this.game.on('ship/player', this._player, this);
  this.game.on('squad/regroup', this.regroup, this);
  this.game.on('squad/shieldUp', this.shieldUp, this);

  //^ needs to be a private message listener from player (this came from front-end ship index.js)
  // ship.user.socket.emit? 
};

SquadManager.prototype.constructor = SquadManager;

SquadManager.prototype.create = function(sectorState) {
  // this.config = this.game.cache.getJSON('item-configuration', false);
  this.manager = sectorState.shipManager;
  this.ships = this.manager.ships;
};

SquadManager.prototype.closestHostile = function(){
  var ships = this.ships,
      player = this.player,
      hostiles = {},
      ascending = function(a, b) { return a-b }, 
      distance, targets;

  if(player.disabled){return}
  for(var s in ships){
    var ship = ships[s];
    ship.selector.hostileHighlightStop();
    // if(ship.disabled){
    //   console.log(ship.data.chassis, ' cached tint: ', ship.chassis.cachedTint, ' current tint: ', ship.chassis.tint)
    //   ship.chassis.tint = 0x333333;
    //   console.log('current tint: ', ship.chassis.tint)
    //   continue
    // }
    if(!ship.disabled && ship.targetingComputer.targetShip === player && ship.data.chassis !== 'squad-repair' || !ship.disabled && Object.values(player.squadron).indexOf(ship.targetingComputer.targetShip) > -1 && ship.data.chassis !== 'squad-repair'){ 
        distance = engine.Point.distance(ship, player);
        if(distance < 17000 && ship.data.chassis !== 'squad-repair'){
          hostiles[distance] = ship;
        };
        if(ship.disabled){
          console.log('HOSTILE  ship disabled. ship is ', ship)
          continue
        };
    };
  }; 

  targets = Object.keys(hostiles);
  if(targets && !targets.length){return}
  player.acquired = hostiles[targets.sort(ascending)[0]];
  if(!player.acquired.disabled){
    player.acquired.selector.hostileHighlight();
  }
};

SquadManager.prototype.detectUnfriendlies = function(){
  var ships = this.ships,
      player = this.player,
      unfriendlies = this.player.unfriendlies,
      ascending = function(a, b) { return a-b },
      t, distance, targets, previous, counter;
  if(player.disabled){return}

  for(var s in ships){
    var ship = ships[s];
    ship.selector.hostileHighlightStop();
  };
  if(!player.targetlistCooldown){
      this.player.unfriendlies = {};
      player.selector.detectorHighlight();
      counter = 0;
      for(var s in ships){
        var ship = ships[s],
            t = ship.data.name,
            distance = engine.Point.distance(ship, player); 
        if(ship.disabled){
          continue
        };
        if(ship.data.friendlies && ship.data.friendlies.indexOf('user') < 0 && distance < 800){
            this.player.unfriendlies[distance] = ship;
        let colorMatrix = new pixi.filters.ColorMatrixFilter();
        ship.chassis.filters = [colorMatrix];
        colorMatrix.hue(140, false);
        // colorMatrix.contrast(0.1);
        colorMatrix.grayscale(0.9);
        };

      };

      this.player.targetlistCooldown = true;
      this.player.events.add(10000, function(){
        player.targetlistCooldown = false;
      }, this);    
      player.events.add(10000, function(){
        for(s in this.player.unfriendlies){
          this.player.unfriendlies[s].chassis.filters = [];
        }
      }, this);
  }
  targets = Object.keys(this.player.unfriendlies);
  if(targets && !targets.length){return}

  console.log(player.targetCount)
  target = this.player.unfriendlies[targets.sort(ascending)[player.targetCount]]
  if(target && target !== this.player.previous && !target.disabled) {
    player.acquired = target
  } else {
    player.targetCount = 0
    player.acquired = this.player.unfriendlies[targets.sort(ascending)[player.targetCount]]
  };
  player.acquired && player.acquired.selector.hostileHighlight();
  player.targetCount++
  player.previous = player.acquired; 

  if(player.targetCount > targets.sort(ascending).length){
    player.targetCount = 0;
  }
};


SquadManager.prototype.engageHostile = function(){
  var ships = this.ships,
      player = this.player,
      available = false, 
      squad,
      ship;
  for(var s in ships){
    ship = ships[s];
    if(ship.data.masterShip && ship.data.masterShip === player.uuid && !ship.disabled && ship.data.chassis === 'squad-attack'){
      available = true;
    };
  };
  if(player.acquired && available){
    for(var s in ships){
    var ship = ships[s];
    ship.selector.hostileEngagedStop();
    ship.selector.hostileHighlightStop();
  }
  if(!player.acquired.disabled && available)
   player.acquired.selector.hostileEngaged();
    this.game.emit('squad/sound','engage');
    this.socket.emit('squad/engageHostile', {player_id: player.uuid, target_id : player.acquired.uuid });
  };
};

SquadManager.prototype.shieldUp = function(data) {
  var ship = this.manager.ships[data.uuid];

  if(data.active){
    if(ship.selector.shieldBlue) {
      ship.selector.shieldBlueStart()
      // ship.events.loop(500, expand = function(){
      //   ship.selector.shieldBlueExpand(this.poopoo);
      //   this.poopoo += 100;
      // }, this)
    }; 
  } else {
    if (ship.selector.shieldBlue) {
      ship.selector.shieldBlueStop();
    }; 
  }
};

SquadManager.prototype.shieldmaidenActivate = function() {
  var player = this.player;
  console.log('in squad manager, shieldmaidenActivated!')
  this.socket.emit('squad/shieldmaidenActivate', {player_uuid: player.uuid})
};

SquadManager.prototype.regroup = function() {
  var ships = this.ships,
      player = this.player,
      squad = {},
      available = false,
      ship, distance;

  for (var s in ships){
    var ship = ships[s];

    ship.selector.hostileHighlightStop();
    ship.selector.hostileEngagedStop();

    if(ship.data.masterShip === player.uuid && !ship.disabled){
      available = true;
      ship.selector.shieldBlueStop();
      distance = engine.Point.distance(ship, player);
      squad[ship.uuid] = distance;
    }
  };
  if(available){
    this.socket.emit('squad/regroup', {player_id: player.uuid, squad: squad});
    this.game.emit('squad/sound','regroup')
  }
};

SquadManager.prototype._hostile = function(uuid){
  var hostile = this.ships[uuid];
  hostile.selector.hostileHighlight();
  this.player.hostileTarget = hostile;
  this.socket.emit('squad/acquire', {
    target_uuid: this.player.hostileTarget.uuid,
    player_uuid: this.player.uuid
  });
};

SquadManager.prototype._player = function(ship) {
  this.player = ship;
  this.player.unfriendlies = {};
  this.player.targetCount = 0;
  this.player.targetlistCooldown = false;
  this.player.previous;
  this.player.squadron = {};
};

module.exports = SquadManager;