
var uuid = require('uuid'),
    engine = require('engine'),
    Ship = require('./objects/Ship'),
    AI = require('./AI'),
    Utils = require('../utils'),
    Generator = require('../utils/Generator');

function ShipManager(game, sectorManager) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  this.pirateAttackLog = {
    'temeni' : [],
    'katos_boys' : [],
    'sappers' : []
  }

  this.sectorManager = sectorManager;

  this.ships = {};
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function(eventManager) {

  this.eventManager = eventManager;
  this.ai = new AI(this, eventManager);

  // internal
  this.game.on('ship/add', this.add, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/remove/clear_squadron', this.clearSquadron, this);
  this.game.on('ship/create', this.create, this);
  this.game.on('ship/disabled', this.disabled, this);
  this.game.on('pirate/attackStation', this.attackStation, this);
  this.game.on('game/over', this.removeAll, this);

  // networking
  this.sockets.on('ship/plot', this.plot, this);
  this.sockets.on('ship/attack', this.attack, this);
  this.sockets.on('ship/enhancement/start', this.enhancement, this);

  this.sockets.on('player/undock', this.player_undock, this);
  this.sockets.on('player/credits', this.player_credits, this);
  this.sockets.on('squad/engageHostile', this.squad_engage, this);
  this.sockets.on('squad/shieldmaidenActivate', this.squad_shieldmaidenActivate, this);
  this.sockets.on('squad/regroup', this.squad_regroup, this);
  this.sockets.on('squad/shieldDestination', this.squad_shield_destination, this);
  this.sockets.on('squad/shieldDestinationDeactivate', this.squad_shield_destination_deactivate, this);

  // update data interval
  this.game.clock.events.loop(1000, this.update, this);
};

ShipManager.prototype.add = function(ship) {
  if(this.ships[ship.uuid] === undefined) {
    this.ships[ship.uuid] = ship;
  }
};

ShipManager.prototype.remove = function(ship) {
  var ships = this.ships,
      s = ships[ship.uuid];
  for(var i in this.ships){
    if(ships[i].ai && ships[i].ai.target === s){
      ships[i].ai.target = null;
    }
  }
  if(s !== undefined) {
    delete this.ships[ship.uuid] && s.destroy();
  };
};

ShipManager.prototype.clearSquadron = function(ship) {
  var ships = this.ships,
      s = ships[ship.uuid];
  if(!s || !s.squadron){return}
  for(var i in s.squadron){
    this.game.emit('ship/remove', s.squadron[i]);
  }
};

ShipManager.prototype.attackStation = function(ai, faction) {
      var ships = this.ships;
      switch(ai) {
        case 'basic':
          break
        case 'pirate':
          for(var s in ships){
            if(ships[s].ai && ships[s].ai.type === 'pirate' && ships[s].ai.faction === faction){
              var ship = ships[s];
              switch(ship.faction) {
                case 'temeni':
                  if(this.pirateAttackLog['temeni'].indexOf(ship.uuid) == -1){
                    this.pirateAttackLog['temeni'].push(ship.uuid);
                    ship.ai.engageStation(this.sectorManager.stationManager.getStation('ubadian-station-x01'));
                    return
                  }
                break
                case 'katos_boys':
                  if(this.pirateAttackLog['katos_boys'].indexOf(ship.uuid) == -1){
                    this.pirateAttackLog['katos_boys'].push(ship.uuid);
                    ship.ai.engageStation(this.sectorManager.stationManager.getStation('ubadian-station-x01'));
                    return
                  }
                break
                case 'sappers':
                break
                case 'clear':
                  this.pirateAttackLog = {
                    'temeni' : [],
                    'katos_boys' : [],
                    'sappers' : []
                  }
                break
                default:
                break
              }
            }
          }
          break;
        default:
        
          break;
      }
};

ShipManager.prototype.create = function(data, user) {
  var self = this, ship,
      game = this.game,
      squadship = /^(squad)/,
      scavship = /^(scav)/,
      enforcership = /^(enforcer)/,
      chassis = data.chassis,
      rndPosition;

  ship = new Ship(this, data, user);
  ship.init(function() {
    game.emit('ship/add', ship);
  });

  if(data.master && squadship.test(chassis)){
    this.ships[data.master].squadron[ship.uuid] = ship;
    if(chassis === 'squad-shield'){
      this.sockets.send('squad/shieldMaidenConnect', data.master)
    }
  }
  if(ship.data.chassis === 'scavenger-x04'){
    ship.data.brood = {};
    this.eventManager.spawnQueen(data.cycle, ship.uuid);
  };
  if(data.queen && ship.data.chassis === 'scavenger-x03'){
    this.ships[data.queen].data.brood[ship.uuid] = ship;
  }
  if(ship.data.chassis === 'enforcer-x02'){
    ship.battalion = {};
    this.eventManager.enforcerGen(data.x, data.y, ship.uuid);
  };
  if(ship.data.chassis === 'enforcer-x01'){
    this.ships[data.master].battalion[ship.uuid] = ship;
  };
  if(user){
    this.eventManager.squadGen(user.ship.uuid);
  };
};

ShipManager.prototype.plot = function(socket, args) {
  var user = socket.request.session.user,
      data = args[1],
      ship = this.ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.movement.plot(data.destination);
  }
};

