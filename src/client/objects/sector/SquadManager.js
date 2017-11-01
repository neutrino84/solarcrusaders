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

  //soundTimer
  this.soundTimer = {};


  this.ok = true;
  // squad target
  this.acquired = null;

// this.game.on('squad/shieldDestination', this._shield, this);
  this.game.on('ship/player', this._player, this);
  this.game.on('squad/regroup', this.regroup, this);
  this.game.on('squad/shieldUp', this.shieldUpOut, this);
  this.game.on('squad/shieldUpIn', this.shieldUpIn, this);
  // this.game.on('squad/shieldDestination', this.shieldDestination, this);
  this.game.on('squad/closestHostile', this.closestHostile, this)
  this.game.on('squad/engageTarget', this.engageHostile, this)
  this.game.on('squad/detectHostiles', this.detectHostiles, this)
  this.game.on('hotkey/squad/detectHostiles', this.detectHostiles, this)
};

SquadManager.prototype.constructor = SquadManager;

SquadManager.prototype.create = function(sectorState) {
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
    if(!ship.disabled && ship.targetingComputer.targetShip === player && ship.data.chassis !== 'squad-repair' || !ship.disabled && Object.values(player.squadron).indexOf(ship.targetingComputer.targetShip) > -1 && ship.data.chassis !== 'squad-repair'){ 
        distance = engine.Point.distance(ship, player);
        if(distance < 17000 && ship.data.chassis !== 'squad-repair'){
          hostiles[distance] = ship;
        };
        if(ship.disabled){
          continue
        };
    };
  }; 

  targets = Object.keys(hostiles);
  if(targets && !targets.length){return}
  player.acquired = hostiles[targets.sort(ascending)[0]];
  if(!player.acquired.disabled){
    this.game.emit('squad/sound','closestHostile');
    player.acquired.selector.hostileHighlight();
  }
};

SquadManager.prototype.detectHostiles = function(){
  var ships = this.ships,
      player = this.player,
      unfriendlies = this.player.unfriendlies,
      ascending = function(a, b) { return a-b },
      t, distance, targets, previous, counter;
  if(player.disabled){return}

  console.log('player is ', player)

  

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

  target = this.player.unfriendlies[targets.sort(ascending)[player.targetCount]]
  if(target && target !== this.player.previous && !target.disabled) {
    player.acquired = target
  } else {
    player.targetCount = 0
    player.acquired = this.player.unfriendlies[targets.sort(ascending)[player.targetCount]]
  };
  player.acquired && player.acquired.selector.hostileHighlight();
  console.log(player.acquired)
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
  if(player.acquired && available && !player.acquired.disabled){
    for(var s in ships){
    var ship = ships[s];
    ship.selector.hostileEngagedStop();
    ship.selector.hostileHighlightStop();
  }
  if(!player.acquired.data.disabled && available)
  console.log(player.acquired, player.acquired.data.disabled)
   player.acquired.selector.hostileEngaged();
   console.log('this.ok is', this.ok)
   // this.soundTimer['hostileEngaged'] 
   player.events.add(12000, function(){
    console.log('soundTimer off')
    this.ok = true;
    this.soundTimer['hostileEngaged'] = null;
   }, this)
   if(this.ok){
      this.game.emit('squad/sound','engage');
      this.ok = false;
   }
    this.socket.emit('squad/engageHostile', {player_id: player.uuid, target_id : player.acquired.uuid });
  };
};

SquadManager.prototype.shieldUpIn = function(data) {
  var ship = this.manager.ships[data.uuid];

  if(data.active){
    if(ship.selector.shieldBlue && ship.data.chassis == 'squad-shield' && !ship.disabled) {
      console.log('emitting shield up')
      this.game.emit('squad/sound','shieldUp')

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

SquadManager.prototype.shieldUpOut = function() {
  var player = this.player;
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