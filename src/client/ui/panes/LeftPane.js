
var xhr = require('xhr'),
    engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    ButtonIcon = require('../components/ButtonIcon');

function LeftPane(game, settings) {
  Pane.call(this, game, {
    padding: [20], //[6],
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
};

LeftPane.prototype = Object.create(Pane.prototype);
LeftPane.prototype.constructor = LeftPane;

module.exports = LeftPane;
