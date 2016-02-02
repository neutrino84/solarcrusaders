
var engine = require('engine'),
    Layout = require('../../Layout'),
    ContentPane = require('../ContentPane'),
    Pane = require('../../components/Pane'),
    StatPane = require('./StatPane'),
    HardpointPane = require('./HardpointPane'),
    Class = engine.Class;

function FittingPane(game, settings) {
  ContentPane.call(this, game, 'ship fitting',
    Class.mixin(settings, {
      content: {
        padding: [1],
        layout: {
          ax: Layout.LEFT,
          ay: Layout.TOP,
          direction: Layout.HORIZONTAL,
          gap: 1
        }
      },
      bg: false
    })
  );

  this.hardpointPane = new HardpointPane(game);
  this.statPane = new StatPane(game);

  this.addContent(Layout.STRETCH, this.hardpointPane);
  this.addContent(Layout.STRETCH, this.statPane);
};

FittingPane.prototype = Object.create(ContentPane.prototype);
FittingPane.prototype.constructor = FittingPane;

FittingPane.prototype.reset = function() {
  this.hardpointPane.reset();
  this.statPane.reset();
};

FittingPane.prototype.start = function() {
  this.button.start();
  this.hardpointPane.start();
};

FittingPane.prototype.stop = function() {
  this.button.stop();
  this.hardpointPane.stop();
};

FittingPane.prototype.create = function(data) {
  this.hardpointPane.create(data);
  this.statPane.create(data);
};

module.exports = FittingPane;
