
var uuid = require('uuid'),
    async = require('async'),
    Utils = require('../../utils');

module.exports = function(System) {
  System.DefaultData = {
    stats: {
      health: 100
    },
    ship: null,
    type: '*',
    modifier: 1.1,
    health: 100,
    heal: 3,
    energy: 25,
    durability: 1000
  };

  System.prototype.createDefaultData = function() {
    var systemData = Utils.extend({}, System.DefaultData);
        systemData.uuid = uuid.v4();
    return systemData;
  };

  System.prototype.create = function(data, callback) {
    var systemData = Utils.extend(data, System.createDefaultData());

    callback(systemData);
  };
};
