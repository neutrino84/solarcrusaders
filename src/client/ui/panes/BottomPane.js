
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    WaveDisplayPane = require('../panes/WaveDisplayPane'),
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
      gap: 25
    }
  });

  this.bottomLeftContainer = new Pane(this.game, {
    width: 250,
    height: 30,
    // margin: [10, 0, 0, 0],
    layout: {
      type: 'flow',
      direction: Layout.VERTICAL,
    },
    bg: false
  });

  this.bottomLeftRightContainer = new Pane(this.game, {
    width: 150,
    height: 30,
    // margin: [10, 0, 0, 0],
    layout: {
      type: 'flow',
      direction: Layout.VERTICAL,
    },
    bg: false
  });

  this.bottomLeftUpper = new Pane(this.game, {
    width: 250,
    height: 15,
    margin: [0, 0, 0, 0],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL
    },
    bg: {
      color: 0xccfe66,
      fillAlpha: 0.0,
    }
  });

  this.bottomLeftLower = new Pane(this.game, {
    width: 250,
    height: 15,
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL,
    },
    bg: {
      color: 0x66ff66,
      fillAlpha: 0.0,
    }
  });
  this.creditsPane = new CreditsPane(game);
  this.waveDisplayPane = new WaveDisplayPane(game);
  this.squadIndicatorPane = new SquadIndicatorPane(game);
  this.enhancementPane = new EnhancementPane(game);
  this.squadHotkeyPane = new SquadHotkeyPane(game);
  
  // this.addPanel(this.squadIcons);
  // this.socket.on('player/hasSquadron', this._squadPane, this)
  // this._squadPane();

  this.bottomLeftUpper.addPanel(this.creditsPane)
  // this.bottomLeftUpper.addPanel(this.squadIndicatorPane)

  this.bottomLeftLower.addPanel(this.waveDisplayPane)

  this.bottomLeftContainer.addPanel(this.bottomLeftUpper)
  this.bottomLeftContainer.addPanel(this.bottomLeftLower)

  this.bottomLeftRightContainer.addPanel(this.squadIndicatorPane);
  // this.bottomLeftContainer.addPanel(this.squadIndicatorPane)

  // this.bottomLeftContainer.addPanel(this.bottomLeftLower)
  // this.bottomLeftContainer.addPanel(this.bottomLeftUpper)

  // this.addPanel(this.creditsPane)
  // this.addPanel(this.squadIndicatorPane)
  this.addPanel(this.bottomLeftContainer);
  this.addPanel(this.bottomLeftRightContainer);
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
