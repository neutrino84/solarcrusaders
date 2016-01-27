
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    ContentPane = require('./ContentPane'),
    Class = engine.Class;

function SubsystemPane(game, settings) {
  ContentPane.call(this, game, 'sub',
    Class.mixin(settings, {
      padding: [1],
      content: {
        padding: [2],
        layout: {
          type: 'list',
          gap: [2, 2],
          columns: 1
        }
      },
      button: {
        label: {
          padding: [2]
        }
      }
    })
  );

  // create
  this.create();
};

SubsystemPane.prototype = Object.create(ContentPane.prototype);
SubsystemPane.prototype.constructor = SubsystemPane;

SubsystemPane.prototype.create = function() {
  var len = 2;
  for(var i=0; i<len; i++) {
    this.addContent(Layout.NONE, this.createEmptyPane());
  }
};

SubsystemPane.prototype.createEmptyPane = function() {
  return new Pane(this.game, {
    width: 27,
    height: 27,
    bg: {
      fillAlpha: 0.75,
      color: 0x000000,
      borderSize: 0.0
    }
  });
};

module.exports = SubsystemPane;
