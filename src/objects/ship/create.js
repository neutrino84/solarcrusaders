
var uuid = require('uuid'),
    async = require('async'),
    Utils = require('../../utils');

module.exports = function(Ship) {
  Ship.DefaultData = {
    //.. not read
  }; 

  Ship.createDefaultData = function() {
    var shipData = Utils.extend({}, Ship.DefaultData);
        shipData.uuid = uuid.v4();
    return shipData;
  };

  Ship.create = function(data, callback) {
    var shipData = Ship.createDefaultData();

  };

  Ship.persist = function(shipData) {
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
