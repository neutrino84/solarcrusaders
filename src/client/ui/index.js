
var Focus = require('./Focus'),
    Panel = require('./Panel'),
    Layout = require('./Layout'),
    Pane = require('./components/Pane'),
    Shipyard = require('./panes/Shipyard'),
    TopPane = require('./panes/TopPane'),
    BottomPane = require('./panes/BottomPane');

function UI(game) {
  this.game = game;
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

  // focus manager
  this.focus = new Focus(game);

  // subscribe to messaging
  this.game.on('ui/modal', this.modal, this);
  this.game.on('auth/sync', this.auth, this);
};

UI.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');
};

UI.prototype.create = function() {
  // create bottom enhancements
  this.top = new TopPane(this.game);
  this.bottom = new BottomPane(this.game);

  // create shipyard
  this.shipyard = new Shipyard(this.game);
  this.shipyard.create();

  // create content area
  this.content = new Pane(this.game, this.settings.content);

  // create root pane
  this.root = new Pane(this.game, this.settings.root);
  this.root.bg.visible = false;

  // add elements
  this.content.addPanel(this.top);
  this.content.addPanel(this.bottom);
  this.root.addPanel(this.content);

  // invalidate
  this.root.invalidate();

  // add root to stage
  this.game.world.ui.addChild(this.root);

  // authenticate user
  this.auth(this.game.auth.user);
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

UI.prototype.auth = function(user) {
  if(user && !user.ship) {
    this.game.emit('ui/shipyard/show');
  }
};

UI.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

module.exports = UI;
