
var engine = require('engine'),
    client = require('client'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    FlowLayout = require('../layouts/FlowLayout'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ButtonIcon = require('../components/ButtonIcon'),
    Tooltip = require('../components/Tooltip'),
    Class = engine.Class;

function EnhancementPane(game, string, settings) {
  Panel.call(this, game, new BorderLayout(0, 0));

  this.buttons = {};
  this.config = this.game.cache.getJSON('item-configuration')['enhancement'];

  // default styles
  this.settings = Class.mixin(settings, {
    padding: [2],
    border: [0],
    bg: {
      fillAlpha: 1.0,
      color: 0x3868b8,
      borderSize: 0.0,
      blendMode: engine.BlendMode.ADD,
      radius: 0.0
    },
    content: {
      padding: [2],
      bg: {
        fillAlpha: 0.8,
        color: 0x000000,
        radius: 0.0,
        borderSize: 0.0,
        blendMode: engine.BlendMode.MULTIPLY
      },
      layout: {
        direction: Layout.HORIZONTAL,
        gap: 2
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

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/enhancement/started', this._started, this);
  this.game.on('ship/enhancement/stopped', this._stopped, this);
  this.game.on('ship/enhancement/cancelled', this._cancelled, this);
};

EnhancementPane.prototype = Object.create(Panel.prototype);
EnhancementPane.prototype.constructor = EnhancementPane;

EnhancementPane.prototype.reset = function() {
  var button,
      buttons = this.buttons,
      content = this.content;
  for(var b in buttons) {
    buttons[b].stop();
    content.removePanel(buttons[b]);
  }
};

EnhancementPane.prototype.create = function(enhancement, key) {
  var game = this.game,
      countdown = new Panel(game, new FlowLayout(Layout.CENTER, Layout.CENTER)),
      label = new Label(game, '3', {
        bg: {
          fillAlpha: 0.0,
          borderSize: 0.0,
          radius: 0.0
        }
      }),
      button = new ButtonIcon(game,
        'texture-atlas', {
          padding: [0],
          border: [0],
          bg: {
            fillAlpha: 1.0,
            color: 0x3868b8,
            borderSize: 0.0,
            blendMode: engine.BlendMode.ADD,
            radius: 0.0,
            disabled: 0x333333
          },
          icon: {
            padding: [1],
            border: [0],
            width: 42,
            height: 42,
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

  countdown.addPanel(Layout.NONE, label);
  countdown.visible = false;

  button.countdown = countdown;
  button.label = label;
  button.addPanel(Layout.STRETCH, countdown);

  return button;
};

EnhancementPane.prototype._select = function(button) {
  var game = this.game,
      data = this.data;
  
  // disable
  button.disabled = true;
  
  // send event
  game.emit('ship/enhancement/start', {
    uuid: data.uuid,
    enhancement: button.id
  });
};

EnhancementPane.prototype._started = function(data) {
  if(data.uuid !== this.data.uuid) { return; }

  var config = this.config[data.enhancement],
      button = this.buttons[data.enhancement];
  
  // disable
  button.disabled = true;
  button.label.text = config.cooldown;
  button.count = config.cooldown;
  button.countdown.visible = true;
  button.invalidate(true);

  // timer
  this.timer && this.game.clock.events.remove(this.timer);
  this.timer = this.game.clock.events.repeat(1000, config.cooldown,
    function() {
      button.label.text = --button.count;
      button.invalidate(true);
    });
};

EnhancementPane.prototype._stopped = function(data) {
  if(data.uuid !== this.data.uuid) { return; }
};

EnhancementPane.prototype._cancelled = function(data) {
  if(data.uuid !== this.data.uuid) { return; }

  var button = this.buttons[data.enhancement];
      button.disabled = false;
      button.countdown.visible = false;

  // cancel timer
  this.timer && this.game.clock.events.remove(this.timer);
};

EnhancementPane.prototype._player = function(ship) {
  var enhancement, button,
      enhancementData, enhancementStats,
      tooltipText, tooltip,
      enhancements = ship.details.enhancements;

  // set data object
  this.data = ship.details;

  // reset buttons
  if(this.children.length) {
    this.reset();
  }
  
  // create buttons
  for(var e in enhancements) {
    enhancement = enhancements[e];
    
    button = this.buttons[enhancement] || this.create(enhancement, global.parseInt(e) + 1);
    button.id = enhancement;
    button.on('inputUp', this._select, this);
    button.start();
    
    this.buttons[enhancement] = button;
    this.content.addPanel(Layout.NONE, button);
    
    enhancementData = client.ItemConfiguration['enhancement'][enhancement];
    enhancementStats = Object.keys(enhancementData.stats);
    tooltipText = enhancementData.tooltip.replace('{statValue}', enhancementData.stats[enhancementStats[0]].value);
  
    tooltip = new Tooltip(game, tooltipText, button);
    tooltip.attach();
  }

  this.game.input.on('keypress', function(event, key){
    var button = this.buttons[enhancements[key-1]];
    button && this._select(button);
  }, this);

  this.invalidate(true);
};


module.exports = EnhancementPane;
