
var Pane = require('../../components/Pane'),
    Label = require('../../components/Label'),
    Layout = require('../../Layout'),
    ShipPane = require('./ShipPane');

function Shipyard(game) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    padding: [0],
    layout: {
      type: 'flow',
      ax: Layout.CENTER,
      ay: Layout.CENTER,
      direction: Layout.VERTICAL, 
      gap: 0
    },
    title: {
      width: 768,
      height: 32,
      padding: [8],
      layout: {
        type: 'flow',
        ax: Layout.TOP, 
        ay: Layout.LEFT,
        direction: Layout.VERTICAL, 
        gap: 0
      },
      label: {
        padding: [4],
        font: {
          name: 'medium',
          text: 'SHIPYARD',
          color: 0x67a4ff,
          scale: 2.0
        }
      },
      description: {
        padding: [4, 4, 0, 0],
        font: {
          name: 'full',
          text: 'Select a ship and squadron'
        }
      },
      bg: {
        color: 0x001c2c,
        fillAlpha: 0.8
      }
    },
    content: {
      width: 768 + 8,
      height: 384,
      layout: {
        type: 'flow',
        ax: Layout.LEFT,
        ay: Layout.TOP,
        direction: Layout.HORIZONTAL, 
        gap: 0
      }
    }
  });

  //subscribe to messaging
  this.game.on('ui/shipyard/show', this.show, this);
  this.game.on('ui/shipyard/hide', this.hide, this);
};

Shipyard.prototype = Object.create(Pane.prototype);
Shipyard.prototype.constructor = Shipyard;

Shipyard.prototype.create = function() {
  var game = this.game,
      settings = this.settings;

  // create title
  this.titleLabel = new Label(game, settings.title.label);
  this.descriptionLabel = new Label(game, settings.title.description);

  this.titlePane = new Pane(game, settings.title);
  this.titlePane.addPanel(this.titleLabel);
  this.titlePane.addPanel(this.descriptionLabel);

  this.contentPane = new Pane(game, settings.content);

  this.shipPane = new ShipPane(game);
  this.shipPane.create();

  // this.detailsPane;

  // add base panes
  this.addPanel(this.titlePane);
  this.addPanel(this.contentPane);

  // add ship and detail panes
  this.contentPane.addPanel(this.shipPane);
  // this.contentPane.addPanel(this.detailsPane);
};

Shipyard.prototype.show = function() {
  this.shipPane.start();
  this.game.emit('ui/modal', this);
};

Shipyard.prototype.hide = function() {
  this.shipPane.stop();
  this.game.emit('ui/modal', false);
};

module.exports = Shipyard;
