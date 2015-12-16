
module.exports = function(System) {

  System.prototype.getSystemData = function(systemID, callback) {
    this.getSystemsData([systemID], function(err, systems) {
      callback(err, systems ? systems[0] : null);
    });
  };

  System.prototype.getSystemsData = function(systemIDs, callback) {
    if(!Array.isArray(systemIDs) || !systemIDs.length) {
      return callback(null, []);
    }

    var keys = systemIDs.map(function(systemID) {
      return 'system:' + systemID;
    });

    this.database.getObjects(keys, function(err, systems) {
      if(err) { return callback(err); }
      callback(null, systems);
    });
  };

};