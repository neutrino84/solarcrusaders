
var engine = require('engine'),
    Panel = require('../Panel'),
    StackLayout = require('../layouts/StackLayout'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;

function Modal(game, settings) {
  Panel.call(this, game, new StackLayout(0, 0));

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [0],
    border: [0],
    bg: {
      fillAlpha: 0.75,
      color: 0x000000,
      borderSize: 0.0,
      radius: 0.0
    }
  });
  
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, this.settings.bg);

  this.addView(this.bg);
};

Modal.prototype = Object.create(Panel.prototype);
Modal.prototype.constructor = Modal;

Modal.prototype.empty = function() {
  if(this.panels.length > 0) {
    for(var p in this.panels) {
      //.. TODO: FIX THIS
      // if(this.panels[p].destroy) {
      //   this.panels[p].destroy();
      // }
      this.removePanel(this.panels[p]);
    }
  }
};

module.exports = Modal;
