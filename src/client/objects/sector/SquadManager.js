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
};

SquadManager.prototype.constructor = SquadManager;

SquadManager.prototype.create = function(sectorState) {
  // this.config = this.game.cache.getJSON('item-configuration', false);
  this.manager = sectorState.shipManager;
  this.ships = this.manager.ships;
  console.log('creating squad manager')
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
    if(!ship.disabled && ship.targetingComputer.targetShip === player && ship.data.chassis !== 'squad-repair' || Object.values(player.squadron).indexOf(ship.targetingComputer.targetShip) > -1 && ship.data.chassis !== 'squad-repair'){ 
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

  for(var s in player.squadron){
    if(player.squadron[s].data.chassis === 'squad-shield_2' && !player.squadron[s].disabled){
      this.socket.emit('squad/shieldCheck', {player_id: player.uuid, shieldShip_id : player.squadron[s].uuid });
      // console.log('shield ship: ', player.squadron[s].selector.shieldBlueCircle, player.movement._position)
      // if(player.squadron[s].selector.shieldBlueCircle.contains(player.movement._position.x, player.movement._position.y )){
      //   console.log('AW YA')
      // }
    }
    
  }

  targets = Object.keys(hostiles);
  if(targets && !targets.length){return}
  player.acquired = hostiles[targets.sort(ascending)[0]];
  player.acquired.selector.hostileHighlight();
  console.log('hostile ', player.acquired)
};

SquadManager.prototype.detectUnfriendlies = function(){
  var ships = this.ships,
      player = this.player,
      unfriendlies = this.player.unfriendlies,
      ascending = function(a, b) { return a-b }, 
      regex = /(mol-)|(vul-)/,
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
        // ship.selector.detectorHighlight();
        if(ship.disabled){
          console.log('ship disabled. ship is ', ship)
          continue
        };

        if(ship.data.friendlies && ship.data.friendlies.indexOf('user') < 0 && distance < 3500){
          if(regex.test(t)){
            this.player.unfriendlies[5000+counter] = ship;
            counter++
          } else {
            this.player.unfriendlies[distance] = ship;
          };

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
  console.log('detect ', player.acquired)
  player.targetCount++
  player.previous = player.acquired; 

  if(player.targetCount > targets.sort(ascending).length){
    player.targetCount = 0;
  }
};


SquadManager.prototype.engageHostile = function(){
  var ships = this.ships,
      player = this.player,
      available = false, squad,
      ship;
  for(var s in ships){
    ship = ships[s];
    if(ship.data.masterShip && ship.data.masterShip === player.uuid && !ship.disabled){
      available = true;
    };
  };
  // if(ship.data.masterShip === player.uuid){
  //     distance = engine.Point.distance(ship, player);
  //     squad[ship.uuid] = distance;
  // }
  if(player.acquired){
    for(var s in ships){
    var ship = ships[s];
    ship.selector.hostileEngagedStop();
  }
  if(!player.acquired.disabled && available)
   player.acquired.selector.hostileEngaged();
    this.game.emit('squad/sound/engage');
    this.socket.emit('squad/engageHostile', {player_id: player.uuid, target_id : player.acquired.uuid });
  };
};

SquadManager.prototype.regroup = function() {
  var ships = this.ships,
      player = this.player,
      squad = {},
      ship, distance;

  for (var s in ships){
    var ship = ships[s];

    ship.selector.hostileHighlightStop();
    ship.selector.hostileEngagedStop();

    if(ship.data.masterShip === player.uuid){
      distance = engine.Point.distance(ship, player);
      squad[ship.uuid] = distance;
    }
  };

  this.socket.emit('squad/regroup', {player_id: player.uuid, squad: squad});
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