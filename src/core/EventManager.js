
var uuid = require('uuid'),
    engine = require('engine'),
    User = require('./objects/User'),
    Ship = require('./objects/Ship'),
    Station = require('./objects/Station'),
    AI = require('./AI')
    Utils = require('../utils');

function EventManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  this.level = 1;
  this.ships = {
    basic: 2,
    pirate: 4
  };

  this.chassis = {
    basic : ['ubaidian-x01a','ubaidian-x01b','ubaidian-x01c','ubaidian-x01d','ubaidian-x01e','ubaidian-x01f'],
    pirate: ['scavenger-x01','scavenger-x02'],
    squadron: ['squad-shield','squad-repair','squad-attack']
  };

  this.spawnPoints = {
    scavenger: [{
        x: -12192,
        y: 12192
    }, {
        x: 12192, 
        y: -12192
    }]
  };
};

EventManager.prototype.constructor = EventManager;

EventManager.prototype.init = function() {
  // subscribe to messaging
  this.game.on('user/add', this.add, this);
  this.game.on('ship/add', this.add, this);
  this.game.on('station/add', this.add, this);
  this.game.on('station/disabled', this.disabled, this);
  this.game.on('ship/disabled', this.disabled, this);
  this.game.on('squad/create', this.squadGen, this);

  // refresh data interval
  this.game.clock.events.loop(1000, this.update, this);

  // create default station
  this.game.emit('station/create', {
    default: true,
    chassis: 'ubadian-station-x01',
    x: 2048,
    y: 2048,
    radius: 512
  });

  //generate ships
  for(var a in this.ships){
    this.shipGen(this.ships[a], a.toString())
  };

  this.scavGen();
};

EventManager.prototype.shipGen = function(num, ai){
  for(var i = 0; i<num; i++){
    this.game.emit('ship/create', {
      chassis: this.game.rnd.pick(this.chassis[ai]),
      x: 2048,
      y: 2048,
      ai: ai
    });
  };
};

EventManager.prototype.squadGen = function(master){
  this.game.emit('ship/create', {
    // chassis: this.game.rnd.pick(this.chassis['squadron']),
    chassis: this.game.rnd.pick(this.chassis['squadron']),
    x: 2048,
    y: 2048,
    ai: 'squadron',
    master: master
  });
  this.game.emit('ship/create', {
    // chassis: this.game.rnd.pick(this.chassis['squadron']),
    chassis: this.game.rnd.pick(this.chassis['squadron']),
    x: 2048,
    y: 2048,
    ai: 'squadron',
    master: master
  });
};

EventManager.prototype.scavGen = function() {
  var spawnSet = [{x: -12192, y: 12192},{x: 12192, y: -12192}],
      rando = Math.floor((Math.random() * 2)),
      spawnPoint = spawnSet[rando];
      // Math.floor((Math.random() * 1))
  // this.game.rnd.pick(this.spawnPoints['scavenger'])
  console.log(spawnPoint)
  // this.game.emit('ship/create', {
  //   // chassis: this.game.rnd.pick(this.chassis['squadron']),
  //   chassis: this.game.rnd.pick(this.chassis['squadron']),
  //   x: 2048,
  //   y: 2048,
  //   ai: 'squadron',
  //   master: master
  // }); 


  // var base, ship,
  //     iterator = [
  //     {
  //       location: { x: -12192, y: 12192 },
  //       ships: [
  //         { name: 'vun-saaghath', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
  //         { name: 'vun-mocolo', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
  //         { name: 'vun-shidu', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         { name: 'vun-zozu', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
  //         { name: 'vun-thovu', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         { name: 'vun-thaide', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         { name: 'vun-sejini', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         { name: 'vun-bogu', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
  //         { name: 'vun-macros', chassis: 'scavengers-x01', credits: 0, reputation: -100 }
  //         // { name: 'vun-zizulo', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         // { name: 'vun-wivero', chassis: 'scavengers-x01', credits: 0, reputation: -100 }
  //       ]
  //     },
  //     {
  //       location: { x: 12192, y: -12192 },
  //       ships: [
  //         { name: 'mol-saaghath', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         { name: 'mol-mocolo', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
  //         { name: 'mol-shidu', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
  //         { name: 'mol-zozu', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
  //         { name: 'mol-thovu', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         { name: 'mol-thaide', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         { name: 'mol-sejini', chassis: 'scavengers-x02', credits: 0, reputation: -100 },
  //         { name: 'mol-bogu', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         { name: 'mol-macros', chassis: 'scavengers-x01', credits: 0, reputation: -100 }
  //         // { name: 'mol-zizulo', chassis: 'scavengers-x01', credits: 0, reputation: -100 },
  //         // { name: 'mol-wivero', chassis: 'scavengers-x01', credits: 0, reputation: -100 }
  //       ]
  //     }
  //     ],
  //     len = iterator.length;

  // create scavengers
  // for(var i=0; i<len; i++) {
  //   base = iterator[i];
  //   for(var s=0; s<base.ships.length; s++) {
  //     ship = base.ships[s];

  //     this.create({
  //       name: ship.name,
  //       chassis: ship.chassis,
  //       credits:  global.Math.floor(ship.credits * global.Math.random() + 100),
  //       reputation: global.Math.floor(ship.reputation * (1 + global.Math.random())),
  //       throttle: 1.0,
  //       ai: 'scavenger',
  //       x: base.location.x,
  //       y: base.location.y
  //     });
  //   }
  // }
};

EventManager.prototype.add = function(object) {
  if(object instanceof User) {
    // connect home station
    // object.station = this.station;
    // object.data.station = this.station.uuid;
  } else if(object instanceof Station) {
    // if(this.station !== object && object.data.default) {
    //   this.station = object;
    //   this.game.emit('user/data', {
    //     type: 'all', users: [{
    //       station: this.station.uuid
    //     }]
    //   });
    // }
  }
};

EventManager.prototype.destroyed = function(object) {
  //..
};

EventManager.prototype.disabled = function(object) {
  if(object.ai) {
    switch(object.ai.type) {
      case 'basic':
        this.ships.basic--;
        break;
      case 'pirate':
        this.ships.pirate--;
        break;
    }
  }
};

EventManager.prototype.update = function() {
  // if(this.ships.pirate < 2 && this.game.rnd.frac() > 0.75) {
  //   this.ships.pirate++;
  //   this.game.emit('ship/create', {
  //     x: 2048,
  //     y: 2048,
  //     chassis: 'general-x01',
  //     ai: 'pirate'
  //   });
  // }
  // if(this.ships.basic < 3 && this.game.rnd.frac() > 0.75) {
  //   this.ships.basic++;
  //   this.game.emit('ship/create', {
  //     x: 2048,
  //     y: 2048,
  //     chassis: 'ubaidian-x04',
  //     ai: 'basic'
  //   });
  // }
};

EventManager.prototype.generateRandomPosition = function(size) {
  var rnd = this.game.rnd,
      size = size || rnd.between(1024, 2048),
      start = 2048 - (size/2),
      x = rnd.frac() * size,
      y = rnd.frac() * size;
  return new engine.Point(start + x, start + y);
};

EventManager.prototype.generateRandomRotation = function() {
  return this.game.rnd.frac() * engine.Math.PI;
};

module.exports = EventManager;