ShipManager.prototype.attack = function(socket, args) {
  var ships = this.ships,
      sockets = this.sockets,
      user = socket.request.session.user,
      data = args[1],
      ship = ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    ship.attack(data, ship.user.rtt);
  }
};

ShipManager.prototype.squad_engage = function(socket, args){
  var ships = this.ships, target;
    for (var s in ships){
      ship = ships[s];

      if(ship.chassis === 'squad-attack' && ship.master === args[1].player_id && ships[args[1].target_id]){
        target = ships[args[1].target_id];
        // target.data.targettedBy = args[1].player_id;
        ship.ai.engage(target, 'attack');
      };
    };
};

ShipManager.prototype.squad_shieldmaidenActivate = function(socket, args){
  var ships = this.ships;
    for (var s in ships){
      ship = ships[s];

      if(ship.chassis === 'squad-shield' && ship.master === args[1].player_uuid){
        ship.ai.shieldmaidenActivate();
      };
    };
};

ShipManager.prototype.squad_regroup = function(socket, args){
  var ships = this.ships,
      player = ships[args[1].player_id],
      distance;
    for (var s in ships){
      ship = ships[s];
      var a = /^(squad)/,
          t = ship.chassis;

      if(ship.data.targettedBy === args[1].player_id){
        ship.data.targettedBy = null;
      }

      if(a.test(t) && ship.master === player.uuid && args[1].squad[ship.uuid] && !ship.disabled){
        distance = args[1].squad[ship.uuid];
        ship.ai.regroup(distance);
      };
    };
};

ShipManager.prototype.squad_shield_destination = function(socket, args){
  var ships = this.ships,
      player = ships[args[1].uuid],
      distance;
    for (var s in ships){
      ship = ships[s];
      var a = /^(squad-shield)/,
          t = ship.chassis;
      if(a.test(t) && ship.master === player.uuid && !ship.disabled){
        ship.ai.shield_destination(args[1].destination);
      };
    };
};

ShipManager.prototype.squad_shield_destination_deactivate = function(socket, args){
  var ships = this.ships,
      player = ships[args[1]];

    for (var s in ships){
      ship = ships[s];
      var a = /^(squad-shield)/,
          t = ship.chassis;
      if(a.test(t) && ship.master === player.uuid && !ship.disabled){
        ship.ai.shield_destination_deactivate();
      };
    };
};

ShipManager.prototype.player_undock = function(socket, args){
  var ships = this.ships,
      player = ships[args[1]];
    player.docked = false;
};

ShipManager.prototype.player_credits = function(socket, args){
  var ships = this.ships,
      player = ships[args[1].player_uuid],
      credits = args[1].credits;
    player.data.credits += credits;
      this.game.emit('ship/data', [{uuid: player.uuid, credits : player.data.credits}]);
};

