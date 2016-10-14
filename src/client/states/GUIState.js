
var engine = require('engine'),
    
    Panel = require('../ui/Panel'),
    Layout = require('../ui/Layout'),
    Focus = require('../ui/Focus'),

    BorderLayout = require('../ui/layouts/BorderLayout'),
    FlowLayout = require('../ui/layouts/FlowLayout'),
    StackLayout = require('../ui/layouts/StackLayout'),
    
    HeaderPane = require('../ui/panes/HeaderPane'),
    BottomPane = require('../ui/panes/BottomPane'),

    LeaderboardPane = require('../ui/panes/LeaderboardPane'),

    Alert = require('../ui/components/Alert'),
    FlashMessage = require('../ui/components/FlashMessage'),
    Modal = require('../ui/components/Modal'),

    RegistrationForm = require('../ui/html/RegistrationForm');

function GUIState() {};

GUIState.DISCONNECT_MESSAGE = 'connection to the server has been lost\nattempting to reconnect';
GUIState.FPSPROBLEM_MESSAGE = 'the game will automatically adjust\nyour graphics settings';

GUIState.prototype = Object.create(engine.State.prototype);
GUIState.prototype.constructor = engine.State;

GUIState.prototype.init = function() {
  this.game.gui = this;
  this.auth = this.game.auth;
};

GUIState.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');

  // load tilesets
  // this.game.load.image('deck', 'imgs/game/tilesets/deck-mini.png');
  // this.game.load.image('wall', 'imgs/game/tilesets/wall-mini.png');
  // this.game.load.image('grid', 'imgs/game/tilesets/grid-mini.png');
    
  // load ship tilemap
  this.game.load.tilemap('ship-tilemap', 'data/ship-mini.json');

  // load ship configuration
  this.game.load.json('ship-configuration', 'data/ship-configuration.json');
  this.game.load.json('item-configuration', 'data/item-configuration.json');

  // load texture atlas
  this.game.load.atlasJSONHash('texture-atlas', 'imgs/game/texture-atlas.png', 'data/texture-atlas.json');

  // spritesheet
  // this.game.load.spritesheet('crew', 'imgs/game/spritesheets/crew-mini.png', 16, 16);
  // this.game.load.spritesheet('door', 'imgs/game/spritesheets/door-mini.png', 16, 16);
};

GUIState.prototype.create = function() {
  var game = this.game;

  this.focus = new Focus(game);

  this.modalComponent = new Modal(game);
  this.modalComponent.visible = false;

  this.alertComponent = new Alert(game);
  this.flashMessageComponent = new FlashMessage(game);

  this.centerPanel = new Panel(game, new BorderLayout(0, 0));
  this.basePanel = new Panel(game, new BorderLayout(0, 0));
  this.basePanel.setPadding(6, 0, 0, 0);

  //added leaderBoard pane
  this.leaderBoard = new LeaderboardPane(game);

  this.headerPane = new HeaderPane(game);

  this.topPanel = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.HORIZONTAL, 6));
  this.topPanel.addPanel(Layout.NONE, this.headerPane);

  this.bottomPane = new BottomPane(game);

  this.basePanel.addPanel(Layout.TOP, this.topPanel);
  this.basePanel.addPanel(Layout.BOTTOM, this.bottomPane);


  // leaderBoard pane added to canvas
  this.leaderBoardPanel = new Panel(game, new FlowLayout(Layout.RIGHT, Layout.TOP, Layout.HORIZONTAL, 6));
  this.leaderBoardPanel.addPanel(Layout.NONE, this.leaderBoard);
  this.leaderBoardPanel.visible = true;

  this.root = new Panel(game, new StackLayout());
  this.root.setSize(game.width, game.height);
  this.root.visible = true;

  // this.root.invalidate = this.invalidate.bind(this.root);

  this.root.addPanel(Layout.STRETCH, this.basePanel);
  this.root.addPanel(Layout.STRETCH, this.centerPanel);
  this.root.addPanel(Layout.STRETCH, this.leaderBoardPanel);
  this.root.addPanel(Layout.STRETCH, this.modalComponent);


  // add root to stage
  this.game.stage.addChild(this.root);

  this.auth.on('sync', this.login, this);
  this.auth.on('data', this.data, this);
  this.auth.on('disconnected', this._disconnected, this);

  this.game.on('gui/modal', this.modal, this);
  this.game.on('fpsProblem', this._fpsProblem, this);
  this.game.on('game/pause', this._pause, this);
};

// GUIState.prototype.invalidate = function(local) {
//   console.log('root invalidate');
//   Panel.prototype.invalidate.call(this, local);
// };

GUIState.prototype.login = function(user) {
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

GUIState.prototype.data = function(user) {
  if(this.auth.isUser()) {
    this.headerPane.login(user);
    this.headerPane.invalidate(true);
  }
};

GUIState.prototype.refresh = function() {
  this.root.invalidate(true);
};

GUIState.prototype.toggle = function(force) {
  this.root.visible =
    force !== undefined ? force : !this.root.visible;
  
  // repaint gui
  if(this.root.visible) {
    this.root.invalidate();
  }
};

GUIState.prototype.loading = function() {
  this.game.emit('gui/message', 'loading', 500);
};

GUIState.prototype.modal = function(show, content, lock, visible) {
  if(typeof show !== 'boolean') { show = true; };
  if(content === undefined) { content = new Panel(game, new StackLayout()); }
  if(lock === undefined) { lock = true; }
  if(visible === undefined) { visible = true; }

  if(lock && show) {
    this.game.input.keyboard.stop();
  } else {
    this.game.input.keyboard.start();
  }

  this.modalComponent.empty();
  this.modalComponent.addPanel(Layout.USE_PS_SIZE, content);
  this.modalComponent.visible = show;
  this.modalComponent.bg.settings.fillAlpha = visible ? 0.8 : 0.0;
  this.modalComponent.invalidate(true);

  this.refresh();
};

GUIState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.setSize(width, height);
    this.root.invalidate();
  }
};

GUIState.prototype._pause = function() {
  this.game.emit('gui/message', 'paused', 1000, 500);
};

GUIState.prototype._disconnected = function() {
  this.game.emit('gui/alert', GUIState.DISCONNECT_MESSAGE, false, 'connection lost');
};

GUIState.prototype._fpsProblem = function() {
  this.game.emit('gui/alert', GUIState.FPSPROBLEM_MESSAGE, 'ok', 'performance problem');
};

module.exports = GUIState;
