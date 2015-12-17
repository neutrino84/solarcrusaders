
var xhr = require('xhr'),
    engine = require('engine'),
    Layout = require('../Layout'),
    Panel = require('../Panel'),
    Pane = require('../components/Pane'),
    ButtonIcon = require('../components/ButtonIcon'),
    Class = engine.Class;

function SystemPane(game, settings) {
  Pane.call(this, game,
    Class.mixin(settings, {
      padding: [1],
      layout: {
        gap: 1,
        direction: Layout.HORIZONTAL
      },
      bg: {
        fillAlpha: 0.0,
        borderSize: 0.0,
        radius: 0
      }
    })
  );

  // button cache
  this.buttons = {};

  // initialize
  this.init();
};

SystemPane.prototype = Object.create(Pane.prototype);
SystemPane.prototype.constructor = SystemPane;

SystemPane.prototype.init = function() {
  var settings = this.settings,
      systems = settings.systems,
      system, data;
  for(var s in systems) {
    data = systems[s];
    system = this.create(s);
    system.image.tint = 0x00FF00;
    this.buttons[s] = system;
    this.addPanel(Layout.NONE, system);
  }
}

SystemPane.prototype.create = function(type) {
  return new ButtonIcon(game, 'icon-atlas', {
    padding: [0],
    bg: {
      color: 0x204060,
      fillAlpha: 1.0,
      borderSize: 0.0,
      radius: 4.0,
      blendMode: engine.BlendMode.MULTIPLY
    },
    icon: {
      padding: [1, 2, 2, 2],
      border: [0],
      frame: type,
      bg: {
        highlight: false,
        fillAlpha: 0.0,
        color: 0x3868b8,
        borderSize: 0.0,
        radius: 0.0
      }
    }
  });
};

module.exports = SystemPane;
