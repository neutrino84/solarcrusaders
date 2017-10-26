
var engine = require('engine'),
    SectorState = require('./SectorState'),
    Layout = require('../ui/Layout'),
    Pane = require('../ui/components/Pane'),
    ProgressBar = require('../ui/components/ProgressBar'),
    Label = require('../ui/components/Label');

function LoadingState(game) {};

LoadingState.prototype = Object.create(engine.State.prototype);
LoadingState.prototype.constructor = engine.State;

LoadingState.prototype.preload = function() {
  this.game.load.image('small', 'imgs/game/fonts/small.png');
};

LoadingState.prototype.create = function() {
  // load game
  this.game.states.add('sector', new SectorState(this.game));
  this.game.states.start('sector');

  // loading progress indicator
  this.progress = new ProgressBar(this.game, {
    width: 256,
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

  // loading status label
  this.status = new Label(this.game, {
    constraint: undefined,
    font: {
      name: 'small'
    }
  });

  // create root pane
  this.root = new Pane(this.game, {
    width: this.game.width,
    height: this.game.height,
    layout: {
      type: 'flow',
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: { color: 0x000000 }
  });

  // add ui elements
  this.root.addPanel(this.progress);
  this.root.addPanel(this.status);

  // invalidate
  this.root.invalidate();

  // add event listeners
  this.game.load.on('loadstart', this.loadingStart, this);
  this.game.load.on('loadcomplete', this.loadingComplete, this);
  this.game.load.on('filecomplete', this.loadingProgressBar, this);
};

LoadingState.prototype.loadingStart = function() {
  this.status.text = 'preparing to load game';
  this.root.invalidate();
  
  // add root to stage
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
  this.game.stage.removeChild(this.root);
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
