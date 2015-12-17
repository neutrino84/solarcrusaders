
var engine = require('engine'),
    
    Panel = require('../ui/Panel'),
    Layout = require('../ui/Layout'),

    BorderLayout = require('../ui/layouts/BorderLayout'),
    FlowLayout = require('../ui/layouts/FlowLayout'),
    StackLayout = require('../ui/layouts/StackLayout'),
    
    HeaderPane = require('../ui/panes/HeaderPane'),
    LeftPane = require('../ui/panes/LeftPane'),
    RightPane = require('../ui/panes/RightPane'),
    BottomPane = require('../ui/panes/BottomPane'),
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

  // load tilesets
  this.game.load.image('deck', 'imgs/game/tilesets/deck-mini.png');
  this.game.load.image('wall', 'imgs/game/tilesets/wall-mini.png');
  this.game.load.image('grid', 'imgs/game/tilesets/grid-mini.png');
    
  // load ship tilemap
  this.game.load.tilemap('ship-tilemap', 'data/ship-mini.json');

  // load ship configuration
  this.game.load.json('ship-configuration', 'data/ship-configuration.json');

  // load texture atlas
  this.game.load.atlasJSONHash('icon-atlas', 'imgs/game/icons/icon-atlas.png', 'data/icon-atlas.json');
  this.game.load.atlasJSONHash('ship-atlas', 'imgs/game/ships/ship-atlas.png', 'data/ship-atlas.json');

  // spritesheet
  this.game.load.spritesheet('crew', 'imgs/game/spritesheets/crew-mini.png', 16, 16);
  this.game.load.spritesheet('door', 'imgs/game/spritesheets/door-mini.png', 16, 16);

  // ship outline
  this.game.load.image('vessel-x01-outline', 'imgs/game/ships/vessel-x01-outline.png');
  this.game.load.image('vessel-x03-outline', 'imgs/game/ships/vessel-x03-outline.png');
};

GUIState.prototype.create = function() {
  var game = this.game;

  this.selection = new Selection(game);
  this.labels = new engine.Group(game);
  this.labels.visible = false;

  this.modalComponent = new Modal(game);
  this.modalComponent.visible = false;

  this.alertComponent = new Alert(game);
  this.alertMessageComponent = new AlertMessage(game);

  this.centerPanel = new Panel(game, new BorderLayout(0, 0));
  this.basePanel = new Panel(game, new BorderLayout(0, 0));
  this.basePanel.setPadding(6);
      
  this.leftPane = new LeftPane(game);
  this.rightPane = new RightPane(game);
  this.bottomPane = new BottomPane(game);

  this.shipPanel = new Panel(game, new FlowLayout(Layout.LEFT, Layout.TOP, Layout.VERTICAL, 6));
  this.shipPanel.setPadding(6);
  this.shipPanel.addPanel(Layout.NONE,
    this.shipPane =
      new ShipPane(game, {
        player: true
      }));

  this.targetPanel = new Panel(game, new FlowLayout(Layout.RIGHT, Layout.TOP, Layout.VERTICAL, 6));
  this.targetPanel.setPadding(6);
  this.targetPanel.addPanel(Layout.NONE,
    this.targetPane =
      new ShipPane(game, {
        player: false
      }));

  this.topPanel = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.HORIZONTAL, 6));
  this.topPanel.addPanel(Layout.NONE, this.rightPane);

  this.bottomPanel = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.HORIZONTAL, 6));
  this.bottomPanel.addPanel(Layout.NONE, this.bottomPane);
  this.bottomPanel.visible = false;

  this.centerPanel.addPanel(Layout.CENTER, this.shipPanel);
  this.centerPanel.addPanel(Layout.LEFT, this.leftPane);
  this.centerPanel.addPanel(Layout.RIGHT, this.targetPanel);
  
  this.basePanel.addPanel(Layout.TOP, this.topPanel);
  this.basePanel.addPanel(Layout.BOTTOM, this.bottomPanel);

  this.root = new Panel(game, new StackLayout());
  this.root.setSize(game.width, game.height);
  this.root.visible = false;

  this.root.addChild(this.labels);

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
    this.bottomPanel.visible = true;
    this.bottomPanel.invalidate();
  } else {
    this.bottomPanel.visible = false;
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
  this.labels.visible = this.root.visible =
    force !== undefined ? force : !this.root.visible;
  
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

  // this.refresh();
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
