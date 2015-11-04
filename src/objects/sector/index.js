
function Sector(model) {
  this.model = model;
  this.database = model.database;
};

Sector.prototype.constructor = Sector;

module.exports = Sector;
