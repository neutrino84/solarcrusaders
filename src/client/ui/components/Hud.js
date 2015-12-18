
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
    width: 128,
    height: 64,
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

  if(this.ship.username) {
    this.label = new Label(game, ship.username, this.settings.label);
    this.label.tint = ship.isPlayer ? 0x33FF33 : 0x3399FF;
    this.addPanel(Layout.NONE, this.label);
  }

  this.healthBar = new ProgressBar(this.game, this.settings.health);
  this.healthBar.setProgressBar(ship.health / ship.config.stats.health);
  this.healthBar.renderable = false;
  this.addPanel(Layout.NONE, this.healthBar);

  this.validate();
  this.repaint();
};

Hud.prototype.update = function() {
  var ship = this.ship,
      world = this.game.world,
      transform = world.worldTransform.apply(ship.position);
  this.pivot.set(this.settings.width / 2, -ship.height / 2 * world.scale.x - 12);
  this.position.set(transform.x, transform.y);
};

Hud.prototype.destroy = function() {
  // this.label && this.label.destroy();
  this.label = undefined;
  this.game = undefined;
};

module.exports = Hud;
