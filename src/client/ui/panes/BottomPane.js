
var engine = require('engine'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ProgressButtonIcon = require('../components/ProgressButtonIcon'),
    Class = engine.Class;

function BottomPane(game, string, settings) {
  Panel.call(this, game, new BorderLayout(0, 0));

  this.socket = game.net.socket;

  this.data = {};
  this.buttons = {};
  this.config = this.game.cache.getJSON('enhancement-configuration');

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [1, 4],
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

  this.addView(this.bg);
  this.addPanel(Layout.CENTER, this.content);

  this.game.on('gui/player/select', this._playerSelect, this);
  this.game.on('enhancement/started', this._enhancmentStarted, this);
  this.game.on('enhancement/cancelled', this._enhancmentCancelled, this);
};

BottomPane.prototype = Object.create(Panel.prototype);
BottomPane.prototype.constructor = BottomPane;

BottomPane.prototype.addContent = function(constraint, panel) {
  this.content.addPanel(constraint, panel);
};

BottomPane.prototype.create = function(enhancement, key) {
  return new ProgressButtonIcon(game,
    'texture-atlas', {
      padding: [1, 1, 1, 5],
      bg: {
        fillAlpha: 1.0,
        color: 0x3868b8,
        radius: 0.0
      },
      icon: {
        padding: [0],
        border: [0],
        width: 38,
        height: 38,
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

BottomPane.prototype._select = function(button) {
  var data = this.data;
  button.tint = 0xFF8800;
  this.socket.emit('enhancement/start', {
    ship: data.uuid,
    enhancement: button.id
  });
};

BottomPane.prototype._enhancmentStarted = function(data) {
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

BottomPane.prototype._enhancmentCancelled = function(data) {
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

BottomPane.prototype._updateCooldown = function() {
  this.count++;
  this.button.count.text = global.Math.floor((this.total-this.count)/4 + 1);
  this.button.invalidate(true);
};

BottomPane.prototype._updateActive = function() {
  this.count--;
  this.button.setProgressBar(this.count/this.total);
};

BottomPane.prototype._playerSelect = function(data) {
  var enhancement, button,
      enhancements = data.enhancements;
  if(this.data.uuid) { return; }
  for(var e in enhancements) {
    enhancement = enhancements[e];
    
    button = this.create(enhancement, global.parseInt(e) + 1);
    button.id = enhancement;
    button.on('inputUp', this._select, this);
    button.setProgressBar(1.0);
    
    this.buttons[enhancement] = button;
    this.addContent(Layout.NONE, button);
  }
  this.data = data;
};

module.exports = BottomPane;
