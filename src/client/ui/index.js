
var Panel = require('../ui/Panel'),
    Pane = require('../ui/components/Pane'),
    Layout = require('../ui/Layout'),
    
    BottomPane = require('../ui/panes/BottomPane');

    // LeaderBoardPane = require('../ui/panes/LeaderBoardPane');

function UI(game) {
  this.game = game;
};

UI.DISCONNECT_MESSAGE = 'connection to the server has been lost\nattempting to reconnect';

UI.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');
};

UI.prototype.create = function() {
  // // added leaderBoard pane
  // this.leaderBoardPane = new LeaderBoardPane(game);

  this.bottom = new BottomPane(this.game);
  // this.top.addPanel(this.top);

  this.root = new Pane(this.game, {
    width: this.game.width,
    height: this.game.height,
    layout: {
      type: 'border',
      gap: [0, 0]
    },
    bg: false
  });
  
  this.root.addPanel(this.bottom);

  // invalidate
  this.root.invalidate();

  // add root to stage
  this.game.stage.addChild(this.root);

  // this.auth.on('sync', this.login, this);
  // this.auth.on('data', this.data, this);
  // this.auth.on('disconnected', this._disconnected, this);

  // this.game.on('gui/modal', this.modal, this);
};

UI.prototype.login = function(user) {
  return;


  this.toggle(true);
  this.loading();
};

UI.prototype.data = function(user) {
  if(this.auth.isUser()) {
    this.headerPane.login(user);
    this.headerPane.invalidate(true);
  }
};

UI.prototype.refresh = function() {
  this.root.invalidate(true);
};

UI.prototype.toggle = function(force) {
  this.root.visible =
    force !== undefined ? force : !this.root.visible;
  
  // repaint gui
  if(this.root.visible) {
    this.root.invalidate();
  }
};

UI.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

// UI.prototype._disconnected = function() {
//   this.game.emit('gui/alert', UI.DISCONNECT_MESSAGE, false, 'connection lost');
// };

module.exports = UI;
