
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Class = engine.Class;

function ItemPane(game, settings) {
  Pane.call(this, game,
    Class.mixin(settings, {
      padding: [0],
      layout: {
        type: 'list',
        gap: [2, 2],
        columns: 3
      },
      data: {
        items: []
      },
      bg: false
    })
  );

  // create
  this.create();
};

ItemPane.prototype = Object.create(Pane.prototype);
ItemPane.prototype.constructor = ItemPane;

ItemPane.prototype.create = function() {
  var len = 42;
  for(var i=0; i<len; i++) {
    this.addPanel(Layout.NONE, this.createEmptyPane());
  }
};

ItemPane.prototype.createEmptyPane = function() {
  return new Pane(this.game, {
    width: 38,
    height: 38,
    bg: {
      fillAlpha: 0.5,
      color: 0x000000,
      borderSize: 0.0
    }
  });
};

module.exports = ItemPane;
