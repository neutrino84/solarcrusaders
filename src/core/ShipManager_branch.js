
var uuid = require('uuid'),
    engine = require('engine'),
    Ship = require('./objects/Ship'),
    AI = require('./AI')
    Utils = require('../utils'),
    Generator = require('../utils/Generator');

function ShipManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets.ioserver;

  this.ships = {};
  // this.stations = game.stationManager.stations;

  // ai manager
  this.ai = new AI(this);

  // internal
  this.game.on('ship/add', this.add, this);
  this.game.on('ship/remove', this.remove, this);
  this.game.on('ship/create', this.create, this);

  // networking
  this.game.on('ship/data', this.data, this);
  this.game.on('ship/plot', this.plot, this);
  this.game.on('ship/attack', this.attack, this);
  this.game.on('ship/disabled', this.disabled, this);
  this.game.on('ship/enhancement/start', this.enhancement.bind(this));
  this.game.on('ship/upgrade/hardpoints', this.upgradeHardpoints, this);
  this.game.on('ship/upgrade/stats', this.upgradeStats, this);

  this.game.on('squad/engageHostile', this.squad_engage, this);
  this.game.on('squad/regroup', this.squad_regroup, this);
  this.game.on('squad/shield', this.squad_shield, this);


  // activate ai
  this.game.clock.events.loop(1000, this.refresh, this);
};

ShipManager.prototype.constructor = ShipManager;

ShipManager.prototype.init = function() {
  // generate npcs
  this.generateRandomShips();
  this.generatePirateShips();
  this.generateEnforcerShips();
  this.generateScavengerShips();
  // this.generateTestShips();

  // console.log(this.game)
  // debugger
  // this.stations = game.stationManager.stations;
};

ShipManager.prototype.add = function(ship) {
  if(this.ships[ship.uuid] === undefined) {
    this.ships[ship.uuid] = ship;
  }
};

ShipManager.prototype.remove = function(ship) {
  var s = this.ships[ship.uuid];
  if(s !== undefined) {
    delete this.ships[ship.uuid] && s.destroy();
  }
};

ShipManager.prototype.create = function(data, user, position) {
  var self = this, ship,
      rnd = this.game.rnd,
      position = position || this.generateRandomPosition(user ? 2024 : 4048),
      data = Utils.extend({
        x: data.x || position.x,
        y: data.y || position.y,
        rotation: rnd.frac() * engine.Math.PI
      }, data), squadship = /^(squad)/,
      test = data.chassis;

  ship = new Ship(this, data);
  ship.user = user;
  ship.init(function(err) {
    self.game.emit('ship/add', ship);
  });
  if(ship.user){
    this.generateSquadronShips(ship.uuid);
  };
  if(ship.data.chassis === 'enforcers-x02'){
    // this.generateEnforcerShips(ship.uuid, data.x, data.y);
  };
  if(ship.data.chassis === 'scavengers-x04d'){
    this.spawnQueen(data.toporbot, ship.uuid);
  };
  if(ship.data.chassis === 'enforcers-x01' && data.master){
    this.ships[data.master].squadron[ship.uuid] = ship;
  };
  if(data.master && squadship.test(test)){
    this.ships[data.master].squadron[ship.uuid] = ship;
  }
  if(data.master && ship.data.chassis === 'scavengers-x03c'){
    this.ships[data.master].squadron[ship.uuid] = ship;
  }
  return ship;
};

