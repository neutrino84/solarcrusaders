
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

  // order
  this.sort = ['pilot', 'engine', 'targeting', 'shield', 'teleport', 'reactor'];

  // initialize
  this.init();
};

SystemPane.prototype = Object.create(Pane.prototype);
SystemPane.prototype.constructor = SystemPane;

SystemPane.prototype.init = function() {
  var sort = this.sort,
      settings = this.settings,
      systems = settings.systems,
      system, data;
  if(!systems) { return; }
  for(var s in sort) {
    data = systems[sort[s]];
    if(data) {
      system = this.create(sort[s]);
      system.image.tint = 0x00FF00;
      this.buttons[sort[s]] = system;
      this.addPanel(Layout.NONE, system);
    }
  }
}

SystemPane.prototype.create = function(type) {
  return new ButtonIcon(game, 'texture-atlas', {
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
      frame: 'system-' + type + '.png',
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
