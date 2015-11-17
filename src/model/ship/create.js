
var uuid = require('uuid'),
    async = require('async'),
    Utils = require('../../utils');

module.exports = function(Ship) {
  Ship.DefaultData = {
    sector: 1,
    chasis: 'vessel-x04',
    x: 2048,
    y: 2048,
    throttle: 1.0,
    rotation: 0.0
  }; 

  Ship.prototype.createDefaultData = function() {
    var shipData = Utils.extend({}, Ship.DefaultData); // copy
        shipData.uuid = uuid.v4();
    return shipData;
  };

  Ship.prototype.create = function(data, callback) {
    var shipData = Utils.extend(data, Ship.createDefaultData());

    //.. TODO

    callback(shipData);
  };

  Ship.prototype.persist = function(shipData) {
    var self = this;
    async.waterfall([
      function(next) {
        // self.database.incrObjectField('global', 'nextUid', next);
      },
      function(uid, next) {
        shipData.uid = uid;
        self.database.setObject('user:' + uid, shipData, next);
      },
      function(next) {
        async.parallel([
          function(next) {
            self.database.sortedSetAdd('email:uid', shipData.uid, shipData.email.toLowerCase(), next);
          },
          function(next) {
            self.database.sortedSetAdd('email:sorted', 0, shipData.email.toLowerCase() + ':' + shipData.uid, next);
          }
        ], next);
      },
      function(results, next) {
        self.setShipField(shipData.uid, 'consistent', 1, function(err) {
          if(err) { return next(err); }
          next(null, shipData);
        });
      }
    ], callback);
  };
};
