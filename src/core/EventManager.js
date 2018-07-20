
var uuid = require('uuid'),
    engine = require('engine'),
    User = require('./objects/User'),
    Ship = require('./objects/Ship'),
    Station = require('./objects/Station'),
    AI = require('./AI')
    Utils = require('../utils');

function EventManager(game, manager) {
  this.game = game;
  this.sectorManager = manager;
  this.model = game.model;
  this.sockets = game.sockets;

  this.attackCount = 0;

  this.pirateAttackSwitch = false;

  this.wavecycleCount = 0;
  this.passiveWave = 0;

  this.game.clock.events.loop(1000, this.wavecycle, this);
  this.ships = {
    basic: 7,
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

  // this.ships = {
  //   basic: 0,
  //   enforcer: 0,
  //   pirate: {
  //     factions : {
  //       'katos_boys' : {
  //         num : 0,
  //         starting_position : {
  //           x: 6966,
  //           y: 4249
  //         }
  //       },
  //       'temeni' : {
  //         num : 0,
  //         starting_position : {
  //           x: -3743,
  //           y: -941
  //         }
  //       },
  //       'sappers' : {
  //         num : 0,
  //         starting_position : {
  //           x: 1501,
  //           y: 1521
  //         }
  //       }
  //     }
      
  //   }
  // };

  this.chassis = {
    basic: ['ubaidian-x01a', 'ubaidian-x01b', 'ubaidian-x01c', 'ubaidian-x01d', 'ubaidian-x01e', 'ubaidian-x01f', 'ubaidian-x02', 'ubaidian-x03', 'ubaidian-x04'],
    pirate: ['pirate-x01','pirate-x01','pirate-x01','pirate-x02'],
    // pirate: ['pirate-x03'],
    squadron: ['squad-shield','squad-repair','squad-attack','squad-attack','squad-attack','squad-attack'],
    squadron2: ['squad-repair','squad-attack'],
    scavenger: ['scavenger-x01','scavenger-x02'],
    enforcer: ['enforcer-x02']
  };

  this.spawnSets = {
    1 : {'katos_boys' : {'pirate-x01' : 2},'temeni' : {'pirate-x01' : 1, 'pirate-x03' : 1}},
    2 : {'katos_boys' : {'pirate-x01' : 3, 'pirate-x03' : 1},'temeni' : {'pirate-x01' : 2}}, 
    3 : {'katos_boys' : {'pirate-x01' : 2},'temeni' : {'pirate-x02' : 2}},
    4 : {'katos_boys' : {'pirate-x01' : 1,'pirate-x02' : 1},'temeni' : {'pirate-x01' : 2,'pirate-x02' : 1}},
    5 : {'katos_boys' : {'pirate-x01' : 3,'pirate-x02' : 1},'temeni' : {'pirate-x03' : 1,'pirate-x02' : 1}}, 
    6 : {'katos_boys' : {'pirate-x02' : 2, 'pirate-x03' : 2},'temeni' : {'pirate-x01' : 4}},
    7 : {'katos_boys' : {'pirate-x03' : 1,'pirate-x04' : 1},'temeni' : {'pirate-x01' : 3,'pirate-x02' : 1}},
    8 : {'katos_boys' : {'pirate-x01' : 2,'pirate-x04' : 1},'temeni' : {'pirate-x01' : 3,'pirate-x04' : 1}},
    9 : {'katos_boys' : {'pirate-x01' : 4,'pirate-x04' : 1},'temeni' : {'pirate-x01' : 4,'pirate-x04' : 1}},
    10 : {'katos_boys' : {'pirate-x01' : 4,'pirate-x02' : 2,'pirate-x04' : 1},'temeni' : {'pirate-x01' : 4,'pirate-x02' : 2,'pirate-x03' : 1}}
  };
};

EventManager.prototype.constructor = EventManager;

EventManager.prototype.init = function() {

  // subscribe to messaging
  // this.game.on('user/add', this.add, this);
  // this.game.on('ship/add', this.add, this);
  // this.game.on('station/add', this.add, this);
  // this.game.on('station/disabled', this.disabled, this);

  this.game.on('wave/cycle/complete', this.wavecycleComplete, this);
  this.game.on('ship/disabled', this.disabled, this);
  this.game.on('squad/create', this.squadGen, this);
  this.game.on('station/disabled', this.disabled, this);
  this.game.on('game/over', this.restart, this);


  this.sockets.on('tutorial/createShip', this.createTutorialShips, this);
  this.sockets.on('tutorial/finished', this.tutorialComplete, this);

  // refresh data interval
 this.updateTimer = this.game.clock.events.loop(1000, this.update, this);
  this.spawning = false;
  this.stationGen();
  this.scavGen(16);
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
};
EventManager.prototype.createTutorialShips = function(socket, args){
  if(!this.spawning){
    this.spawning = true;
    this.spawnOnTimer && this.game.clock.events.remove(this.spawnOnTimer)
    this.spawnOnTimer = this.game.clock.events.add(3000, function () {
      this.spawning = false;
    }, this);
    this.game.emit('ship/create', {
        chassis: 'pirate-x01',
        x: args[1].x,
        y: args[1].y,
        ai: 'pirate',
        tutorialTargetID: args[1].player_uuid,
        faction: 'tutorial'
    });
  };
};

EventManager.prototype.tutorialComplete = function(socket, args){
  var playerId = args[1];
  if (this.game.users[playerId]) {
    this.game.emit('ship/remove', this.game.users[playerId].ship)
    this.game.emit('user/remove', this.game.users[playerId])
    }
};

EventManager.prototype.stationGen = function(){
  // create default station
  this.game.emit('station/create', {
    chassis: 'ubadian-station-x01',
    x: 1501,
    y: 1521,
    faction: 'imperial'
  });

  this.game.emit('station/create', {
    chassis: 'general-station-x01',
    x: -3743,
    y: -941,
    faction: 'temeni'
  });

  this.game.emit('station/create', {
    chassis: 'general-station-x01',
    x: 6966,
    y: 4249,
    faction: 'katos_boys'
  });

  this.game.emit('station/create', {
    chassis: 'platform',
    x: 16000,
    y: 16000,
    faction: 'tutorial'
  });

  this.game.emit('station/create', {
    chassis: 'platform',
    x: -17000,
    y: -18000,
    faction: 'tutorial'
  });

  this.game.emit('station/create', {
    chassis: 'tutorial-platform',
    x: -18000,
    y: 17000,
    faction: 'tutorial'
  });

  this.game.emit('station/create', {
    chassis: 'platform',
    x: 20000,
    y: -14000,
    faction: 'tutorial'
  });



  // create scavenger nests
  this.game.emit('station/create', {
    chassis: 'scavenger-x01',
    x: 5411, 
    y: -5354,
    faction : 'vulothi'
  });

  this.game.emit('station/create', {
    chassis: 'scavenger-x01',
    x: -5055,
    y: 4973,
    faction : 'fenris'
  });

  this.stationCounts = {
    'imperial' : 1,
    'katos_boys' : 1,
    'temeni' : 1,
    'vulothi' : 1,
    'fenris' : 1
  };
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

  this.game.emit('ship/create', {
    chassis: 'squad-attack',
    x: randomPostion.x,
    y: randomPostion.y,
    ai: 'squadron',
    master: master
  });
  return
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


  if(rando > 0.5){
    this.game.emit('ship/create', {
      chassis: 'squad-attack',
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });
      this.game.emit('ship/create', {
      chassis: 'squad-attack',
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });
    this.game.emit('ship/create', {
      chassis: 'squad-shield',
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });
  } else {
    this.game.emit('ship/create', {
      chassis: 'squad-attack',
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });
      this.game.emit('ship/create', {
      chassis: 'squad-attack',
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });
    this.game.emit('ship/create', {
      chassis: 'squad-repair',
      x: randomPostion.x,
      y: randomPostion.y,
      ai: 'squadron',
      master: master
    });
  }
return
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
  } else if(this.game.stations[object.uuid] && this.game.stations[object.uuid].faction){
      switch(this.game.stations[object.uuid].faction) {
        case 'imperial':
        this.stationCounts.imperial--
        this.lossCondition();
          break;
        case 'temeni':
        this.stationCounts.temeni--
        this.winCondition();
          break;
        case 'katos_boys':
          this.stationCounts.katos_boys-- 
          this.winCondition();
          break;
        case 'vulothi':
          break;
        case 'fenris':
          break;
      }
  }
};

