
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    EnhancementPane = require('./EnhancementPane'),
    SquadronPane = require('./SquadronPane'),
    ProgressBar = require('../components/ProgressBar');

function BottomPane(game) {
  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    padding: [4],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL,
      gap: 4
    }
  });

  this.divider = {
    constraint: Layout.STRETCH,
    width: 3,
    height: 36,
    padding: [0],
    layout: {
      type: 'stack'
    },
    bg: {
      fillAlpha: 0.1,
      color: 0xFFFFFF
    }
  };

  this.divider1 = new Pane(game, this.divider);
  this.divider2 = new Pane(game, this.divider);
  this.divider3 = new Pane(game, this.divider);

  this.enhancementPane = new EnhancementPane(game);
  this.enhancementPane.create();

  this.squadronPane = new SquadronPane(game);
  this.squadronPane.create();
  
  this.addPanel(this.divider1);
  this.addPanel(this.enhancementPane);
  this.addPanel(this.divider2);
  this.addPanel(this.squadronPane);
  this.addPanel(this.divider3);
};

BottomPane.prototype = Object.create(Pane.prototype);
BottomPane.prototype.constructor = BottomPane;

module.exports = BottomPane;
