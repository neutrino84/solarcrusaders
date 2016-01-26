
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Class = engine.Class;

function SubsystemPane(game, settings) {
  Pane.call(this, game,
    Class.mixin(settings, {
      padding: [1, 4, 1, 0],
      border: [0],
      width: 96,
      height: 32,
      layout: {
        type: 'stack'
      },
      bg: {
        fillAlpha: 1.0,
        color: 0x3868b8,
        borderSize: 0.0,
        blendMode: engine.BlendMode.ADD,
        radius: 0.0
      },
      content: {
        padding: [1],
        bg: {
          fillAlpha: 0.8,
          color: 0x000000,
          radius: 0.0,
          borderSize: 0.0,
          blendMode: engine.BlendMode.MULTIPLY
        }
      }
    })
  );

  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width, this.settings.height);
  }

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.content = new Pane(game, this.settings.content);

  this.addPanel(Layout.CENTER, this.content);
};

SubsystemPane.prototype = Object.create(Pane.prototype);
SubsystemPane.prototype.constructor = SubsystemPane;

module.exports = SubsystemPane;
