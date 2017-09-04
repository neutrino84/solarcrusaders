
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
    basic: 0,
    pirate: 1
  };

  this.chassis = {
    basic : ['ubaidian-x01a','ubaidian-x01b','ubaidian-x01c','ubaidian-x01d','ubaidian-x01e','ubaidian-x01f'],
    pirate: ['pirate-x01','pirate-x02'],
    squadron: ['squad-shield','squad-repair','squad-attack']
  }
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
    chassis: 'squad-attack',
    x: 2048,
    y: 2048,
    ai: 'squadron',
    master: master
  });
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
