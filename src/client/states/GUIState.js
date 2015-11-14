
var engine = require('engine'),
    
    Panel = require('../ui/Panel'),
    Layout = require('../ui/Layout'),

    BorderLayout = require('../ui/layouts/BorderLayout'),
    FlowLayout = require('../ui/layouts/FlowLayout'),
    StackLayout = require('../ui/layouts/StackLayout'),
    
    HeaderPane = require('../ui/panes/HeaderPane'),
    // LeftPane = require('../ui/panes/LeftPane'),
    RightPane = require('../ui/panes/RightPane'),
    ShipPane = require('../ui/panes/ShipPane'),
      
    Alert = require('../ui/components/Alert'),
    Modal = require('../ui/components/Modal'),
    Selection = require('../ui/components/Selection'),

    RegistrationForm = require('../ui/html/RegistrationForm'),
    LoginForm = require('../ui/html/LoginForm');

function GUIState() {};

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

  // this.game.load.image('icon1', 'imgs/game/icons/icon-x01.png');
  // this.game.load.image('icon2', 'imgs/game/icons/icon-x02.png');
  // this.game.load.image('icon3', 'imgs/game/icons/icon-x03.png');
  // this.game.load.image('icon4', 'imgs/game/icons/icon-x04.png');

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
  var self = this,
      game = this.game,
      name = 'the aurora';
      
  // this.leftPane = new LeftPane(game);
  this.rightPane = new RightPane(game);
  this.headerPane = new HeaderPane(game);
  this.shipPane = new ShipPane(game, name);
  this.center = new Panel(game, new FlowLayout(Layout.LEFT, Layout.TOP, Layout.VERTICAL, 6));
  this.bottom = new Panel(game, new FlowLayout(Layout.CENTER, Layout.TOP, Layout.HORIZONTAL, 6));
  this.base = new Panel(game, new BorderLayout(0, 0));

  this.selection = new Selection(game);

  this.modalComponent = new Modal(game);
  this.modalComponent.visible = false;

  this.alertComponent = new Alert(game);

  this.root = new Panel(game, new StackLayout());
  this.root.setSize(game.width, game.height);
  this.root.visible = false;

  this.center.setPadding(6);
  this.center.addPanel(Layout.STRETCH, this.headerPane);
  this.center.addPanel(Layout.LEFT, this.shipPane);

  this.bottom.addPanel(Layout.NONE, this.rightPane);

  this.base.addPanel(Layout.BOTTOM, this.bottom);
  this.base.addPanel(Layout.CENTER, this.center);
  // this.base.addPanel(Layout.LEFT, this.leftPane);

  this.root.addPanel(Layout.STRETCH, this.selection);
  this.root.addPanel(Layout.STRETCH, this.base);
  this.root.addPanel(Layout.STRETCH, this.modalComponent);

  // add root to stage
  this.game.stage.addChild(this.root);

  if(!this.auth.isUser()) {
    this.center.visible = false;
    this.registrationForm = new RegistrationForm(game);
    this.loginForm = new LoginForm(game);
    this.game.on('gui/loggedin', this._loggedin, this);
  } else {
    self.login();
  }

  this.auth.on('user', this.login, this);

  this.game.on('gui/modal', this.modal, this);

  // listen for fps problems
  // this.game.on('fpsProblem', this._fpsProblem, this);
};

GUIState.prototype.login = function() {
  // show login ui
  this.center.visible = true;
  this.center.invalidate();

  if(this.modalComponent.visible) {
    this.modal(false);
  }
};

GUIState.prototype.refresh = function() {
  this.toggle(true);
}

GUIState.prototype.toggle = function(force) {
  this.root.visible = force !== undefined ? force : !this.root.visible;
  
  // repaint gui
  if(this.root.visible) {
    this.root.invalidate();
    // this.root.validate();
    // this.root.repaint();
  }
}

GUIState.prototype.modal = function(show, content, lock) {
  if(typeof show !== 'boolean') { show = true; };
  if(content === undefined) { content = new Panel(game, new StackLayout()); }
  if(lock === undefined) { lock = false; }

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

  this.refresh();
};

GUIState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.setSize(width, height);
    // this.root.validate();
    // this.root.repaint();
    this.root.invalidate();
  }
};

GUIState.prototype._loggedin = function() {
  this.registrationForm.destroy();
  this.loginForm.destroy();
  this.loginForm = this.registrationForm = undefined;
  this.game.removeListener('gui/loggedin', this._loggedin);
};

GUIState.prototype._fpsProblem = function() {
  console.log('dropped a frame');
};

module.exports = GUIState;
