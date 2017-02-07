
var Panel = require('../ui/Panel'),
    Layout = require('../ui/Layout'),
    // Focus = require('../ui/Focus'),

    BorderLayout = require('../ui/layouts/BorderLayout'),
    // FlowLayout = require('../ui/layouts/FlowLayout'),
    StackLayout = require('../ui/layouts/StackLayout'),
    
    // HeaderPane = require('../ui/panes/HeaderPane'),
    BottomPane = require('../ui/panes/BottomPane');

    // LeaderBoardPane = require('../ui/panes/LeaderBoardPane'),

    // Alert = require('../ui/components/Alert'),
    // FlashMessage = require('../ui/components/FlashMessage'),
    // Modal = require('../ui/components/Modal'),

    // RegistrationForm = require('../ui/html/RegistrationForm');

function UI(game) {
  this.game = game;
};

// UI.DISCONNECT_MESSAGE = 'connection to the server has been lost\nattempting to reconnect';
// UI.FPSPROBLEM_MESSAGE = 'the game will automatically adjust\nyour graphics settings';

UI.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');
};

UI.prototype.create = function() {
  // var game = this.game;

  // this.focus = new Focus(game);

  // this.modalComponent = new Modal(game);
  // this.modalComponent.visible = false;

  // this.alertComponent = new Alert(game);
  // this.flashMessageComponent = new FlashMessage(game);

  // this.basePanel = new Panel(game, new BorderLayout(0, 0));
  // this.basePanel.setPadding(6, 0, 0, 0);

  // // added leaderBoard pane
  // this.leaderBoardPane = new LeaderBoardPane(game);

  // this.headerPane = new HeaderPane(game);

  // this.topPanel = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.HORIZONTAL, 6), Layout.TOP, );
  // this.topPanel.addPanel(Layout.NONE, this.headerPane);

  this.bottom = new BottomPane(this.game);
  // this.top.addPanel(this.top);
  

  // // leaderBoard pane added to canvas
  // this.leaderBoardPanel = new Panel(game, new FlowLayout(Layout.RIGHT, Layout.TOP, Layout.HORIZONTAL, 6));
  // this.leaderBoardPanel.addPanel(Layout.NONE, this.leaderBoardPane);

  this.root = new Panel(this.game, new BorderLayout(0, 0));
  this.root.setSize(this.game.width, this.game.height);
  
  this.root.addPanel(this.bottom);
  

  // this.root.addPanel(Layout.STRETCH, this.centerPanel);
  // this.root.addPanel(Layout.STRETCH, this.leaderBoardPanel);
  // this.root.addPanel(Layout.STRETCH, this.modalComponent);

  // add root to stage
  this.game.stage.addChild(this.root);

  this.root.invalidate();

  // this.auth.on('sync', this.login, this);
  // this.auth.on('data', this.data, this);
  // this.auth.on('disconnected', this._disconnected, this);

  // this.game.on('gui/modal', this.modal, this);
  // this.game.on('game/pause', this._pause, this);

};

UI.prototype.login = function(user) {
  return;
  
  if(this.auth.isUser()) {
    this.headerPane.login(user);
    this.headerPane.invalidate(true);
    this.registrationForm && (this.registrationForm = this.registrationForm.destroy());
  } else {
    this.headerPane.logout()
    this.registrationForm = new RegistrationForm(game);
  }
  if(this.modalComponent.visible) {
    this.modal(false);
  }
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

// UI.prototype.loading = function() {
//   this.game.emit('gui/message', 'loading', 500);
// };

// UI.prototype.modal = function(show, content, lock, visible) {
//   if(typeof show !== 'boolean') { show = true; };
//   if(content === undefined) { content = new Panel(game, new StackLayout()); }
//   if(lock === undefined) { lock = true; }
//   if(visible === undefined) { visible = true; }

//   if(lock && show) {
//     this.game.input.keyboard.stop();
//   } else {
//     this.game.input.keyboard.start();
//   }

//   this.modalComponent.empty();
//   this.modalComponent.addPanel(Layout.USE_PS_SIZE, content);
//   this.modalComponent.visible = show;
//   this.modalComponent.bg.settings.fillAlpha = visible ? 0.8 : 0.0;
//   this.modalComponent.invalidate(true);

//   this.refresh();
// };

UI.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    // this.root.resize(width, height);
    this.root.setSize(width, height);
    this.root.invalidate();
  }
};

// UI.prototype._pause = function() {
//   this.game.emit('gui/message', 'paused', 1000, 500);
// };

// UI.prototype._disconnected = function() {
//   this.game.emit('gui/alert', UI.DISCONNECT_MESSAGE, false, 'connection lost');
// };

module.exports = UI;
