
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

  this.attackCount = 0;

  this.pirateAttackSwitch = false;

  this.ships = {
    basic: 5,
    enforcer: 1,
    pirate: {
      factions : {
        'katos_boys' : {
          num : 8,
          starting_position : {
            x: 6966,
            y: 4249
          }
        },
        'temeni' : {
          num : 8,
          starting_position : {
            x: -3743,
            y: -941
          }
        },
        'sappers' : {
          num : 8,
          starting_position : {
            x: 1501,
            y: 1521
          }
        }
      }
      
    }
  };

  this.chassis = {
    basic : ['ubaidian-x01a','ubaidian-x01b','ubaidian-x01c','ubaidian-x01d','ubaidian-x01e','ubaidian-x01f'],
    pirate: ['pirate-x01','pirate-x01','pirate-x01','pirate-x02'],
    squadron: ['squad-shield','squad-repair','squad-attack','squad-attack','squad-attack','squad-attack'],
    squadron2: ['squad-repair','squad-attack'],
    scavenger: ['scavenger-x01','scavenger-x02'],
    enforcer: ['enforcer-x02']
  };

};

EventManager.prototype.constructor = EventManager;

EventManager.prototype.init = function() {

  // subscribe to messaging
  // this.game.on('user/add', this.add, this);
  // this.game.on('ship/add', this.add, this);
  // this.game.on('station/add', this.add, this);
  // this.game.on('station/disabled', this.disabled, this);
  // this.game.on('ship/disabled', this.disabled, this);
  this.game.on('squad/create', this.squadGen, this);
  this.game.on('game/over', this.restart, this);

  // refresh data interval
 this.updateTimer = this.game.clock.events.loop(1000, this.update, this);

  // create default station
  this.game.emit('station/create', {
    chassis: 'ubadian-station-x01',
    x: 1501,
    y: 1521
  });

  this.game.emit('station/create', {
    chassis: 'general-station-x01',
    x: -3743,
    y: -941
  });

  this.game.emit('station/create', {
    chassis: 'general-station-x01',
    x: 6966,
    y: 4249
  });

  // create scavenger nests
  this.game.emit('station/create', {
    chassis: 'scavenger-x01',
    x: 5411, 
    y: -5354,
    radius: 0
  });

  this.game.emit('station/create', {
    chassis: 'scavenger-x01',
    x: -5055,
    y: 4973,
    radius: 0
  });

  //generate ships
  for(var a in this.ships){
    if(this.ships[a].factions){
      for(var f in this.ships[a].factions){
        this.shipGen(this.ships[a].factions[f].num, a.toString(), this.ships[a].factions[f].starting_position, f)
      }
    }else{
      this.shipGen(this.ships[a], a.toString())
    }
  };

  this.scavGen(16);
  
};

EventManager.prototype.shipGen = function(num, ai, startingPos, faction){
  var randomPostion;
  randomPostion = this.generateRandomPosition(6000); 
  if(ai === 'pirate'){
    for(var i = 0; i < num; i++){
      this.game.emit('ship/create', {
        chassis: this.game.rnd.pick(this.chassis['pirate']),
        x: startingPos.x,
        y: startingPos.y,
        ai: 'pirate',
        faction: faction
      });
    }
  } else {
    for(var i = 0; i<num; i++){
      this.game.emit('ship/create', {
        chassis: this.game.rnd.pick(this.chassis[ai]),
        x: randomPostion.x,
        y: randomPostion.y,
        ai: ai
      })
    }
  } 
};

