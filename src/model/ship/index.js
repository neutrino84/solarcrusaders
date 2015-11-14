
var async = require('async');

function Ship(model) {
  this.model = model;
  this.database = model.database;
};

Ship.prototype.getShipsByUid = function(uid, callback) {
  var self = this,
      key = 'uid:' + uid + ':ships';
  async.waterfall([
    function(next) {
      self.database.getSortedSetRange(key, 0, -1, next);
    },
    function(uids, next) {
      self.getShipsData(uids, next);
    }
  ], callback);
};

require('./data')(Ship);
require('./create')(Ship);

module.exports = Ship;
