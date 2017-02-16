
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    EnhancementPane = require('./EnhancementPane'),
    ProgressBar = require('../components/ProgressBar');

function BottomPane(game) {
  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    padding: [4],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.VERTICAL, 
      gap: 4
    }
  });

  this.enhancementPane = new EnhancementPane(game);
  
  this.addPanel(this.enhancementPane);
};

BottomPane.prototype = Object.create(Pane.prototype);
BottomPane.prototype.constructor = BottomPane;

module.exports = BottomPane;
