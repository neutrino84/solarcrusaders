
var Sector = require('./Sector'),
    User = require('./User'),
    Ship = require('./Ship'),
    System = require('./System'),
    Hardpoint = require('./Hardpoint');

function Model(app) {
  this.database = app.database;

  this.User = User;
  this.Ship = Ship;
  this.Sector = Sector;
  this.System = System;
  this.Hardpoint = Hardpoint;
};

Model.prototype.init = function(next) {
  next();
};

// relationships
Sector.hasMany(Ship, { as: 'ships', foreignKey: 'fk_sector_ship' });
Sector.hasMany(User, { as: 'users', foreignKey: 'fk_sector_user' });

User.belongsTo(Sector, { as: 'sector', foreignKey: 'fk_sector_user'});
User.hasMany(Ship, { as: 'ships', foreignKey: 'fk_user_ship' })

Ship.hasMany(System, { as: 'systems', foreignKey: 'fk_ship_system' });
Ship.hasMany(Hardpoint, { as: 'hardpoints', foreignKey: 'fk_ship_hardpoint' });
Ship.belongsTo(Sector, { as: 'sector', foreignKey: 'fk_sector_ship' });
Ship.belongsTo(User, { as: 'user', foreignKey: 'fk_user_ship' });

System.belongsTo(Ship, { as: 'ship', foreignKey: 'fk_system_ship' });

Hardpoint.belongsTo(Ship, { as: 'ship', foreignKey: 'fk_ship_hardpoint' });

module.exports = Model;
