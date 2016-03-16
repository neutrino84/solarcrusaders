
var engine = require('engine'),
    Layout = require('../../Layout'),
    ContentPane = require('../ContentPane'),
    CargoPane = require('./CargoPane'),
    FittingPane = require('./FittingPane'),
    Pane = require('../../components/Pane'),
    ButtonIcon = require('../../components/ButtonIcon'),
    Class = engine.Class;

function Ship(game, settings) {
  Pane.call(this, game,
    Class.mixin(settings, {
      bg: {
        blendMode: engine.BlendMode.ADD
      },
      layout: {
        direction: Layout.HORIZONTAL
      },
      cargoPane: {
        padding: [1, 4, 1, 0]
      },
      fittingPane: {
        padding: [1, 4]
      },
      close: {
        padding: [0, 2],
        border: [0],
        icon: {
          padding: [0],
          border: [0],
          frame: 'icon-close.png',
          bg: {
            highlight: false,
            borderSize: 0.0,
            fillAlpha: 0.0,
            radius: 0.0
          }
        },
        bg: {
          fillAlpha: 1.0,
          borderSize: 0.0,
          radius: 0.0
        }
      }
    })
  );

  this.closeButton = new ButtonIcon(game, 'texture-atlas', this.settings.close);
  this.closeButton.on('inputUp', this._close, this);

  this.cargoPane = new CargoPane(game, this.settings.cargoPane);
  this.fittingPane = new FittingPane(game, this.settings.fittingPane);
  this.fittingPane.title.addPanel(Layout.RIGHT, this.closeButton);

  this.addPanel(Layout.STRETCH, this.cargoPane);
  this.addPanel(Layout.STRETCH, this.fittingPane);

  this.swap(this.cargoPane, this.fittingPane);

  this.game.on('ship/fitting', this._open, this);
  this.game.on('gui/player/select', this._playerSelect, this);
};

Ship.prototype = Object.create(Pane.prototype);
Ship.prototype.constructor = Ship;

Ship.prototype._playerSelect = function(data) {
  if(!this.data) {
    this.data = data;
    this.fittingPane.create(data);

    //..
    //.. TEMP
    // this._open();
  }
};

Ship.prototype._open = function() {
  if(this.data === undefined) { return; }
  
  //.. TEST
  // this.cargoPane.reset({
  //   items: [
  //     { uuid: '1', sprite: 'item-turret-flak.png', count: 1 },
  //     { uuid: '2', sprite: 'item-turret-laser.png', count: 1 },
  //     { uuid: '3', sprite: 'item-turret-pulse.png', count: 1 }
  //   ]
  // });
  //.. TEST

  this.fittingPane.reset(this.data);

  this.closeButton.start();
  this.cargoPane.start();
  this.fittingPane.start();

  this.game.emit('gui/modal', true, this);
};

Ship.prototype._close = function() {
  this.closeButton.stop();
  this.cargoPane.stop();
  this.fittingPane.stop();

  this.game.emit('gui/modal', false);
};

module.exports = Ship;
