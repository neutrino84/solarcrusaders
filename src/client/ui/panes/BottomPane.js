
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    FlowLayout = require('../layouts/FlowLayout'),
    EnhancementPane = require('./EnhancementPane'),
    VitalsPane = require('./VitalsPane'),
    SubsystemPane = require('./SubsystemPane'),
    InventoryPane = require('./InventoryPane');

function BottomPane(game) {
  Pane.call(this, game, {
    padding: [0, 0, 5, 0],
    border: [0],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL,
      gap: 0,
      stretch: true
    },
    bg: false,
    pane: {
      bg: false
    },
  });

  this.leftPane = new Pane(game, this.settings.pane);
  this.centerPane = new Pane(game, this.settings.pane);
  this.rightPane = new Pane(game, this.settings.pane);

  this.enhancementPane = new EnhancementPane(game);
  this.vitalsPane = new VitalsPane(game);
  this.subsystemPane = new SubsystemPane(game);
  this.inventoryPane = new InventoryPane(game);

  this.centerPane.addPanel(Layout.NONE, this.enhancementPane);
  this.centerPane.addPanel(Layout.NONE, this.vitalsPane);
  this.rightPane.addPanel(Layout.NONE, this.inventoryPane);
  this.leftPane.addPanel(Layout.NONE, this.subsystemPane);

  this.addPanel(Layout.TOP, this.leftPane);
  this.addPanel(Layout.BOTTOM, this.centerPane);
  this.addPanel(Layout.BOTTOM, this.rightPane);
};

BottomPane.prototype = Object.create(Pane.prototype);
BottomPane.prototype.constructor = BottomPane;

module.exports = BottomPane;
