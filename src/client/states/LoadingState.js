
var engine = require('engine'),
    SectorState = require('./SectorState'),
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
      sectorState = new SectorState(game);

  // load game
  game.states.add('sector', sectorState);
  game.states.start('sector');

  // this.image = new Image(game, {
  //   margin: [10],
  //   padding: [10],
  //   key: 'loading',
  //   bg: {
  //     color: 0xFFFFFF
  //   }
  // });

  // this.progress = new ProgressBar(game, {
  //   constraint: Layout.CENTER,
  //   width: 162,
  //   height: 8
  // });

  // this.status = new Label(game, {
  //   constraint: Layout.CENTER,
  //   margin: [5],
  //   string: 'Loading',
  //   bg: {
  //     fillAlpha: 0.0,
  //     borderSize: 0.0
  //   },
  //   text: { fontName: 'small' }
  // });

  // this.root = new Pane(game, {
  //   layout: {
  //     type: 'flow',
  //     ax: Layout.CENTER,
  //     ay: Layout.CENTER,
  //     direction: Layout.VERTICAL
  //   },
  //   bg: { color: 0x000000 }
  // });

  // set base size
  // this.root.resize(game.width, game.height);

  // add ui elements
  // this.root.addPanel(this.image);
  // this.root.addPanel(this.progress);
  // this.root.addPanel(this.status);

  // force redraw
  // this.root.invalidate();

  // add event listeners
  // game.load.on('loadstart', this.loadingStart, this);
  // game.load.on('loadcomplete', this.loadingComplete, this);
  // game.load.on('filecomplete', this.loadingProgressBar, this);
};

LoadingState.prototype.loadingStart = function() {
  // add gui to stage
  this.game.stage.addChild(this.root);
};

LoadingState.prototype.loadingProgressBar = function() {
  var loaded = arguments[3],
      total = arguments[4],
      file = arguments[1];
  this.progress.amount(loaded/total);
  this.status.text = file;
  this.root.invalidate();
};

LoadingState.prototype.loadingComplete = function() {
  // fade out animation
  this.image.visible = false;
  this.progress.visible = false;
  this.status.visible = false;

  this.tween = this.game.tweens.create(this.root);
  this.tween.to({ alpha: 0.0 }, 3000);
  this.tween.delay(0);
  this.tween.start();
  this.tween.once('complete', function() {
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
