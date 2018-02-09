
var Panel = require('../ui/Panel'),
    Focus = require('../ui/Focus'),
    Pane = require('../ui/components/Pane'),
    Label = require('../ui/components/Label'),
    Layout = require('../ui/Layout'),
    pixi = require('pixi'),
    Shipyard = require('../ui/panes/Shipyard'),
    BottomPane = require('../ui/panes/BottomPane'),
    MiniMapPane = require('../ui/panes/MiniMapPane'),
    HeaderPane = require('../ui/panes/HeaderPane'),
    LeaderBoardPane = require('../ui/panes/LeaderBoardPane');

function UI(game) {
  this.game = game;
  this.focus = new Focus(game);
};

UI.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');

  // focus manager
};

UI.prototype.create = function() {
  this.bottom = new BottomPane(this.game);
  this.header = new HeaderPane(this.game);
  // this.leaderBoard = new LeaderBoardPane(this.game);

  // miniMap pane added to canvas
  // this.miniMapPanel = new MiniMapPane(this.game);

    // new FlowLayout(Layout.LEFT, Layout.TOP, Layout.HORIZONTAL, 6));

  this.root = new Pane(this.game, {
    width: this.game.width,
    height: this.game.height,
    layout: {
      type: 'border',
      gap: [0, 0]
    },
    bg: false
  });
  
  this.root.addPanel(this.header);
  this.root.addPanel(this.bottom);
  this.header.id = 'header';
  this.header.alpha = 0;

  // add elements
  console.log('UI index, auth user is ', this.game.auth.user)
  if(this.game.auth.user && !this.game.auth.user.ship){
    this.shipyard = new Shipyard(this.game); 
    this.root.addPanel(this.shipyard);
  } else {
    this.header.alpha = 1;
  };
  
  // invalidate
  this.root.invalidate();

  // add root to stage
  this.game.stage.addChild(this.root);

  this.game.on('connected', this.reconnect, this)
};

UI.prototype.reconnect = function() {
  console.log('reconnecting UI')
  if(!this.shipyard){
    this.shipyard = new Shipyard(this.game); 
    this.root.addPanel(this.shipyard);
  }
}

UI.prototype.refresh = function() {
  this.root.invalidate(true);
};

UI.prototype.destroy = function() {
  this.bottom.destroy();
  this.bottom.removeAll();
  this.root.removeAll();
  this.game.stage.removeChild(this.root)

  this.bottom = this.header = this.root = undefined;
  // this.root.invalidate(true);
};

UI.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

module.exports = UI;
