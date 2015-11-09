
var engine = require('engine'),
    Layout = require('../Layout'),
    Panel = require('../Panel'),
    Pane = require('../components/Pane'),
    Button = require('../components/Button');

function HeaderPane(game, settings) {
  Pane.call(this, game, {
    // padding: [6],
    layout: {
      gap: 6,
      direction: Layout.HORIZONTAL
    },
    bg: {
      fillAlpha: 0.0,
      borderSize: 0.0,
      radius: 0
    }
  });

  this.button1 = new Button(game, 'map');
  this.button2 = new Button(game, 'planet');
  this.button3 = new Button(game, 'galaxy');

  this.button1.on('inputUp', this._clicked, this);
  this.button2.on('inputUp', this._clicked, this);
  this.button3.on('inputUp', this._clicked, this);

  // this.button1.alpha = 0.5;
  // this.button2.alpha = 0.5;
  // this.button3.alpha = 0.5;

  this.addPanel(Layout.NONE, this.button1);
  this.addPanel(Layout.NONE, this.button2);
  this.addPanel(Layout.NONE, this.button3);
};

HeaderPane.prototype = Object.create(Pane.prototype);
HeaderPane.prototype.constructor = HeaderPane;

HeaderPane.prototype.disabled = function() {
  //..
};

HeaderPane.prototype.enabled = function() {
  //..
};

HeaderPane.prototype._clicked = function() {
  //..
};

module.exports = HeaderPane;
