
var uuid = require('uuid'),
    async = require('async'),
    Utils = require('../../utils');

module.exports = function(Ship) {
  Ship.DefaultData = {
    id: 0,
    sector: 1,
    chasis: 'vessel-x04',
    x: 2048,
    y: 2048,
    throttle: 1.0,
    rotation: 0.0,
    health: 100,
    heal: 0.01,       // 
    speed: 1.0,       // engine
    accuracy: 0.5,    // targeting
    evasion: 0.1,     // pilot
    reactor: 100,     // battery
    durability: 1000  // 
  };

  Ship.prototype.createDefaultData = function() {
    var shipData = Utils.extend({}, Ship.DefaultData); // copy
        shipData.uuid = uuid.v4();
    return shipData;
  };

  Ship.prototype.create = function(data, callback) {
    var shipData = Utils.extend(data, Ship.createDefaultData());

    callback(shipData);
  };
};
