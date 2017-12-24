
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    CreditsPane = require('./CreditsPane'),
    EnhancementPane = require('./EnhancementPane'),
    SquadIndicatorPane = require('./SquadPane/SquadIndicatorPane'),
    SquadHotkeyPane = require('./SquadPane/SquadHotkeyPane'),
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

  this.creditsPane = new CreditsPane(game);
  this.squadIndicatorPane = new SquadIndicatorPane(game);
  this.enhancementPane = new EnhancementPane(game);
  this.squadHotkeyPane = new SquadHotkeyPane(game);
  
  // this.addPanel(this.squadIcons);
  // this.socket.on('player/hasSquadron', this._squadPane, this)
  // this._squadPane();
  this.addPanel(this.creditsPane)
  this.addPanel(this.squadIndicatorPane)
  this.addPanel(this.enhancementPane);
  this.addPanel(this.squadHotkeyPane);
};

BottomPane.prototype._squadPane = function(){
  // this.squadPane = new SquadPane(game);
  // this.addPanel(this.squadPane);
};

BottomPane.prototype.destroy = function(){
  this.squadIndicatorPane.destroy();
  this.enhancementPane.destroy();
  this.squadHotkeyPane.destroy();
  this.removeAll();
  this.squadIndicatorPane = this.squadHotkeyPane = this.enhancementPane = undefined;
  // this.squadPane = new SquadPane(game);
  // this.addPanel(this.squadPane);
};

BottomPane.prototype.stopProcesses = function(){
  this.removePanel(this.creditsPane);
  this.removePanel(this.enhancementPane);
};

BottomPane.prototype = Object.create(Pane.prototype);
BottomPane.prototype.constructor = BottomPane;

module.exports = BottomPane;