ShipManager.prototype.enhancement = function(socket, args) {
  var ships = this.ships,
      sockets = this.sockets,
      user = socket.request.session.user,
      path = args[0],
      data = args[1],
      ship = ships[data.uuid];
  switch(path) {
    case 'ship/enhancement/start':
      if(ship && ship.user && ship.user.uuid === user.uuid) {
        ship.activate(data.enhancement);
      }
      break;
    default:
      break;
  }
};

ShipManager.prototype.data = function(uuids) {
  var ship,
      ships = [];
  for(var u in uuids) {
    ship = this.ships[uuids[u]];
    if(ship) {
      ships.push({
        uuid: ship.uuid,
        chassis: ship.chassis,
        name: ship.data.name,
        x: ship.movement.x,
        y: ship.movement.y,
        rotation: ship.movement.rotation,
        speed: ship.speed * ship.movement.throttle,
        user: ship.user ? ship.user.uuid : null,
        ai: ship.ai ? ship.ai.type : null,
        username: ship.user ? ship.user.data.username : null,
        disabled: ship.disabled,
        size: ship.size,
        credits: ship.data.credits,
        reputation: ship.data.reputation,
        kills: ship.data.kills,
        disables: ship.data.disables,
        assists: ship.data.assists,
        durability: ship.durability,
        energy: ship.energy,
        recharge: ship.recharge,
        health: ship.health,
        heal: ship.heal,
        armor: ship.armor,
        rate: ship.rate,
        critical: ship.critical,
        evasion: ship.evasion,
        friendlies: ship.friendlies,
        faction: ship.faction,
        masterShip: ship.masterShip,
        enhancements: ship.serialized.enhancements,
        hardpoints: ship.serialized.hardpoints
      });
    }
  }
  return ships;
};

ShipManager.prototype.sync = function() {
  var data, ship, position, movement,
      ships = this.ships,
      synced = [];
  for(var s in ships) {
    ship = ships[s];
    if(ship.docked){
      station = this.sectorManager.stationManager.getStation('ubadian-station-x01');
      movement = ship.movement;
      movement.update();
      position = station.movement.position;

      data = {
        uuid: ship.uuid,
        pos: { x: position.x, y: position.y },
        spd: station.speed,
        dock: true
      };
      synced.push(data);
    } else {
    movement = ship.movement;
    movement.update();
    position = movement.position;

      data = {
        uuid: ship.uuid,
        pos: { x: position.x, y: position.y },
        spd: ship.speed * movement.throttle
      };
      synced.push(data);
    }
  }
  return synced;
};

ShipManager.prototype.update = function() {
  var ships = this.ships,
      ship, delta, update, stats,
      updates = [];
  for(var s in ships) {
    ship = ships[s];
    if(!ship.disabled) {
      stats = ship.config.stats;
      update = { uuid: ship.uuid };
      
      // update health
      if(ship.health < stats.health) {
        delta = ship.heal;
        ship.health = global.Math.min(stats.health, ship.health + delta);
        update.health = engine.Math.roundTo(ship.health, 1);
      };

      // update energy
      if(ship.energy < stats.energy) {
        delta = ship.recharge;
        ship.energy = global.Math.min(stats.energy, ship.energy + delta);
        update.energy = engine.Math.roundTo(ship.energy, 1);
      };

      //update targettedBy
      if(ship.data.targettedBy){
        update.targettedBy = ship.data.targettedBy
        // updates.push(update)
      };

      // push deltas
      if(delta !== undefined) {
        updates.push(update);
      }
      if(ship.docked){
        update.docked = true;
        updates.push(update)
      }
    }
  }
  if(updates.length > 0) {
    this.game.emit('ship/data', updates);
  }
};

ShipManager.prototype.disabled = function(data) {
  this.sockets.send('ship/disabled', data);
};

ShipManager.prototype.removeAll = function() {
  for(var a in this.ships){
    this.remove(this.ships[a]);
  }
  this.ships = {};
  this.pirateAttackLog = {
    'temeni' : [],
    'katos_boys' : [],
    'sappers' : []
  };
};

module.exports = ShipManager;