ShipManager.prototype.plot = function(socket, args) {
  var user = socket.request.session.user,
      data = args[1],
      ship = this.ships[data.uuid];
  if(ship && ship.user && ship.user.uuid === user.uuid) {
    // console.log('backend destination is ', data.destination)
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
  var ships = this.ships;

    for (var s in ships){
      ship = ships[s];

      if(ship.chassis === 'squad-attack' && ship.master === args[1].player_id && ships[args[1].target_id]){
        var target = ships[args[1].target_id];
        ship.ai.engage(target, 'attack');
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

      if(a.test(t) && ship.master === player.uuid && args[1].squad[ship.uuid] && !ship.disabled){
        distance = args[1].squad[ship.uuid];
        ship.ai.regroup(distance);
      };
    };
};

ShipManager.prototype.squad_shield = function(socket, args){
  var ships = this.ships,
      player = ships[args[1].uuid],
      distance;

    for (var s in ships){
      ship = ships[s];
      var a = /^(squad-shield)/,
          t = ship.chassis;

      if(a.test(t) && ship.master === player.uuid && !ship.disabled){
        // distance = args[1].squad[ship.uuid];
        // console.log('core', args[1].destination)
        ship.ai.shield(args[1].destination);
      };
    };
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

ShipManager.prototype.upgradeHardpoints = function(socket, args) {
  var data, ship, position, movement,
      ships = this.ships,
      arr = [];
  
  // console.log(args[1].uuid, args[1].hardpoints)
  ships[args[1].uuid].createHardpoints(args[1].hardpoints)
};

ShipManager.prototype.upgradeStats = function(socket, args) {
  var ships = this.ships,
      ship = ships[args[1].uuid];

  switch(args[1].stat){

    case 'armor':
      if(!ship.newArmorValue){
        ship.newArmorValue = ship.armor*1.25;
      } else { ship.newArmorValue = ship.newArmorValue*1.3};
      // console.log(ship.config.stats.armor, '-->', ship.newArmorValue)
      break;

    case 'speed':
      if(!ship.newSpeedValue){
        ship.newSpeedValue = ship.speed*1.22;
      } else { ship.newSpeedValue = ship.newSpeedValue*1.2};
      // console.log(ship.config.stats.speed, '-->', ship.newSpeedValue)
      break;

    default:
      break;
  }
  // ships[args[1].uuid].armorUpgrade();
};

ShipManager.prototype.data = function(socket, args) {
  var ship,
      uuid, enhancements, hardpoints,
      uuids = args[1].uuids,
      user = socket.request.session.user,
      ships = [];

  for(var u in uuids) {
    ship = this.ships[uuids[u]];
    if(ship) {
      enhancements = Object.keys(ship.enhancements.available);
      hardpoints = ship.transferable.hardpoints,
      ships.push({
        x: ship.x,
        y: ship.y,
        uuid: ship.uuid,
        name: ship.data.name,
        user: ship.user ? ship.user.uuid : null,
        ai: ship.ai ? ship.ai.type : null,
        disabled: ship.disabled,
        username: ship.user ? ship.user.data.username : null,
        chassis: ship.chassis,
        sector: ship.data.sector,
        rotation: ship.movement.rotation,
        credits: ship.data.credits,
        reputation: ship.data.reputation,
        kills: ship.data.kills,
        disables: ship.data.disables,
        assists: ship.data.assists,
        durability: ship.durability,
        capacity: ship.capacity,
        size: ship.size,
        energy: ship.energy,
        recharge: ship.recharge,
        health: ship.health,
        heal: ship.heal,
        armor: ship.armor,
        rate: ship.rate,
        speed: ship.speed,
        critical: ship.critical,
        evasion: ship.evasion,
        hardpoints: hardpoints,
        enhancements: enhancements,
        friendlies: ship.friendlies,
        masterShip: ship.masterShip
      });
    }
  }
  socket.emit('ship/data', {
    type: 'sync', ships: ships
  });
};

ShipManager.prototype.update = function() {
  var data, ship, position, movement,
      ships = this.ships,
      arr = [];
  for(var s in ships) {
    ship = ships[s];
    movement = ship.movement;
    movement.update();
    position = movement.position;
    data = {
      uuid: ship.uuid,
      pos: { x: position.x, y: position.y },
      spd: ship.speed * movement.throttle
    };
    arr.push(data);
  }
  this.sockets.emit('ship/sync', {
    ships: arr
  });
};

ShipManager.prototype.refresh = function() {
  var ship, delta,
      ships = this.ships,
      update, updates = [],
      stats;
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
      }

      // update energy
      if(ship.energy < stats.energy) {
        delta = ship.recharge;
        ship.energy = global.Math.min(stats.energy, ship.energy + delta);
        update.energy = engine.Math.roundTo(ship.energy, 1);
      }

      // push deltas
      if(delta !== undefined) {
        updates.push(update);
      }
    }
  }
  if(updates.length > 0) {
    this.sockets.emit('ship/data', {
      type: 'update', ships: updates
    });
  }
};

