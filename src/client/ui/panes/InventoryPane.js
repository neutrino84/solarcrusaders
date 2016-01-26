
var engine = require('engine'),
    Layout = require('../Layout'),
    ContentPane = require('./ContentPane'),
    Class = engine.Class;

function InventoryPane(game, settings) {
  ContentPane.call(this, game, 'items',
    Class.mixin(settings, {
      padding: [1],
      width: 128,
      height: 72,
      button: {
        label: {
          padding: [2]
        }
      }
    })
  );
};

InventoryPane.prototype = Object.create(ContentPane.prototype);
InventoryPane.prototype.constructor = InventoryPane;

module.exports = InventoryPane;
