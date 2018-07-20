var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    WaveDisplayPane = require('../panes/WaveDisplayPane'),
    CreditsPane = require('./CreditsPane'),
    EnhancementPane = require('./EnhancementPane'),
    SquadUpgradePane = require('./SquadPane/SquadUpgradePane'),
    SquadHotkeyPane = require('./SquadPane/SquadHotkeyPane'),
    Label = require('../components/Label'),
    ProgressBar = require('../components/ProgressBar');

function UpgradePane(game) {
  this.socket = game.net.socket;
  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    padding: [0, 10, 0, 0 ],
    layout: {
      type: 'flow',
      ax: Layout.LEFT, 
      ay: Layout.BOTTOM,
      direction: Layout.VERTICAL
    },
    bg: {
      color: 0xccffaa,
      fillAlpha: 0.0,
      borderSize: 0.1,
      borderColor: 0xcccccc,
      borderAlpha: 0.5
    }, 
    height: 70,
  });

  this.titleContainer = new Pane(this.game, {
    width: 250,
    height: 10,
    constraint: Layout.LEFT,
    padding: [0, 0, 0, 0],
    layout: {
      type: 'flow',
      direction: Layout.VERTICAL,
    },
    bg: {
      color: 0xff0000,
      fillAlpha: 0,
      borderSize: 0.0,
      borderColor: 0xffff00,
      borderAlpha: 0.0
    }
  });

  this.title = new Label(this.game);
  this.title.text = 'CHOOSE A SQUAD SHIP'
  this.titleContainer.addPanel(this.title)
  // this.botLeftContainer = new Pane(this.game, {
  //   width: 250,
  //   height: 15,
  //   layout: {
  //     type: 'flow',
  //     ax: Layout.CENTER, 
  //     ay: Layout.BOTTOM,
  //     direction: Layout.HORIZONTAL,
  //   },
  //   bg: {
  //     color: 0xccff66,
  //     fillAlpha: 0.5,
  //   }
  // });
  this.squadUpgradePane = new SquadUpgradePane(game);
  // this.enhancementPane = new EnhancementPane(game);
  // this.squadHotkeyPane = new SquadHotkeyPane(game);
  
  // this.addPanel(this.squadIcons);
  // this.socket.on('player/hasSquadron', this._squadPane, this)
  // this._squadPane();

  // this.bottomLeftUpper.addPanel(this.creditsPane)
  // this.bottomLeftUpper.addPanel(this.squadIndicatorPane)

  // this.bottomLeftLower.addPanel(this.waveDisplayPane)

  // this.bottomLeftContainer.addPanel(this.bottomLeftUpper)
  // this.bottomLeftContainer.addPanel(this.bottomLeftLower)

  // this.bottomLeftRightContainer.addPanel(this.squadUpgradePane);


  // this.bottomLeftContainer.addPanel(this.squadIndicatorPane)

  // this.bottomLeftContainer.addPanel(this.bottomLeftLower)
  // this.bottomLeftContainer.addPanel(this.bottomLeftUpper)

  // this.addPanel(this.creditsPane)
  // this.addPanel(this.squadIndicatorPane)
  this.addPanel(this.titleContainer);
  // this.addPanel(this.botLeftContainer);
  // this.addPanel(this.botRightContainer);
  this.addPanel(this.squadUpgradePane);
  // this.addPanel(this.enhancementPane);
  // this.addPanel(this.squadHotkeyPane);
};

UpgradePane.prototype._squadPane = function(){
  // this.squadPane = new SquadPane(game);
  // this.addPanel(this.squadPane);
};

UpgradePane.prototype.destroy = function(){
  this.squadIndicatorPane.destroy();
  this.enhancementPane.destroy();
  this.squadHotkeyPane.destroy();
  this.creditsPane.destroy();
  this.removeAll();
  this.squadIndicatorPane = this.squadHotkeyPane = this.enhancementPane = undefined;
};

UpgradePane.prototype.stopProcesses = function(){
  this.removePanel(this.creditsPane);
  this.removePanel(this.enhancementPane);
};

UpgradePane.prototype = Object.create(Pane.prototype);
UpgradePane.prototype.constructor = UpgradePane;

module.exports = UpgradePane;
