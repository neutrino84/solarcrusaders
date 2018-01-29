
var engine = require('engine'),
    client = require('client'),
    Panel = require('../Panel'),
    Layout = require('../Layout'),
    Pane = require('../components/Pane'),
    Label = require('../components/Label'),
    EnhancementButton = require('./EnhancementButton'),
    FlowLayout = require('../layouts/FlowLayout'),
    BorderLayout = require('../layouts/BorderLayout'),
    BackgroundView = require('../views/BackgroundView'),
    ButtonIcon = require('../components/ButtonIcon'),
    Class = engine.Class;

function EnhancementPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.BOTTOM,
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL, 
      gap: 2
    },
    bg: false
  });

  this.buttons = {};
  this.indexes = [];
  this.placeholders = [];

  this.config = this.game.cache.getJSON('item-configuration')['enhancement'];

  this.game.on('ship/user', this.user, this);
  this.game.on('ship/enhancement/started', this.started, this);
  this.game.on('ship/enhancement/stopped', this.stopped, this);
  this.game.on('ship/enhancement/cooled', this.cooled, this);
};

EnhancementPane.prototype = Object.create(Pane.prototype);
EnhancementPane.prototype.constructor = EnhancementPane;

EnhancementPane.MAXIMUM = 6;

EnhancementPane.prototype.create = function(enhancement, key) {
  var game = this.game,
      placeholders = this.placeholders;

  // generate placeholders
  for(var i=0; i<EnhancementPane.MAXIMUM; i++) {
    this.game.emit('ui/hotkey/register', 'press', i, this.hotkey, this);
    this.placeholders.push(
      new Pane(this.game, {
        constraint: Layout.CENTER,
        width: 38,
        height: 40,
        layout: {
          type: 'stack'
        },
        bg: {
          fillAlpha: 0.4,
          color: 0x000000
        }
      })
    );
    this.addPanel(this.placeholders[i]);
  }
};

EnhancementPane.prototype.hotkey = function(event, char) {
  var enhancement = this.indexes[char-1],
      button = this.buttons[enhancement];
  if(button) {
    this.selected(button);
  }
};

EnhancementPane.prototype.selected = function(button) {
  var game = this.game,
      player = this.player;

  // disable button
  button.disable(true);
  
  // send event
  game.emit('ship/enhancement/start', {
    uuid: player.uuid,
    enhancement: button.name
  });
};

EnhancementPane.prototype.started = function(data) {
  var game = this.game,
      player = this.player,
      config = this.config[data.enhancement],
      button = this.buttons[data.enhancement];
  if(player && button && data.uuid === player.uuid) {
    button.cooldown(config['basic'].cooldown);
  }
};

EnhancementPane.prototype.stopped = function(data) {
  var game = this.game,
      player = this.player,
      button = this.buttons[data.enhancement];
  if(player && data.uuid === player.uuid) {
    button.stopped();
  }
};

EnhancementPane.prototype.cooled = function(data) {
  var game = this.game,
      player = this.player,
      button = this.buttons[data.enhancement];
  if(player && data.uuid === player.uuid) {
    button.cooled();
  }
};

EnhancementPane.prototype.user = function(ship) {
  var enhancement, button,
      game = this.game,
      buttons = this.buttons,
      indexes = this.indexes,
      placeholders = this.placeholders,
      player = this.player = ship,
      enhancements = player.data.enhancements;

  // create buttons
  for(var i=0; i<enhancements.length; i++) {
    enhancement = enhancements[i];

    if(enhancement) {
      button = new EnhancementButton(game, enhancement);
      button.create();
      button.start();
      button.on('inputUp', this.selected, this);
      buttons[enhancement] = button;

      // save index
      indexes.push(enhancement);

      // add to ui
      placeholders[i].addPanel(button);
    }
  }

  this.invalidate();
};

module.exports = EnhancementPane;
