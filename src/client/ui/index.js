
var Panel = require('../ui/Panel'),
    Focus = require('../ui/Focus'),
    Pane = require('../ui/components/Pane'),
    Label = require('../ui/components/Label'),
    Layout = require('../ui/Layout'),
    pixi = require('pixi'),
    Shipyard = require('../ui/panes/Shipyard'),
    BottomPane = require('../ui/panes/BottomPane'),
    UpgradePane = require('../ui/panes/UpgradePane'),
    // TutorialDisplay = require('../ui/panes/TutorialDisplay'),
    TutorialDisplay = require('../ui/panes/TutorialDisplay'),
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
  this.upgradePane = new UpgradePane(this.game);
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
    // bg: false
    bg: { fillAlpha: 0.0,
      color: 0x000000 },
    alpha : 0
  });
  
  this.root.addPanel(this.header);
  this.root.addPanel(this.bottom);
  this.root.addPanel(this.upgradePane);
  this.header.id = 'header';
  this.header.alpha = 0;

  // add elements
  if(this.game.auth.user && !this.game.auth.user.ship){
    this.shipyard = new Shipyard(this.game); 
    this.root.addPanel(this.shipyard);

     // this.tutorialDisplay = new TutorialDisplay(this.game); 
     // this.root.addPanel(this.tutorialDisplay);
     //  this.tutorialDisplay.create();
  } else {
    this.header.alpha = 1;
  };
  
  // invalidate
  this.root.invalidate();

  // add root to stage
  this.game.stage.addChild(this.root);

  this.game.on('connected', this.reconnect, this)
  this.game.on('tutorial/show', this.showTutorial, this)
    this.game.on('fade/tutorialDisplay', this.fadeToBlack, this);

};

UI.prototype.reconnect = function() {
  console.log('reconnecting UI')
  // return
  if(!this.shipyard){
    this.shipyard = new Shipyard(this.game); 
    this.root.addPanel(this.shipyard);

    this.root.invalidate();
  }
}

UI.prototype.refresh = function() {
  this.root.invalidate(true);
};

UI.prototype.showTutorial = function() {
  this.root.removePanel(this.shipyard);

  this.tutorialDisplay = new TutorialDisplay(this.game); 
  this.root.addPanel(this.tutorialDisplay);
  this.tutorialDisplay.create();
  this.root.invalidate();
};

UI.prototype.fadeToBlack = function(){
  // this.root.fade(1, 1000);
};


UI.prototype.destroy = function() {
  this.game.removeListener('tutorial/show', this.showTutorial, this);
  this.game.removeListener('connected', this.reconnect, this);

  this.bottom.destroy();
  this.header.destroy();
  this.tutorialDisplay && this.tutorialDisplay.destroy();
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
