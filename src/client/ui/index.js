
var Panel = require('../ui/Panel'),
    Pane = require('../ui/components/Pane'),
    Layout = require('../ui/Layout'),
    
    Shipyard = require('../ui/panes/Shipyard'),
    BottomPane = require('../ui/panes/BottomPane'),

    LeaderBoardPane = require('../ui/panes/LeaderBoardPane');

function UI(game) {
  this.game = game;
  this.auth = game.auth;
  this.modaled = null;
  this.settings = {
    content: {
      layout: {
        type: 'border',
        gap: [0, 0]
      }
    },
    root: {
      width: this.game.width,
      height: this.game.height,
      bg: {
        color: 0x000000,
        fillAlpha: 0.8
      }
    }
  };

  // subscribe to messaging
  this.game.on('ui/modal', this.modal, this);
  this.game.on('auth/sync', this.syncronize, this);
};

UI.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');
};

UI.prototype.create = function() {
  // create bottom enhancements
  this.bottom = new BottomPane(this.game);

  // create leaderboard
  this.leaderboard = new LeaderBoardPane(this.game);
  this.leaderboard.create();

  // create shipyard
  this.shipyard = new Shipyard(this.game);
  this.shipyard.create();

  // create content area
  this.content = new Pane(this.game, this.settings.content);

  // create root pane
  this.root = new Pane(this.game, this.settings.root);
  this.root.bg.visible = false;

  // add elements
  this.content.addPanel(this.bottom);
  this.content.addPanel(this.leaderboard);
  this.root.addPanel(this.content);

  // syncronize
  this.syncronize();

  // invalidate
  this.root.invalidate();

  // add root to stage
  this.game.stage.addChild(this.root);
};

UI.prototype.modal = function(pane) {
  if(pane) {
    this.modaled = pane;
    this.content.visible = false;
    this.root.bg.visible = true;
    this.root.addPanel(this.modaled);
    this.root.invalidate();
  } else {
    this.content.visible = true;
    this.root.bg.visible = false;
    this.root.removePanel(this.modaled);
    this.root.invalidate();
  }
};

UI.prototype.syncronize = function() {
  var game = this.game,
      auth = this.auth;
  if(auth.user) {
    if(!auth.user.ship) {
      game.emit('ui/shipyard/show');
    }
  }
};

UI.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

module.exports = UI;
