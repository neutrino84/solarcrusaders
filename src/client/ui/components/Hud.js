
var engine = require('engine'),
    Panel = require('../Panel'),
    Label = require('./Label'),
    ProgressBar = require('./ProgressBar'),
    Layout = require('../Layout'),
    FlowLayout = require('../layouts/FlowLayout'),
    Class = engine.Class;

function Hud(ship, settings) {
  Panel.call(this, ship.game, true);

  this.settings = Class.mixin(settings, {
    width: 256,
    height: 256,
    padding: [0],
    border: [0],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    label: {
      text: {
        fontName: 'full'
      },
      bg: {
        fillAlpha: 0.0,
        borderSize: 0.0
      }
    },
    message: {
      text: {
        fontName: 'medium'
      },
      bg: {
        fillAlpha: 0.0,
        borderSize: 0.0
      }
    },
    health: {
      width: 80,
      height: 4,
      label: false,
      bg: {
        fillAlpha: 1.0,
        color: 0x000000,
        borderSize: 0.0
      },
      progress: {
        fillAlpha: 1.0,
        color: 0x00ff33,
        borderSize: 0.0
      }
    }
  });

  this.ship = ship;

  this.layout = new FlowLayout(
    this.settings.layout.ax, this.settings.layout.ay,
    this.settings.layout.direction, this.settings.layout.gap);

  this.setSize(this.settings.width,this.settings.height);
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);
};

Hud.prototype = Object.create(Panel.prototype);
Hud.prototype.constructor = Hud;

Hud.prototype.create = function() {
  var game = this.game,
      ship = this.ship;

  this.ship.manager.hudGroup.addChild(this);

  if(this.ship.username) {
    this.label = new Label(game, ship.username, this.settings.label);
    this.label.tint = ship.isPlayer ? 0x33FF33 : 0x3399FF;
    this.addPanel(Layout.CENTER, this.label);
  }

  this.healthBar = new ProgressBar(this.game, this.settings.health);
  this.healthBar.setProgressBar(ship.details.health / ship.config.stats.health);
  this.healthBar.renderable = false;
  this.addPanel(Layout.CENTER, this.healthBar);

  this.validate();
  this.repaint();
};

Hud.prototype.update = function() {
  var math = global.Math,
      ship = this.ship,
      world = this.game.world,
      transform = world.worldTransform.apply(ship.position);
  this.pivot.set(math.floor(this.settings.width / 2), math.floor(-ship.height / 2 * world.scale.x));
  this.position.set(math.floor(transform.x), math.floor(transform.y));
};

Hud.prototype.flash = function(message, color, duration, height, large) {
  if(color === undefined) { color = 0xFFFFFF; }
  if(height === undefined) { height = 15; }
  if(large === undefined) { large = false; }

  var ship = this.ship,
      world = this.game.world,
      label = new Label(this.game, message, this.settings.message),
      easing = engine.Easing.Quadratic.InOut,
      tweenPosition = this.game.tweens.create(label.position),
      tweenAlpha = this.game.tweens.create(label);
  
  label.tint = color;
  label.alpha = 0.0;
  label.pivot.set(label.width / 2, label.height / 2);
  label.position.set(this.size.width / 2, -ship.height / 2 * world.scale.x);
  large && label.scale.set(1.5, 1.5);

  this.add(label);

  tweenPosition.to({ y: label.y - height }, duration * 2 || 500, easing, true);
  tweenAlpha.to({ alpha: 1.0 }, duration || 250, easing, true, 0, 0, true);
  tweenAlpha.once('complete', function() {
    this.remove(label);
  }, this);
};

Hud.prototype.destroy = function() {
  this.ship.manager.hudGroup.removeChild(this);
  this.label = this.game = this.ship =
    this.layout = this.settings = undefined;
};

module.exports = Hud;
