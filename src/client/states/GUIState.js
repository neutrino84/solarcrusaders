
var engine = require('engine'),
    
    Panel = require('../ui/Panel'),
    Layout = require('../ui/Layout'),

    BorderLayout = require('../ui/layouts/BorderLayout'),
    FlowLayout = require('../ui/layouts/FlowLayout'),
    StackLayout = require('../ui/layouts/StackLayout'),
    
    HeaderPane = require('../ui/panes/HeaderPane'),
    LeftPane = require('../ui/panes/LeftPane'),
    RightPane = require('../ui/panes/RightPane'),
    ShipPane = require('../ui/panes/ShipPane'),
      
    Alert = require('../ui/components/Alert'),
    AlertMessage = require('../ui/components/AlertMessage'),
    Modal = require('../ui/components/Modal'),
    Selection = require('../ui/components/Selection'),

    RegistrationForm = require('../ui/html/RegistrationForm'),
    LoginForm = require('../ui/html/LoginForm');

function GUIState() {};

GUIState.DISCONNECT_MESSAGE = 'connection to the server has been lost\nattempting to reconnect';

GUIState.prototype = Object.create(engine.State.prototype);
GUIState.prototype.constructor = engine.State;

GUIState.prototype.init = function() {
  this.auth = this.game.auth;

  // add listeners
  this.game.on('gui/modal', this.modal, this);
};

GUIState.prototype.preload = function() {
  // load font
  this.game.load.image('vt323', 'imgs/game/fonts/vt323.png');

  // load icons
  this.game.load.image('icon1', 'imgs/game/icons/icon-x01.png');

  // tilemap
  this.game.load.image('deck', 'imgs/game/tilesets/deck-mini.png');
  this.game.load.image('wall', 'imgs/game/tilesets/wall-mini.png');
  this.game.load.image('grid', 'imgs/game/tilesets/grid-mini.png');
  
  this.game.load.tilemap('ship', 'data/ship-mini.json');

  // spritesheet
  this.game.load.spritesheet('crew', 'imgs/game/spritesheets/crew-mini.png', 16, 16);
  this.game.load.spritesheet('door', 'imgs/game/spritesheets/door-mini.png', 16, 16);

  // ship outline
  this.game.load.image('ship-outline', 'imgs/game/ships/vessel-x01-outline.png');
};

GUIState.prototype.create = function() {
  var game = this.game,
      name = 'the aurora';

  this.selection = new Selection(game);

  this.modalComponent = new Modal(game);
  this.modalComponent.visible = false;

  this.alertComponent = new Alert(game);
  this.alertMessageComponent = new AlertMessage(game);
  
  this.basePanel = new Panel(game, new BorderLayout(0, 0));
  this.centerPanel = new Panel(game, new BorderLayout(0, 0));
      
  this.leftPane = new LeftPane(game);
  this.rightPane = new RightPane(game);
  this.headerPane = new HeaderPane(game);

  this.shipPanel = new Panel(game, new FlowLayout(Layout.LEFT, Layout.TOP, Layout.VERTICAL, 6));
  this.shipPanel.setPadding(6);
  this.shipPanel.addPanel(Layout.LEFT, this.shipPane = new ShipPane(game, name));

  this.topPanel = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.HORIZONTAL, 6));
  this.topPanel.addPanel(Layout.NONE, this.rightPane);

  this.root = new Panel(game, new StackLayout());
  this.root.setSize(game.width, game.height);
  this.root.visible = false;

  // this.centerPanel.addPanel(Layout.TOP, this.headerPane);
  this.centerPanel.addPanel(Layout.CENTER, this.shipPanel);
  this.centerPanel.addPanel(Layout.LEFT, this.leftPane);
  
  this.basePanel.addPanel(Layout.TOP, this.topPanel);

  this.root.addPanel(Layout.STRETCH, this.selection);
  this.root.addPanel(Layout.STRETCH, this.basePanel);
  this.root.addPanel(Layout.STRETCH, this.centerPanel);
  this.root.addPanel(Layout.STRETCH, this.modalComponent);

  // add root to stage
  this.game.stage.addChild(this.root);

  // login
  this.login();

  this.auth.on('user', this.login, this);
  this.auth.on('disconnected', this._disconnected, this);

  this.game.on('gui/modal', this.modal, this);
  // this.game.on('fpsProblem', this._fpsProblem, this);
};

GUIState.prototype.login = function() {
  if(this.auth.isUser()) {
    this.centerPanel.visible = true;
    this.centerPanel.invalidate();
  } else {
    this.centerPanel.visible = false;
    this.registrationForm = new RegistrationForm(game);
    this.loginForm = new LoginForm(game);
    this.game.on('gui/loggedin', this._loggedin, this);
  }
  if(this.modalComponent.visible) {
    this.modal(false);
  }
};

GUIState.prototype.refresh = function() {
  this.toggle(true);
};

GUIState.prototype.toggle = function(force) {
  this.root.visible = force !== undefined ? force : !this.root.visible;
  
  // repaint gui
  if(this.root.visible) {
    this.root.invalidate();
  }
};

GUIState.prototype.modal = function(show, content, lock, visible) {
  if(typeof show !== 'boolean') { show = true; };
  if(content === undefined) { content = new Panel(game, new StackLayout()); }
  if(lock === undefined) { lock = false; }
  if(visible === undefined) { visible = true; }

  if(lock && show) {
    this.selection.stop();
    this.game.input.keyboard.stop();
  } else {
    this.selection.start();
    this.game.input.keyboard.start();
  }

  this.modalComponent.empty();
  this.modalComponent.addPanel(Layout.USE_PS_SIZE, content);
  this.modalComponent.visible = show;
  this.modalComponent.bg.settings.fillAlpha = visible ? 0.8 : 0.0;

  this.refresh();
};

GUIState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.setSize(width, height);
    this.root.invalidate();
  }
};

GUIState.prototype._loggedin = function() {
  this.registrationForm.destroy();
  this.loginForm.destroy();
  this.loginForm = this.registrationForm = undefined;
  this.game.removeListener('gui/loggedin', this._loggedin);
};

GUIState.prototype._disconnected = function() {
  this.game.emit('gui/alert', GUIState.DISCONNECT_MESSAGE, false, 'connection lost');
};

GUIState.prototype._fpsProblem = function() {
  console.log('dropped a frame');
};

module.exports = GUIState;
