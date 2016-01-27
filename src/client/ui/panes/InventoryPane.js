
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    ContentPane = require('./ContentPane'),
    Class = engine.Class;

function InventoryPane(game, settings) {
  ContentPane.call(this, game, 'items',
    Class.mixin(settings, {
      padding: [1],
      content: {
        padding: [2],
        layout: {
          type: 'list',
          gap: [2, 2],
          columns: 4
        }
      },
      button: {
        label: {
          padding: [2]
        }
      }
    })
  );

  // create
  this.create();
};

InventoryPane.prototype = Object.create(ContentPane.prototype);
InventoryPane.prototype.constructor = InventoryPane;

InventoryPane.prototype.create = function() {
  var len = 8;
  for(var i=0; i<len; i++) {
    this.addContent(Layout.NONE, this.createEmptyPane());
  }
};

InventoryPane.prototype.createEmptyPane = function() {
  return new Pane(this.game, {
    width: 27,
    height: 27,
    bg: {
      fillAlpha: 0.75,
      color: 0x000000,
      borderSize: 0.0
    }
  });
};

module.exports = InventoryPane;
