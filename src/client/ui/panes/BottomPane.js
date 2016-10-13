
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    FlowLayout = require('../layouts/FlowLayout'),
    EnhancementPane = require('./EnhancementPane'),
    VitalsPane = require('./VitalsPane'),
    Label = require('../components/Label'),
    InventoryPane = require('./InventoryPane');

function BottomPane(game) {
  Pane.call(this, game, {
    padding: [0, 0, 5, 0],
    border: [0],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL,
      gap: 3,
      stretch: true
    },
    bg: false,
    pane: {
      bg: false
    },
    hotKey: {
      bg: false,
      text: { fontName: 'full' },
      padding: [12, 24]
    }
  });

  this.leftPane = new Pane(game, this.settings.pane);
   this.centerPane = new Pane(game, this.settings.pane);
  // this.rightPane = new Pane(game, this.settings.pane);
  var hotKeysLabel = new Label(game, "up(W), down(S), left(A), right(D)", this.settings.hotKey);

  this.enhancementPane = new EnhancementPane(game);
  this.vitalsPane = new VitalsPane(game);
   //this.inventoryPane = new InventoryPane(game);

  this.leftPane.addPanel(Layout.STRETCH, this.enhancementPane);
  this.leftPane.addPanel(Layout.NONE, this.vitalsPane);
  this.leftPane.addPanel(Layout.NONE, hotKeysLabel);
   //this.centerPane.addPanel(Layout.NONE, this.inventoryPane);

  this.addPanel(Layout.NONE, this.leftPane);
   //this.addPanel(Layout.NONE, this.centerPane);
  // this.addPanel(Layout.NONE, this.rightPane);
};

BottomPane.prototype = Object.create(Pane.prototype);
BottomPane.prototype.constructor = BottomPane;

module.exports = BottomPane;
