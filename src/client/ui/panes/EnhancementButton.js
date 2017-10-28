
var engine = require('engine'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    TextView = require('../views/TextView'),
    ButtonIcon = require('../components/ButtonIcon');

function EnhancementButton(game, enhancement) {
  ButtonIcon.call(this, game, {
    icon: {
      frame: 'enhancement-' + enhancement + '.png',
      alpha: {
        enabled: 1.0,
        disabled: 0.25,
        over: 0.8,
        down: 1.0,
        up: 1.0
      }
    },
    counter: {
      name: 'medium',
      text: '0'
    },
    bg: {
      color: 0x67a4ff,
      fillAlpha: 0.5,
      alpha: {
        enabled: 0.5,
        disabled: 0.5,
        over: 1.0,
        down: 0.5,
        up: 0.5
      }
    }
  });

  // button name
  this.name = enhancement;
};

EnhancementButton.WIDTH = 38;
EnhancementButton.SCALE = EnhancementButton.WIDTH/48;

EnhancementButton.prototype = Object.create(ButtonIcon.prototype);
EnhancementButton.prototype.constructor = EnhancementButton;

EnhancementButton.prototype.create = function() {
  // scale image
  this.image.scale.set(EnhancementButton.SCALE, EnhancementButton.SCALE);

  // add countdown
  this.counter = new TextView(this.game, this.settings.counter);
  this.counter.visible = false;

  // add to display
  this.addView(this.counter);
};

EnhancementButton.prototype.cooldown = function(cooldown) {
  // disable
  this.disable(true);
  this.count = global.parseInt(cooldown);
  this.counter.font.text = this.count.toString();
  this.counter.position.set(
    (EnhancementButton.WIDTH-this.counter.width)/2,
    (EnhancementButton.WIDTH-this.counter.height)/2);
  this.counter.visible = true;
  this.parent.invalidate();

  // timer
  this.timer && this.game.clock.events.remove(this.timer);
  this.timer = this.game.clock.events.repeat(1000, this.count, function() {
    this.counter.font.text = (--this.count).toString();
    this.counter.position.set(
      (EnhancementButton.WIDTH-this.counter.width)/2,
      (EnhancementButton.WIDTH-this.counter.height)/2);
  }, this);
};

EnhancementButton.prototype.stopped = function() {};

EnhancementButton.prototype.cooled = function() {
  this.disable(false);
  this.counter.visible = false;

  // cancel timer
  this.timer && this.game.clock.events.remove(this.timer);
};

module.exports = EnhancementButton;
