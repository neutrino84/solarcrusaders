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
  this.game = game;
  this.socket = game.net.socket;
  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    padding: [0, 0, 0, 0 ],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: {
      color: 0xccffaa,
      fillAlpha: 0.03,
      borderSize: 0.1,
      borderColor: 0xcccccc,
      borderAlpha: 0.5
    }, 
    height: 80,
  });

  this.titleContainer = new Pane(this.game, {
    width: 150,
    height: 10,
    constraint: Layout.TOP,
    padding: [0, 0, 5, 0],
    layout: {
      type: 'flow',
      direction: Layout.VERTICAL,
    },
    bg: {
      color: 0xff0000,
      fillAlpha: 0,
      borderSize: 1.0,
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
  this.addPanel(this.titleContainer);
  this.addPanel(this.squadUpgradePane);
  this.alpha = 0;
  this.game.on('ship/player/upgrade', this._show, this);
  this.game.on('hide/upgrade_pane', this._hide, this);
};
UpgradePane.prototype = Object.create(Pane.prototype);
UpgradePane.prototype.constructor = UpgradePane;

UpgradePane.prototype._show = function(){
  this.alpha = 1;
};

UpgradePane.prototype._hide = function () {
  this.alpha = 0;
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

module.exports = UpgradePane;
