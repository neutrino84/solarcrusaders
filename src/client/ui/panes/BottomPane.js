
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    // FlowLayout = require('../layouts/FlowLayout'),
    EnhancementPane = require('./EnhancementPane');
    // VitalsPane = require('./VitalsPane'),
    // InventoryPane = require('./InventoryPane');

function BottomPane(game) {
  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    padding: [3],
    layout: {
      type: 'border',
      gap: [0, 0]
    },
    bg: false
  });

  this.leftPanel = new Pane(game, {
    constraint: Layout.LEFT,
    bg: false
  });

  this.centerPanel = new Pane(game, {
    constraint: Layout.CENTER,
    layout: {
      type: 'border',
      gap: [0, 0]
    },
    bg: false
  });

  this.rightPanel = new Pane(game, {
    constraint: Layout.RIGHT,
    bg: false
  });

  this.enhancementPane = new EnhancementPane(game);
  // this.vitalsPane = new VitalsPane(game);
  // this.inventoryPane = new InventoryPane(game);

  this.centerPanel.addPanel(this.enhancementPane);
  // this.leftPane.addPanel(Layout.NONE, this.vitalsPane);
  // this.centerPane.addPanel(Layout.NONE, this.inventoryPane);

  // this.addPanel(this.leftPanel);
  this.addPanel(this.centerPanel);
  // this.addPanel(this.rightPanel);
};

BottomPane.prototype = Object.create(Pane.prototype);
BottomPane.prototype.constructor = BottomPane;

module.exports = BottomPane;
