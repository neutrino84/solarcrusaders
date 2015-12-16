
var async = require('async');

function System(model) {
  this.model = model;
  this.database = model.database;
};

System.prototype.getSystemsByShpid = function(shpid, callback) {
  var self = this,
      key = 'shpid:' + shpid + ':systems';
  async.waterfall([
    function(next) {
      self.database.getSortedSetRange(key, 0, -1, next);
    },
    function(ids, next) {
      self.getSystemsData(ids, next);
    }
  ], callback);
};

require('./data')(System);
require('./create')(System);

module.exports = System;
