
var Panel = require('../ui/Panel'),
    Pane = require('../ui/components/Pane'),
    Layout = require('../ui/Layout'),
    
    Shipyard = require('../ui/panes/Shipyard'),
    BottomPane = require('../ui/panes/BottomPane');

function UI(game) {
  this.game = game;
};

UI.prototype.preload = function() {
  // load font
  this.game.load.image('medium', 'imgs/game/fonts/medium.png');
  this.game.load.image('full', 'imgs/game/fonts/full.png');
};

UI.prototype.create = function() {
  this.shipyard = new Shipyard(this.game);
  this.bottom = new BottomPane(this.game);

  this.root = new Pane(this.game, {
    width: this.game.width,
    height: this.game.height,
    layout: {
      type: 'border',
      gap: [0, 0]
    },
    bg: false
  });

  // add elements
  this.root.addPanel(this.shipyard);
  this.root.addPanel(this.bottom);

  // invalidate
  this.root.invalidate();

  // add root to stage
  this.game.world.ui.addChild(this.root);
};

UI.prototype.refresh = function() {
  this.root.invalidate(true);
};

UI.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

module.exports = UI;
