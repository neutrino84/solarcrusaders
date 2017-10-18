
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    ButtonIcon = require('../components/ButtonIcon');

function EnhancementButton(game) {
  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    padding: [0],
    layout: {
      type: 'stack'
    },
    bg: false
  });
};

EnhancementButton.prototype = Object.create(Pane.prototype);
EnhancementButton.prototype.constructor = EnhancementButton;

EnhancementButton.prototype.create = function(enhancement) {
  var game = this.game;

  // button name
  this.name = enhancement;

  // add countdown
  this.label = new Label(game, {
    constraint: Layout.USE_PS_SIZE,
    text: {
      fontName: 'medium'
    },
    bg: {
      fillAlpha: 0.4,
      color: 0x000000
    }
  });
  this.label.visible = false;

  // add button icon
  this.icon = new ButtonIcon(game, {
    padding: [0, 0, 2, 0],
    bg: {
      color: 0x009999,
      alpha: {
        enabled: 0.5,
        disabled: 1.0,
        over: 0.85,
        down: 0.85,
        up: 0.85
      }
    },
    icon: {
      key: 'texture-atlas',
      frame: 'enhancement-' + enhancement + '.png',
      width: 34,
      height: 34,
      bg: {
        fillAlpha: 1.0,
        color: 0x000000
      },
      alpha: {
        enabled: 1.0,
        disabled: 0.5,
        over: 1.0,
        down: 1.0,
        up: 0.9
      },
      tint: {
        enabled: 0xFFFFFF,
        disabled: 0xFF0000,
        over: 0xFFFFFF,
        down: 0xFFFFFF,
        up: 0xFFFFFF
      }
    }
  });
  this.icon.on('inputDown', this.selected, this);

  // add to display
  this.addPanel(this.icon);
  this.addPanel(this.label);
};

EnhancementButton.prototype.selected = function() {
  this.emit('selected', this);
};

EnhancementButton.prototype.cooldown = function(cooldown) {
  // disable
  this.disable(true);
  this.count = global.parseInt(cooldown);
  this.label.text = this.count;
  this.label.visible = true;
  this.parent.invalidate(false, true);

  // timer
  this.timer && this.game.clock.events.remove(this.timer);
  this.timer = this.game.clock.events.repeat(1000, this.count, function() {
    this.label.text = (--this.count).toString();
    this.invalidate(false, true);
  }, this);
};


EnhancementButton.prototype.stopped = function() {
  this.timer && this.game.clock.events.remove(this.timer);
};


EnhancementButton.prototype.cooled = function() {
  this.disable(false);
  this.label.visible = false;

  // cancel timer
  this.timer && this.game.clock.events.remove(this.timer);
};

EnhancementButton.prototype.start = function() {
  this.icon.start();
};

EnhancementButton.prototype.stop = function() {
  this.icon.stop();
};

EnhancementButton.prototype.disable = function(value) {
  this.icon.disable(value);
};

module.exports = EnhancementButton;
