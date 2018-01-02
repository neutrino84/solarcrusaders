
var engine = require('engine'),
    SectorState = require('./SectorState'),
    LossState = require('./LossState'),
    WinState = require('./WinState'),
    Layout = require('../ui/Layout'),
    Pane = require('../ui/components/Pane'),
    Image = require('../ui/components/Image'),
    ProgressBar = require('../ui/components/ProgressBar'),
    Label = require('../ui/components/Label');

function LoadingState() {};

LoadingState.prototype = Object.create(engine.State.prototype);
LoadingState.prototype.constructor = engine.State;

LoadingState.prototype.preload = function() {
  this.game.load.image('loading', 'imgs/game/splash.png');
  this.game.load.image('small', 'imgs/game/fonts/small.png');
};

LoadingState.prototype.create = function() {
  var game = this.game,
      sectorState = new SectorState(game),
      lossState = new LossState(game),
      winState = new WinState(game);

  // load game
  game.states.add('sector', sectorState);
  game.states.add('loss', lossState);
  game.states.add('win', winState);
  game.states.start('sector');

  this.image = new Image(game, {
    margin: [10],
    key: 'loading'
  });

  this.progress = new ProgressBar(game, {
    width: 162,
    height: 8,
    margin: [10],
    bg: {
      color: 0x333333
    },
    progress: {
      color: 0xffffff,
      modifier: {
        left: 0.0,
        top: 0.0,
        width: 0.0,
        height: 1.0
      }
    }
  });

  this.status = new Label(game, {
    margin: [0],
    string: 'preparing to load game',
    text: { fontName: 'small' }
  });

  this.root = new Pane(game, {
    width: game.width,
    height: game.height,
    layout: {
      type: 'flow',
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: { color: 0x000000 }
  });

  // add ui elements
  this.root.addPanel(this.image);
  this.root.addPanel(this.progress);
  this.root.addPanel(this.status);

  // invalidate
  this.root.invalidate();

  // add event listeners
  game.load.on('loadstart', this.loadingStart, this);
  game.load.on('loadcomplete', this.loadingComplete, this);
  game.load.on('filecomplete', this.loadingProgressBar, this);
};

LoadingState.prototype.loadingStart = function() {
  // add gui to stage
  this.game.stage.addChild(this.root);
};

LoadingState.prototype.loadingProgressBar = function() {
  var loaded = arguments[3],
      total = arguments[4],
      file = arguments[1];
  this.progress.change('width', loaded/total);
  this.status.text = file;
  this.root.invalidate();
};

LoadingState.prototype.loadingComplete = function() {
  // fade out animation
  // this.image.visible = false;
  // this.progress.visible = false;
  // this.status.visible = false;

  this.tween = this.game.tweens.create(this.root);
  this.tween.to({ alpha: 0.0 }, 250);
  this.tween.delay(0);
  this.tween.start();
  this.tween.once('complete', function() {
    this.game.states.current.show && this.game.states.current.show();
    this.game.stage.removeChild(this.root);
  }, this);
};

LoadingState.prototype.resize = function(width, height) {
  if(this.root !== undefined) {
    this.root.resize(width, height);
    this.root.invalidate();
  }
};

LoadingState.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = LoadingState;
