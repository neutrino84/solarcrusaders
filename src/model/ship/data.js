
module.exports = function(Ship) {

  Ship.prototype.getShipData = function(shipID, callback) {
    this.getShipsData([shipID], function(err, ships) {
      callback(err, ships ? ships[0] : null);
    });
  };

  Ship.prototype.getShipsData = function(shipIDs, callback) {
    if(!Array.isArray(shipIDs) || !shipIDs.length) {
      return callback(null, []);
    }

    var keys = shipIDs.map(function(shipID) {
      return 'ship:' + shipID;
    });

    this.database.getObjects(keys, function(err, ships) {
      if(err) { return callback(err); }
      callback(null, ships);
    });
  };

};