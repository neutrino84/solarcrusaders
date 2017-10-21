
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
    basic: 10,
    pirate: 26,
    enforcer: 3
  };
  // this.ships = {
  //   basic: 0,
  //   pirate: 0,
  //   enforcer: 0
  // };

  this.chassis = {
    basic : ['ubaidian-x01a','ubaidian-x01b','ubaidian-x01c','ubaidian-x01d','ubaidian-x01e','ubaidian-x01f'],
    pirate: ['pirate-x01','pirate-x02'],
    squadron: ['squad-shield','squad-repair','squad-attack','squad-attack','squad-attack','squad-attack'],
    squadron2: ['squad-repair','squad-attack'],
    scavenger: ['scavenger-x01','scavenger-x02'],
    enforcer: ['enforcer-x02']
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

  // create scavenger nests
  this.game.emit('station/create', {
    default: true,
    chassis: 'scavenger-x01',
    x: 3550*1.5, 
    y: -3550*1.5,
    radius: 0
  });

  this.game.emit('station/create', {
    default: true,
    chassis: 'scavenger-x01',
    x: -3550*1.5, 
    y: 3550*1.5,
    radius: 0
  });

  //generate ships
  for(var a in this.ships){
    this.shipGen(this.ships[a], a.toString())
  };

  this.scavGen(22);
  
};

EventManager.prototype.shipGen = function(num, ai){
  var randomPostion;

  for(var i = 0; i<num; i++){

  randomPostion = this.generateRandomPosition(6000); 

    this.game.emit('ship/create', {
      chassis: this.game.rnd.pick(this.chassis[ai]),
      x: randomPostion.x,
      y: randomPostion.y,
      ai: ai
    });
  };
};

EventManager.prototype.squadGen = function(master){
  var chassis2, chassis1 = this.game.rnd.pick(this.chassis['squadron']),
      randomPostion = this.generateRandomPosition(2700),
      randomPostion2 = this.generateRandomPosition(2700),
      rando = this.game.rnd.s0;

      console.log(rando)
      // var randSpawn = cycle*(rando.s0+rando.s1)/1.25;

  if(chassis1 === 'squad-shield'){
    chassis2 = this.game.rnd.pick(this.chassis['squadron2'])
  } else {
    chassis2 = this.game.rnd.pick(this.chassis['squadron'])
  };

  if(rando > 0.5){
    this.game.emit('ship/create', {
      // chassis: chassis1,
      chassis: 'squad-shield',
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });
  }
  if(rando > 0.8) {
    this.game.emit('ship/create', {
      chassis: this.game.rnd.pick(this.chassis['squadron2']),
      x: randomPostion2.x,
      y: randomPostion2.y,
      ai: 'squadron',
      master: master
    });
  }
};

EventManager.prototype.enforcerGen = function(x, y, master){
  for(var i = 0; i <3; i++){
    this.game.emit('ship/create', {
      chassis: 'enforcer-x01',
      x: x,
      y: y,
      ai: 'enforcer',
      master: master
    }); 
  };
};

EventManager.prototype.scavGen = function(num) {

  for(var i = 0; i < Math.round(num/2); i++){
    this.game.emit('ship/create', {
      chassis: this.game.rnd.pick(this.chassis['scavenger']),
      x: 5411,
      y: -5354,
      ai: 'scavenger',
      faction: 'vulothi'

    }); 
    this.game.emit('ship/create', {
      chassis: this.game.rnd.pick(this.chassis['scavenger']),
      x: -5055,
      y: 4973,
      ai: 'scavenger',
      faction: 'fenris'

    }); 
  };
};

EventManager.prototype.spawnQueen = function(cycle, uuid){
  var ships = this.ships,
      spawnPosition = {}, position, rando;
  if(cycle % 2 === 0){
    spawnPosition.x = -5055;
    spawnPosition.y = 4973;
    position = 'bottom'
  } else {
    spawnPosition.x = 5411;
    spawnPosition.y = -5354;
    position = 'top';
  };
  // if(uuid){
  //   queen = ships[uuid];
  // };

  if(!uuid){
    //create queen
    this.game.emit('ship/create', {
      chassis: 'scavenger-x04',
      ai: 'scavenger',
      credits: 5000,
      reputation: -1000,
      x: spawnPosition.x,
      y: spawnPosition.y,
      cycle: cycle,
      brood: {}
    });
    this.sockets.send('global/sound/spawn', 'queenSpawn');
  } else {
    //create overseers
    rando = this.game.rnd
    var randSpawn = cycle*(rando.s0+rando.s1)/1.25;
    for(var i = 0; i < randSpawn+1; i++){
      this.game.emit('ship/create', {
        chassis: 'scavenger-x03',
        ai: 'scavenger',
        credits: 2000,
        reputation: -650,
        x: spawnPosition.x,
        y: spawnPosition.y,
        queen: uuid
      });
    }
  }
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