ShipManager.prototype.disabled = function(data) {
  var game = this.game,
      ships = this.ships,
      sockets = this.sockets;

  sockets.emit('ship/disabled', data);
};

ShipManager.prototype.generateRandomShips = function() {
  var iterator = {
        'ubaidian-x01a': { race: 'ubaidian', count: 1 },
        'ubaidian-x01b': { race: 'ubaidian', count: 1 },
        'ubaidian-x01c': { race: 'ubaidian', count: 1 },
        'ubaidian-x01d': { race: 'ubaidian', count: 1 },
        'ubaidian-x01e': { race: 'ubaidian', count: 1 },
        'ubaidian-x02': { race: 'ubaidian', count: 2 },
        'ubaidian-x03': { race: 'ubaidian', count: 1 },
        'ubaidian-x04': { race: 'ubaidian', count: 3 },
        'mechan-x01': { race: 'mechan', count: 2 },
        'mechan-x02': { race: 'mechan', count: 2 },
        'mechan-x03': { race: 'mechan', count: 2 },
        'general-x01': { race: 'ubaidian', count: 0 },
        'general-x02': { race: 'ubaidian', count: 0 }
      };
  for(var chassis in iterator) {
    for(var i=0; i<iterator[chassis].count; i++) {
      this.generateRandomShip(chassis, iterator[chassis].race);
    }
  }
};

