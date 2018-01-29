
var engine = require('engine');

function EventManager(game) {
  this.game = game;
  this.model = game.model;
  this.sockets = game.sockets;
  this.rnd = game.rnd;

  // game stations
  this.stations = {
    ubaidian: [],
    general: []
  }

  // game ships
  this.ships = {
    ubaidian: [],
    general: []
  }

  // damage output
  this.dps = {
    ubaidian: 0,
    general: 0
  }
};

EventManager.prototype.constructor = EventManager;

EventManager.prototype.init = function() {
  // subscribe to messaging
  this.game.on('ship/add', this.add('ships'), this);
  this.game.on('station/add', this.add('stations'), this);
  this.game.on('ship/remove', this.remove('ships'), this);
  this.game.on('station/remove', this.remove('stations'), this);
};

EventManager.prototype.add = function(type) {
  var collection = this[type];
  return function(object) {
    collection[object.data.race].push(object);
  };
};

EventManager.prototype.remove = function(type) {
  var index, objects, object, removed,
      game = this.game,
      collection = this[type];
  return function(object) {
    objects = collection[object.race];
    index = objects.indexOf(object);

    if(index > -1) {
      removed = engine.Utility.splice(objects, index);
    }
  };
};

EventManager.prototype.update = function() {
  var races = ['ubaidian', 'general'];
  for(var r in races) {
    this.station(races[r]);
    this.ship(races[r])
  }
};

EventManager.prototype.station = function(race) {
  var game = this.game,
      rnd = this.rnd,
      stations = this.stations[race],
      radius,
      position = new engine.Point(2048, 2048),
      vector = new engine.Point()
      pi2 = 2.0*global.Math.PI;
  if(stations.length == 0) {
    if(race === 'ubaidian') {
      radius = rnd.integerInRange(512, 768);
    } else {
      engine.Point.rotate(position, 2048, 2048, rnd.realInRange(0, pi2), false, rnd.integerInRange(3072, 5120));
      radius = rnd.integerInRange(192, 256);
    }

    // create station
    game.emit('station/create', {
      chassis: race + '-x01',
      x: position.x,
      y: position.y,
      radius: radius,
      rotation: rnd.realInRange(0, pi2),
      period: rnd.realInRange(0, pi2)
    });
  }
};

EventManager.prototype.ship = function(race) {
  var game = this.game,
      rnd = this.rnd,
      ships = this.ships[race],
      station = this.primary('stations', race),
      count = race === 'ubaidian' ? 4 : 8,
      squad = race === 'ubaidian' ? 6 : 1,
      chassis = rnd.integerInRange(
        1, race === 'ubaidian' ? 8 : 2
      );

  // create ship
  if(ships.length < count) {
    game.emit('ship/create', {
      station: station.uuid,
      chassis: race + '-x0' + chassis,
      x: station.movement.position.x,
      y: station.movement.position.y,
      rotation: rnd.realInRange(0, 2.0*global.Math.PI),
      ai: race === 'ubaidian' ? 'basic' : 'pirate',
      squadron: rnd.pick([[race + '-x0' + squad, race + '-x0' + squad], []])
    });
  }
};

EventManager.prototype.primary = function(type, race) {
  if(this[type] && this[type][race] && this[type][race].length) {
    return this[type][race][0];
  } else {
    return null;
  }
};

module.exports = EventManager;
