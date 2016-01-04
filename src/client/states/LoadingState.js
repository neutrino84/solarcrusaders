
var engine = require('engine'),
    GUIState = require('./GUIState'),
    SectorState = require('./SectorState'),
    Layout = require('../ui/Layout'),
    StackLayout = require('../ui/layouts/StackLayout'),
    Pane = require('../ui/components/Pane'),
    Image = require('../ui/components/Image'),
    ProgressBar = require('../ui/components/ProgressBar'),
    Label = require('../ui/components/Label');

function LoadingState() {};

LoadingState.prototype = Object.create(engine.State.prototype);
LoadingState.prototype.constructor = engine.State;

LoadingState.prototype.preload = function() {
  this.game.load.image('logo', 'imgs/game/logo.jpg');
  this.game.load.image('small', 'imgs/game/fonts/small.png');
};

LoadingState.prototype.init = function() {
  
};

LoadingState.prototype.create = function() {
  var game = this.game,
      guiState = this.gui = new GUIState(),
      sectorState = new SectorState();

  // load game
  game.state.add('gui', guiState, true, true);
  game.state.add('sector', sectorState);
  game.state.start('sector');

  // update counts
  this.currentState = 0;
  this.pendingState = game.state.pendingLength;

  // loading bar
  this.progress = new ProgressBar(game);

  // logo image
  this.image = new Image(game, 'logo', {
    padding: [0],
    border: [0],
    bg: { color: 0x000000 }
  });

  // loading status
  this.statusLabel = new Label(game, 'loading', {
    bg: {
      fillAlpha: 0.0,
      borderSize: 0.0
    },
    text: { fontName: 'small' }
  });

  // root pane
  this.root = new Pane(game, {
    layout: {
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: { color: 0x000000 }
  });

  this.root.setSize(game.width, game.height);
  this.root.addPanel(Layout.NONE, this.image);
  this.root.addPanel(Layout.NONE, this.progress);
  this.root.addPanel(Layout.NONE, this.statusLabel);

  // add event listeners
  game.load.on('loadstart', this.loadingStart, this);
  game.load.on('loadcomplete', this.loadingComplete, this);
  game.load.on('filecomplete', this.loadingProgressBar, this);

  // paint
  this.root.validate();
  this.root.repaint();
  this.root.invalidate = function() {
    this.isValid = false;
    this.isLayoutValid = false;
    this.cachedWidth = -1;
    
    this.validate();
    this.repaint();
  };
};

LoadingState.prototype.loadingStart = function() {
  // update display
  this.root.alpha = 1.0;
  this.image.visible = true;
  this.progress.visible = true;
  this.statusLabel.visible = true; 

  // add gui to stage
  this.game.stage.addChild(this.root);
};

LoadingState.prototype.loadingProgressBar = function() {
  var loaded = arguments[3],
      total = arguments[4],
      file = arguments[1],
      pendingState = this.pendingState;
  this.progress.setProgressBar((loaded/total/pendingState) + (this.currentState/pendingState));
  this.statusLabel.text = file;
  this.statusLabel.invalidate();
};

LoadingState.prototype.loadingComplete = function() {
  this.currentState++;

  // move to front
  this.game.stage.addChild(this.root);

  // remove loading screen
  if(!this.game.state.hasPendingState) {
    this.tween = this.game.tweens.create(this.root);
    this.tween.to({ alpha: 0.0 }, 4000);
    this.tween.delay(500);
    this.tween.start();
    this.tween.once('complete', function() {
      this.game.stage.removeChild(this.root);
    }, this);

    this.image.visible = false;
    this.progress.visible = false;
    this.statusLabel.visible = false;
  }
};

LoadingState.prototype.update = function() {
  this.image.rotation += 0.01;
};

LoadingState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.setSize(width, height);
    this.root.invalidate();
  }
};

module.exports = LoadingState;