EventManager.prototype.squadGen = function(master){
  var chassis3, chassis2, chassis1 = this.game.rnd.pick(this.chassis['squadron']),
      randomPostion = this.generateRandomPosition(2700),
      randomPostion2 = this.generateRandomPosition(2700),
      rando = this.game.rnd.frac();

  if(chassis1 === 'squad-shield'){
    chassis2 = this.game.rnd.pick(this.chassis['squadron2'])
  } else {
    chassis2 = this.game.rnd.pick(this.chassis['squadron'])
  };
  if(chassis2 === 'squad-shield' || chassis1 === 'squad-shield'){
    chassis3 = this.game.rnd.pick(this.chassis['squadron2'])
  } else {
    chassis3 = this.game.rnd.pick(this.chassis['squadron'])
  }
  // this.game.emit('ship/create', {
  //   chassis: 'squad-attack',
  //   x: randomPostion.x,
  //   y: randomPostion.y,
  //   ai: 'squadron',
  //   master: master
  // });

  if(rando > 0.6){
    this.game.emit('ship/create', {
      chassis: chassis1,
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });

    this.game.emit('ship/create', {
      chassis: chassis2,
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });

    this.game.emit('ship/create', {
      chassis: chassis3,
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });
  } else if(rando > 0.3){
    this.game.emit('ship/create', {
      chassis: chassis1,
      x: randomPostion2.x,
      y: randomPostion2.y,
      ai: 'squadron',
      master: master
    });
    this.game.emit('ship/create', {
      chassis: chassis2,
      x: randomPostion2.x,
      y: randomPostion2.y,
      ai: 'squadron',
      master: master
    });
  } else {
    this.game.emit('ship/create', {
      chassis: chassis1,
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
      rando = this.game.rnd.frac(),
      spawnPosition = {}, position;
  if(cycle % 2 === 0){
    spawnPosition.x = -5055;
    spawnPosition.y = 4973;
    position = 'bottom'
  } else {
    spawnPosition.x = 5411;
    spawnPosition.y = -5354;
    position = 'top';
  };

  if(!uuid){
    //create queen
    this.game.emit('ship/create', {
      chassis: 'scavenger-x04',
      ai: 'scavenger',
      x: spawnPosition.x,
      y: spawnPosition.y,
      cycle: cycle,
      brood: {}
    });
    this.sockets.send('global/sound/spawn', 'queenSpawn');
  } else {
    //create overseers
    var overseerCount = this.game.rnd.pick([1,2,3])
    for(var i = 0; i < overseerCount; i++){
      this.game.emit('ship/create', {
        chassis: 'scavenger-x03',
        ai: 'scavenger',
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
  this.attackCount ++

  if(this.attackCount % 13 === 0){
  // if(this.attackCount == 20){  
    if(this.pirateAttackSwitch){
      this.hostilePirateFaction = 'temeni'
      this.pirateAttackSwitch = false;
    } else {
      this.hostilePirateFaction = 'katos_boys'
      this.pirateAttackSwitch = true;
    }
    this.game.emit('pirate/attackStation', 'pirate', this.hostilePirateFaction)

    if(this.attackCount > 104){
      this.attackCount = 0;
      this.game.emit('pirate/attackStation', 'clear')
    }
  }
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

EventManager.prototype.restart = function() {
  this.updateTimer && this.game.clock.events.remove(this.updateTimer);

  // this.game.removeListener('user/add', this.add);
  // this.game.removeListener('ship/add', this.add, this);
  // this.game.removeListener('station/add', this.add, this);
  this.game.removeListener('station/disabled', this.disabled, this);
  this.game.removeListener('ship/disabled', this.disabled, this);
  this.game.removeListener('squad/create', this.squadGen, this);
  this.game.removeListener('game/over', this.restart, this);

  this.init();
};

EventManager.prototype.generateRandomPosition = function(size) {
  var rnd = this.game.rnd,
      size = size || rnd.between(1024, 3048),
      start = 2048 - (size/2),
      x = rnd.frac() * size,
      y = rnd.frac() * size;
  return new engine.Point(start + x, start + y);
};

EventManager.prototype.generateRandomRotation = function() {
  return this.game.rnd.frac() * engine.Math.PI;
};

module.exports = EventManager;
