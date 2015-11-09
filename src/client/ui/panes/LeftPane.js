
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    ButtonIcon = require('../components/ButtonIcon');

function LeftPane(game, settings) {
  Pane.call(this, game, {
    padding: [6],
    layout: {
      gap: 6
    },
    bg: {
      color: 0x336699,
      fillAlpha: 0.2,
      borderSize: 0.0,
      radius: 1
    }
  });

  this.icon1 = new ButtonIcon(game, 'icon1'),
  this.icon2 = new ButtonIcon(game, 'icon2'),
  this.icon3 = new ButtonIcon(game, 'icon3'),
  this.icon4 = new ButtonIcon(game, 'icon4');

  this.addPanel(Layout.NONE, this.icon4);
  this.addPanel(Layout.NONE, this.icon2);
  this.addPanel(Layout.NONE, this.icon3);
  this.addPanel(Layout.NONE, this.icon1);
};

LeftPane.prototype = Object.create(Pane.prototype);
LeftPane.prototype.constructor = LeftPane;

module.exports = LeftPane;