ShipManager.prototype.generatePirateShips = function() {
  var base, ship,
      iterator = [{
        location: { x: -4096, y: 2048 },
        ships: [
          { name: 'xinli', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'mocolo', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'mavero', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'saag', chassis: 'pirate-x02', credits: 750, reputation: -100 } 
        ]
      }, {
        location: { x: 8192, y: 2048 },
        ships: [
          { name: 'satel', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          { name: 'oeem', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          { name: 'thath', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'zeus', chassis: 'pirate-x03b', credits: 1800, reputation: -300 }
        ]
      }, {
        location: { x: 2048, y: -6144 },
        ships: [
          { name: 'manduk', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'deuh', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          { name: 'talai', chassis: 'pirate-x03b', credits: 700, reputation: -100 },
          { name: 'kaan', chassis: 'pirate-x03b', credits: 1800, reputation: -300 }
        ]
      }, {
        location: { x: 2048, y: 8192 },
        ships: [
          { name: 'theni', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          { name: 'zulu', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          { name: 'saroc', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'malvo', chassis: 'pirate-x02', credits: 750, reputation: -100 }
          // { name: 'mocolo', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          // { name: 'mavero', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          // { name: 'saag', chassis: 'pirate-x03b', credits: 1800, reputation: -300 }
        ]
      }, {
        location: { x: 7048, y: 8192 },
        ships: [
          { name: 'figo', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          { name: 'zulio', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'carlos', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'wunwun', chassis: 'pirate-x01', credits: 700, reputation: -100 }
          // { name: 'tubes', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          // { name: 'mikey', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          // { name: 'grassy', chassis: 'pirate-x02', credits: 750, reputation: -100 }
        ]
      }, {
        location: { x: 5048, y: -9192 },
        ships: [
          { name: 'marco', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          { name: 'poozer', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          { name: 'scanwan', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'lobos', chassis: 'pirate-x02', credits: 750, reputation: -100 },
          { name: 'jolder', chassis: 'pirate-x01', credits: 700, reputation: -100 }
          // { name: 'creemie', chassis: 'pirate-x01', credits: 700, reputation: -100 },
          // { name: 'bob', chassis: 'pirate-x02', credits: 750, reputation: -100 }
        ]
    }],
      len = iterator.length;

  // create pirates
  for(var i=0; i<len; i++) {
    base = iterator[i];
    for(var s=0; s<base.ships.length; s++) {
      ship = base.ships[s];

      this.create({
        name: ship.name,
        chassis: ship.chassis,
        credits:  global.Math.floor(ship.credits * global.Math.random() + 100),
        reputation: global.Math.floor(ship.reputation * (1 + global.Math.random())),
        throttle: 1.0,
        ai: 'pirate',
        x: base.location.x,
        y: base.location.y
      });
    }
  }
};

ShipManager.prototype.generateTestShips = function() {
  var base, ship,
      iterator = [
      // {
      //   location: { x: -4096, y: 2048 },
      //   ships: [
      //     { name: 'xinli', chassis: 'pirate-x02', credits: 750, reputation: -100 }
      //   ]
      // }, 
      // {
      //   location: { x: 8192, y: 2048 },
      //   ships: [
      //     { name: 'satel', chassis: 'pirate-x01', credits: 700, reputation: -100 }
      //   ]
      // }, 
      {
        location: { x: 2048, y: -6144 },
        ships: [
          { name: 'manduk', chassis: 'pirate-x02', credits: 750, reputation: -100 }
        ]
      }],
      len = iterator.length;

  // create ships
  for(var i=0; i<len; i++) {
    base = iterator[i];
    for(var s=0; s<base.ships.length; s++) {
      ship = base.ships[s];

      this.create({
        name: ship.name,
        chassis: ship.chassis,
        credits:  global.Math.floor(ship.credits * global.Math.random() + 100),
        reputation: global.Math.floor(ship.reputation * (1 + global.Math.random())),
        throttle: 1.0,
        ai: 'pirate',
        x: base.location.x,
        y: base.location.y
      });
    }
  }
};

ShipManager.prototype.generateScavengerShips = function() {
  var base, ship,
      iterator = [
      {
        location: { x: -12192, y: 12192 },
        ships: [
          { name: 'vun-saaghath', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
          { name: 'vun-mocolo', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
          { name: 'vun-shidu', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          { name: 'vun-zozu', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
          { name: 'vun-thovu', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          { name: 'vun-thaide', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          { name: 'vun-sejini', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          { name: 'vun-bogu', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
          { name: 'vun-macros', chassis: 'scavengers-x01', credits: 0, reputation: -100 }
          // { name: 'vun-zizulo', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          // { name: 'vun-wivero', chassis: 'scavengers-x01', credits: 0, reputation: -100 }
        ]
      },
      {
        location: { x: 12192, y: -12192 },
        ships: [
          { name: 'mol-saaghath', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          { name: 'mol-mocolo', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
          { name: 'mol-shidu', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
          { name: 'mol-zozu', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
          { name: 'mol-thovu', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          { name: 'mol-thaide', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          { name: 'mol-sejini', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
          { name: 'mol-bogu', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          { name: 'mol-macros', chassis: 'scavengers-x01', credits: 0, reputation: -100 }
          // { name: 'mol-zizulo', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
          // { name: 'mol-wivero', chassis: 'scavengers-x01', credits: 0, reputation: -100 }
        ]
      }
      ],
      len = iterator.length;

  // create scavengers
  for(var i=0; i<len; i++) {
    base = iterator[i];
    for(var s=0; s<base.ships.length; s++) {
      ship = base.ships[s];

      this.create({
        name: ship.name,
        chassis: ship.chassis,
        credits:  global.Math.floor(ship.credits * global.Math.random() + 100),
        reputation: global.Math.floor(ship.reputation * (1 + global.Math.random())),
        throttle: 1.0,
        ai: 'scavenger',
        x: base.location.x,
        y: base.location.y
      });
    }
  }
};

ShipManager.prototype.generateEnforcerShips = function(uuid, masterx, mastery) {
  if(!uuid){
    this.create({
      name: 'Judicator',
      chassis: 'enforcers-x02',
      throttle: 1.0,
      ai: 'enforcer',
      credits: 2000,
      reputation: 800,
      x: 3548,
      y: -3548,
      squadron: {}
    });

    this.create({
      name: 'Emerald Chime',
      chassis: 'enforcers-x02',
      throttle: 1.0,
      ai: 'enforcer',
      credits: 2000,
      reputation: 800,
      x: -5000,
      y: 4070,
      squadron: {}
    });

    this.create({
      name: 'Ivory Sentinel',
      chassis: 'enforcers-x02',
      throttle: 1.0,
      ai: 'enforcer',
      credits: 2000,
      reputation: 800,
      x: 8070,
      y: 3070,
      squadron: {}
    });
  };
  if(uuid){
    var nameCount = 1,
        iterator = {
          'enforcers-x01': { race: 'ubaidian', count: 2 }
        };
    for(var chassis in iterator) {
      for(var i=0; i<iterator[chassis].count; i++) {
        this.create({
          name: 'hammer'+nameCount,
          chassis: 'enforcers-x01',
          credits:  500,
          reputation: 100,
          throttle: 1.0,
          ai: 'enforcer',
          x: masterx,
          y: mastery,
          master: uuid
        });
        nameCount++
      };
    };
  };
};

ShipManager.prototype.spawnQueen = function(position, uuid){
  console.log(position)
  var ships = this.ships,
      cycle = this.ai.queenSpawnCycle,
      spawnPosition = {}, masterShip, rando;

  if(position === 'bottom'){
    spawnPosition.x = -9360;
    spawnPosition.y = 11750;
  } else if(position === 'top'){
    spawnPosition.x = 9360;
    spawnPosition.y = -11750;
  } else if(uuid){
    masterShip = ships[uuid];
  };

  if(!uuid){
    //create queen
    this.create({
      name: 'Fenris'+cycle,
      chassis: 'scavengers-x04d',
      throttle: 1.0,
      ai: 'scavenger',
      credits: 5000,
      reputation: -1000,
      x: spawnPosition.x,
      y: spawnPosition.y,
      toporbot: position,
      squadron: {}
    });

    this.sockets.emit('global/sound/spawn', 'queenSpawn');
  } else {
    console.log('queen --> overseer')
    //create overseers
    rando = this.game.rnd
    for(var i = 0; i < cycle*rando.s0+1; i++){
      console.log('overseer created')
      this.create({
        name: 'overseer' + cycle,
        chassis: 'scavengers-x03c',
        throttle: 1.0,
        ai: 'scavenger',
        credits: 2000,
        reputation: -650,
        x: spawnPosition.x,
        y: spawnPosition.y,
        master: uuid
      });
    }
  }

};

ShipManager.prototype.generateSquadronShips = function(uuid) {
  var base, ship,
      iterator = [{
        location: { x: -2048, y: 2048 },
        ships: [
          { name: 'redOne', chassis: 'squad-attack', credits: 500, reputation: 0 },
          { name: 'redTwo', chassis: 'squad-attack', credits: 500, reputation: 0 },
          // { name: 'redThree', chassis: 'squad-attack', credits: 500, reputation: 0 },
          { name: 'yellowOne', chassis: 'squad-repair', credits: 500, reputation: 0 },
          { name: 'blueOne', chassis: 'squad-shield_2', credits: 500, reputation: 0 }
        ]
      }],
      len = iterator.length;

  // create ships
  for(var i=0; i<len; i++) {
    base = iterator[i];
    for(var s=0; s<base.ships.length; s++) {
      ship = base.ships[s];

      this.create({
        name: ship.name,
        chassis: ship.chassis,
        credits:  ship.credits,
        reputation: ship.reputation,
        throttle: 1.0,
        ai: 'squadron',
        x: base.location.x,
        y: base.location.y,
        master: uuid
      });
    }
  }
};

ShipManager.prototype.generateRandomShip = function(chassis, race, ai) {
  var name = Generator.getName(race).toUpperCase(),
      throttle = global.Math.random() * 0.5 + 0.5,
      ai = ai || 'basic';

  this.create({
    name: name,
    chassis: chassis,
    throttle: throttle,
    ai: ai,
    credits: global.Math.floor(global.Math.random() * 250 + 50),
    reputation: global.Math.floor(100 * (1 + global.Math.random()))
  });
};

ShipManager.prototype.generateRandomPosition = function(size) {
  var game = this.game,
      size = size || game.rnd.between(1024, 2048),
      start = 2048 - (size/2),
      x = game.rnd.frac() * size,
      y = game.rnd.frac() * size;
  return new engine.Point(start + x, start + y);
};

module.exports = ShipManager;
