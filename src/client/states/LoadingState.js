
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
  this.game.load.image('loading', 'imgs/game/loading.gif');
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

  this.progress = new ProgressBar(game, {
    width: 162,
    height: 8,
    label: false
  });

  this.image = new Image(game, 'loading', {
    padding: [0, 0, 20, 0],
    border: [0],
    bg: { color: 0x000000 }
  });

  this.status = new Label(game, 'loading', {
    bg: {
      fillAlpha: 0.0,
      borderSize: 0.0
    },
    text: { fontName: 'small' }
  });

  this.container = new Pane(game, {
    layout: {
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: false
  });

  this.root = new Pane(game, {
    layout: {
      ax: Layout.CENTER,
      ay: Layout.CENTER
    },
    bg: { color: 0x000000 }
  });

  this.container.addPanel(Layout.CENTER, this.image);
  this.container.addPanel(Layout.CENTER, this.progress);
  this.container.addPanel(Layout.CENTER, this.status);

  this.root.setSize(game.width, game.height);
  this.root.addPanel(Layout.CENTER, this.container);

  // force redraw
  this.root.invalidate(true);

  // add event listeners
  game.load.on('loadstart', this.loadingStart, this);
  game.load.on('loadcomplete', this.loadingComplete, this);
  game.load.on('filecomplete', this.loadingProgressBar, this);
};

LoadingState.prototype.loadingStart = function() {
  // add gui to stage
  this.game.stage.addChild(this.root);

  // update display
  this.image.visible = true;
  this.progress.visible = true;
  this.status.visible = true; 
};

LoadingState.prototype.loadingProgressBar = function() {
  var loaded = arguments[3],
      total = arguments[4],
      file = arguments[1],
      pendingState = this.pendingState;
  this.progress.setProgressBar((loaded/total/pendingState) + (this.currentState/pendingState));
  this.status.text = file;
  this.status.invalidate();
};

LoadingState.prototype.loadingComplete = function() {
  // increment state
  this.currentState++;

  // move to front
  this.game.stage.addChild(this.root);

  // remove loading screen
  if(!this.game.state.hasPendingState) {
    // fade out animation
    this.tween1 = this.game.tweens.create(this.root);
    this.tween1.to({ alpha: 0.0 }, 500);
    this.tween1.delay(500);
    this.tween1.start();
    this.tween1.once('complete', function() {
      this.game.stage.removeChild(this.root);
    }, this);

    // fade out animation
    this.tween2 = this.game.tweens.create(this.container);
    this.tween2.to({ alpha: 0.0 }, 500);
    this.tween2.start();
    this.tween1.once('complete', function() {
      // update display
      this.image.visible = false;
      this.progress.visible = false;
      this.status.visible = false;
    }, this);
  }
};

LoadingState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.setSize(width, height);
    this.root.invalidate();
  }
};

module.exports = LoadingState;
