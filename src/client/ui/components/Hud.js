
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
    height: 32,
    padding: [0],
    border: [0],
    layout: {
      ax: Layout.CENTER,
      ay: Layout.TOP,
      direction: Layout.VERTICAL,
      gap: 0
    },
    label: {
      padding: [4, 2],
      border: [0],
      text: {
        fontName: 'full'
      },
      bg: {
        fillAlpha: 0.0,
        borderSize: 0.0
      }
    },
    stats: {
      padding: [4, 2],
      border: [0],
      text: {
        fontName: 'small'
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

  this.setSize(this.settings.width, this.settings.height);
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);
};

Hud.prototype = Object.create(Panel.prototype);
Hud.prototype.constructor = Hud;

Hud.prototype.create = function() {
  var game = this.game,
      ship = this.ship;

  this.pinned = new engine.Group(this.game);
  this.pinned.transform = new engine.Pinned();
  this.pinned.position.set(this.ship.pivot.x, this.ship.pivot.y);
  this.pinned.add(this);

  this.pivot.set(128, -32);

  this.ship.add(this.pinned);

  this.username = new Label(game, ship.username, this.settings.label);
  this.username.tint = ship.isPlayer ? 0x33FF33 : (
    ship.details.ai === 'pirate' ? 0xFF0000 : 0x3399FF
  );

  this.healthBar = new ProgressBar(this.game, this.settings.health);
  this.healthBar.setProgressBar(ship.details.health / ship.config.stats.health);

  this.stats = new Label(game, '', this.settings.stats);

  this.addPanel(Layout.CENTER, this.username);
  this.addPanel(Layout.CENTER, this.healthBar);
  this.addPanel(Layout.CENTER, this.stats);

  this.validate();
  this.repaint();
};

Hud.prototype.select = function() {
  this.healthBar.renderable = true;
  this.stats.renderable = true;
};

Hud.prototype.deselect = function() {
  this.healthBar.renderable = false;
  this.stats.renderable = false;
};

Hud.prototype.update = function() {
  var scale = this.game.world.scale.x,
      x = this.settings.width/2,
      y = -scale * (this.ship.chassis.texture.width/2);
  this.pivot.set(x, y);
};

Hud.prototype.updateStats = function(data) {
  this.stats.text = data.kills + '/' +
    data.disables + '/' + data.assists;
  this.invalidate(true);
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
  Panel.prototype.destroy.call(this);
  this.username = this.game = this.ship =
    this.layout = this.settings = undefined;
};

module.exports = Hud;
