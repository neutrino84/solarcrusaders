
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Button = require('../components/Button'),
    Class = engine.Class;

function InventoryPane(game, settings) {
  Pane.call(this, game,
    Class.mixin(settings, {
      padding: [1],
      border: [0],
      bg: {
        fillAlpha: 1.0,
        color: 0x3868b8,
        borderSize: 0.0,
        blendMode: engine.BlendMode.ADD,
        radius: 0.0
      },
      content: {
        padding: [1],
        bg: {
          fillAlpha: 0.8,
          color: 0x000000,
          radius: 0.0,
          borderSize: 0.0,
          blendMode: engine.BlendMode.MULTIPLY
        },
        layout: {
          // direction: Layout.HORIZONTAL,
          gap: 2
        }
      },
      inventory: {
        padding: [0],
        layout: {
          type: 'list',
          gap: [1, 1],
          columns: 4
        },
        bg: {
          fillAlpha: 0.0
        }
      },
      inventoryButton: {
        padding: [1],
        label: {
          padding: [4, 10],
          text: {
            fontName: 'small'
          },
          align: 'center',
          bg: {
            highlight: false,
            borderSize: 0.0,
            radius: 0.0,
            blendMode: engine.BlendMode.MULTIPLY,
          }
        },
        bg: {
          radius: 0.0,
          alertColor: 0x000000
        }
      }
    })
  );

  this.content = new Pane(game, this.settings.content);
  this.itemPane = new Pane(game, this.settings.inventory);

  this.inventoryButton = new Button(game, 'inventory', this.settings.inventoryButton);
  this.inventoryButton.on('inputUp', this._fitting, this);

  this.addPanel(Layout.NONE, this.content);
  this.content.addPanel(Layout.NONE, this.itemPane);
  this.content.addPanel(Layout.STRETCH, this.inventoryButton);

  // create
  this.create();
};

InventoryPane.prototype = Object.create(Pane.prototype);
InventoryPane.prototype.constructor = InventoryPane;

InventoryPane.prototype.create = function() {
  var len = 8;
  for(var i=0; i<len; i++) {
    this.itemPane.addPanel(Layout.NONE, this.createEmptyPane());
  }
};

InventoryPane.prototype.createEmptyPane = function() {
  return new Pane(this.game, {
    width: 24,
    height: 24,
    bg: {
      fillAlpha: 0.75,
      color: 0x000000,
      borderSize: 0.0
    }
  });
};

InventoryPane.prototype._fitting = function() {
  this.game.emit('ship/fitting');
};

module.exports = InventoryPane;
