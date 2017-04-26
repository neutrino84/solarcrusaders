
var engine = require('engine'),
    SectorState = require('./SectorState'),
    Layout = require('../ui/Layout'),
    Pane = require('../ui/components/Pane');

function SelectionState(game) {};

SelectionState.prototype = Object.create(engine.State.prototype);
SelectionState.prototype.constructor = engine.State;

SelectionState.prototype.preload = function() {
  // load texture atlas
  this.game.load.atlasJSONHash('texture-atlas', 'imgs/game/texture-atlas.png', 'data/texture-atlas.json');

  // load ship configuration
  this.game.load.json('ship-configuration', 'data/ship-configuration.json');
  this.game.load.json('item-configuration', 'data/item-configuration.json');
};

SelectionState.prototype.create = function() {
  var game = this.game;


  //CHECKOUT LAYOUT BORDER
  
  this.root = new Pane(game, {
    width: game.width,
    height: game.height,
    layout: {
      type: 'flow',
      ax: Layout.LEFT,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: { color: 0x000000 }
  });

  this.pane1 = new Pane(game, {
    width: 128,
    height: 128,
    // constraint: Layout.STRETCH,
    layout: {
      type: 'flow',
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: { color: 0xffffff }
  });

  this.pane2 = new Pane(game, {
    width: 128,
    height: 128,
    constraint: Layout.STRETCH,
    layout: {
      type: 'flow',
      ax: Layout.LEFT,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL
    },
    bg: { color: 0x333333 }
  });

  this.root.addPanel(this.pane1)
  this.root.addPanel(this.pane2)
  // invalidate
  this.root.invalidate();
};

SelectionState.prototype.show = function() {

  // add to stage
  this.game.stage.addChild(this.root);

  // this.game.stage.addChild(this.pane1);
};

SelectionState.prototype.ready = function() {
  var game = this.game,
      sectorState = new SectorState(game);

  // load game
  game.states.add('sector', sectorState);
  game.states.start('sector');
};

SelectionState.prototype.resize = function(width, height) {

};

SelectionState.prototype.shutdown = function() {
  //.. properly destroy
};

module.exports = SelectionState;
