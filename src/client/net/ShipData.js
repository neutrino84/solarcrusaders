
var engine = require('engine');

function ShipData(data) {
  engine.Class.mixin(data, this);
};

ShipData.prototype.constructor = ShipData;

ShipData.prototype.update = function(data) {
  engine.Class.mixin(data, this);
};

module.exports = ShipData;
