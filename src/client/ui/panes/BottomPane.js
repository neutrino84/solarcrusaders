
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    EnhancementPane = require('./EnhancementPane'),
    SquadPane = require('./SquadPane'),
    ProgressBar = require('../components/ProgressBar');

function BottomPane(game) {
  this.socket = game.net.socket;

  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    padding: [4],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL, 
      gap: 75
    }
  });

  this.enhancementPane = new EnhancementPane(game);
  
  this.addPanel(this.enhancementPane);
  // this.addPanel(this.squadIcons);
  // this.socket.on('player/hasSquadron', this._squadPane, this)
  // this._squadPane();
  this.squadPane = new SquadPane(game);
  this.addPanel(this.squadPane);
};

BottomPane.prototype._squadPane = function(){
  // this.squadPane = new SquadPane(game);
  // this.addPanel(this.squadPane);
};

BottomPane.prototype = Object.create(Pane.prototype);
BottomPane.prototype.constructor = BottomPane;

module.exports = BottomPane;