EventManager.prototype.wavecycle = function(){
  this.wavecycleCount++
  this.sockets.send('wave/cycle', this.wavecycleCount);
  if(this.wavecycleCount >= 60){
    this.wavecycleCount = 0;
    this.game.emit('wave/cycle/complete');
    this.passiveWave++
    if(this.passiveWave > 4){
      this.waveSpawn(5)
      this.passiveWave = 0;
    }
  };
};

EventManager.prototype.wavecycleComplete = function(num){
  var wave;
  for(var u in this.game.users){
    if(this.game.users[u].tutorial){
      continue
    }
    if(this.game.users[u].wave > 10){
      wave = 10
    } else {
      wave = this.game.users[u].wave;
    }
    // var wave = this.game.users[u].wave;
    if(this.game.users[u].ship){
      this.waveSpawn(wave);
      this.game.users[u].wave++;
    };
  };
  this.game.emit('send_user_data');

};

EventManager.prototype.waveSpawn = function(num){
  var set, start;
  if(this.spawnSets[num]){
    set = this.spawnSets[num];
    for(var s in set){
      if(s === 'katos_boys'){
        start = {x: 6966, y: 4249}
      } else if(s === 'temeni'){
        start = {x: -3743, y: -941}
      };
      for(var ship in set[s]){
        if(!this.stationCounts[s]){
          continue
        }
        for(var i = 0; i < set[s][ship]; i++){
          this.game.emit('ship/create', {
            chassis: ship,
            x: start.x,
            y: start.y,
            ai: 'pirate',
            faction: s
          });
        }
        
      }

    };
  };
};

EventManager.prototype.update = function() {
  this.attackCount ++

  if(this.attackCount % 10 === 0){
  // if(this.attackCount == 20){  
    if(this.pirateAttackSwitch){
      this.hostilePirateFaction = 'temeni'
      this.pirateAttackSwitch = false;
    } else {
      this.hostilePirateFaction = 'katos_boys'
      this.pirateAttackSwitch = true;
    }
    this.game.emit('pirate/attackStation', 'pirate', this.hostilePirateFaction);
    if(this.attackCount >= 121){
      this.attackCount = 0;
      this.game.emit('pirate/attackStation', 'clear')
    };
  };
};

EventManager.prototype.winCondition = function(){
  if(this.stationCounts.katos_boys === 0 && this.stationCounts.temeni === 0){
    //WIN GAME
    this.sockets.send('game/win');
    this.game.clock.events.add(4000, function(){
      this.game.emit('game/over');
    }, this);
  };
};

EventManager.prototype.lossCondition = function(){
  if(this.stationCounts.imperial === 0){
    this.game.clock.events.add(4000, function(){
      this.game.emit('game/over');
    }, this);
  };
};

EventManager.prototype.restart = function() {
  this.updateTimer && this.game.clock.events.remove(this.updateTimer);
  this.game.clock.events.clearPendingEvents();
  this.game.removeListener('wave/cycle/complete', this.wavecycleComplete, this);
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
