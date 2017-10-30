
var uuid = require('uuid'),
    engine = require('engine'),
    User = require('./objects/User'),
    Ship = require('./objects/Ship'),
    Station = require('./objects/Station'),
    Utils = require('../utils');

function EventManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;

  this.ships = {
    basic: 0,
    pirate: 0
  };

  this.stations = {
    basic: null,
    pirate: null
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

  // refresh data interval
  this.game.clock.events.loop(1000, this.update, this);
};

EventManager.prototype.start = function() {
  // create default station
  this.game.emit('station/create', {
    chassis: 'ubaidian-x01',
    race: 'ubaidian',
    x: 2048,
    y: 2048,
    radius: 512
  });

  // create pirate base
  this.game.emit('station/create', {
    chassis: 'general-x01',
    race: 'general',
    x: 0,
    y: 0,
    radius: 512
  });
};

EventManager.prototype.add = function(object) {
  var stations = this.stations;

  if(object instanceof User) {

  } else if(object instanceof Ship) {
    if(object.ai) {
      switch(object.ai.type) {
        case 'basic':
        case 'squadron':
          object.station = stations.basic;
          object.data.station = stations.basic.uuid;
          break;
        case 'pirate':
          object.station = stations.pirate;
          object.data.station = stations.pirate.uuid;
        default:
          break;
      }
    } else {
      object.station = stations.basic;
      object.data.station = stations.basic.uuid;
    }
  } else if(object instanceof Station) {
    switch(object.data.race) {
      case 'ubaidian':
        stations.basic = object;
        break;
      case 'general':
        stations.pirate = object;
        break;
    }
  }
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
  if(this.ships.pirate < 2) {
    this.ships.pirate++;
    this.game.emit('ship/create', {
      chassis: 'general-x0' + global.Math.ceil(global.Math.random() * 2),
      ai: 'pirate'
    });
  }
  if(this.ships.basic < 0) {
    this.ships.basic++;
    this.game.emit('ship/create', {
      chassis: 'ubaidian-x0' + global.Math.ceil(global.Math.random() * 5),
      ai: 'basic'
    });
  }
};

module.exports = EventManager;
