
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    FlowLayout = require('../layouts/FlowLayout'),
    EnhancementPane = require('./EnhancementPane'),
    VitalsPane = require('./VitalsPane');

function BottomPane(game) {
  Pane.call(this, game, {
    padding: [0],
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
      padding: [5],
      bg: false
    }
  });

  this.leftPane = new Pane(game, this.settings.pane);
  this.centerPane = new Pane(game, this.settings.pane);
  this.rightPane = new Pane(game, this.settings.pane);

  this.enhancementPane = new EnhancementPane(game);
  this.vitalsPane = new VitalsPane(game);

  this.centerPane.addPanel(Layout.NONE, this.enhancementPane);
  this.centerPane.addPanel(Layout.NONE, this.vitalsPane);

  this.addPanel(Layout.BOTTOM, this.leftPane);
  this.addPanel(Layout.BOTTOM, this.centerPane);
  this.addPanel(Layout.BOTTOM, this.rightPane);
};

BottomPane.prototype = Object.create(Pane.prototype);
BottomPane.prototype.constructor = BottomPane;

module.exports = BottomPane;
