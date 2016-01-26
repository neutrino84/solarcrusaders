
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ProgressButtonIcon = require('../components/ProgressButtonIcon'),
    Class = engine.Class;

function EnhancementPane(game, string, settings) {
  Panel.call(this, game, new BorderLayout(0, 0));

  this.socket = game.net.socket;

  this.data = {};
  this.buttons = {};
  this.config = this.game.cache.getJSON('enhancement-configuration');

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [1],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    content: {
      padding: [3],
      bg: {
        fillAlpha: 0.8,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      },
      layout: {
        direction: Layout.HORIZONTAL,
        gap: 3
      }
    }
  });

  if(this.settings.width || this.settings.height) {
    this.setPreferredSize(
      this.settings.width, this.settings.height);
  }
  
  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, this.settings.bg);
  this.content = new Pane(game, this.settings.content);
  this.content.setPreferredSize(239, 58);

  this.addView(this.bg);
  this.addPanel(Layout.CENTER, this.content);

  this.game.on('gui/player/select', this._playerSelect, this);
  this.game.on('enhancement/started', this._enhancmentStarted, this);
  this.game.on('enhancement/cancelled', this._enhancmentCancelled, this);
};

EnhancementPane.prototype = Object.create(Panel.prototype);
EnhancementPane.prototype.constructor = EnhancementPane;

EnhancementPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

EnhancementPane.prototype.create = function(enhancement, key) {
  return new ProgressButtonIcon(game,
    'texture-atlas', {
      icon: {
        padding: [0],
        border: [0],
        width: 48,
        height: 48,
        frame: 'enhancement-' + enhancement + '.png',
        bg: {
          fillAlpha: 0.0,
          borderSize: 0.0,
          radius: 0.0
        }
      },
      hotkey: {
        key: key.toString()
      }
    }
  );
};

EnhancementPane.prototype._select = function(button) {
  var data = this.data;
  button.tint = 0xFF8800;
  this.socket.emit('enhancement/start', {
    ship: data.uuid,
    enhancement: button.id
  });
};

EnhancementPane.prototype._enhancmentStarted = function(data) {
  if(data.ship !== this.data.uuid) { return; }

  var ev, active,
      game = this.game,
      button = this.buttons[data.enhancement],
      config = this.config[data.enhancement],
      cooldown = {
        count: 0,
        total: config.cooldown * 4,
        button: button
      };

  ev = game.clock.events.repeat(250, cooldown.total, this._updateCooldown, cooldown);
  ev.on('complete', function(cooldown) {
    cooldown.button.disabled = false;
    cooldown.button.count.visible = false;
    cooldown.button.setProgressBar(1.0);
  });

  if(config.active) {
    active = { count: config.active * 10, total: config.active * 10, button: button };
    ev = game.clock.events.repeat(100, active.total, this._updateActive, active);
  }

  button.disabled = true;
  button.count.text = config.cooldown;
  button.count.visible = true;
  button.invalidate(true);
};

EnhancementPane.prototype._enhancmentCancelled = function(data) {
  var ev,
      game = this.game,
      button = this.buttons[data.enhancement];
      button.disabled = false;
      button.count.visible = false;
  button.tint = 0xFF8800;
  ev = game.clock.events.repeat(200, 5, function() {
    switch(button.tint) {
      case 0xFFFFFF:
        return button.tint = 0xFF8800;
      default:
        return button.tint = 0xFFFFFF;
    }
  });
};

EnhancementPane.prototype._updateCooldown = function() {
  this.count++;
  this.button.count.text = global.Math.floor((this.total-this.count)/4 + 1);
  this.button.invalidate(true);
};

EnhancementPane.prototype._updateActive = function() {
  this.count--;
  this.button.setProgressBar(this.count/this.total);
};

EnhancementPane.prototype._playerSelect = function(data) {
  var enhancement, button,
      enhancements = data.enhancements;
  if(this.data.uuid) {
    this.data = data;
  } else {
    this.data = data;
    for(var e in enhancements) {
      enhancement = enhancements[e];
      
      button = this.create(enhancement, global.parseInt(e) + 1);
      button.id = enhancement;
      button.on('inputUp', this._select, this);
      button.setProgressBar(1.0);
      
      this.buttons[enhancement] = button;
      this.addContent(Layout.NONE, button);
    }
    this.invalidate(true);
  }
};

module.exports = EnhancementPane;
