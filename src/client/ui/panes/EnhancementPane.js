
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
    Tooltip = require('../components/Tooltip'),
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
  this.placeholders = [];

  this.config = this.game.cache.getJSON('item-configuration')['enhancement'];

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/enhancement/started', this._started, this);
  this.game.on('ship/enhancement/stopped', this._stopped, this);
  this.game.on('ship/enhancement/cooled', this._cooled, this);
};

EnhancementPane.prototype = Object.create(Pane.prototype);
EnhancementPane.prototype.constructor = EnhancementPane;

EnhancementPane.MAXIMUM = 4;

EnhancementPane.prototype.create = function(enhancement, key) {
  var game = this.game,
      placeholders = this.placeholders;

  // generate placeholders
  for(var i=0; i<EnhancementPane.MAXIMUM; i++) {
    this.placeholders.push(
      new Pane(this.game, {
        constraint: Layout.CENTER,
        width: 34,
        height: 36,
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

EnhancementPane.prototype._started = function(data) {
  var game = this.game,
      player = this.player,
      config = this.config[data.enhancement],
      button = this.buttons[data.enhancement];
  if(player && button && data.uuid === player.uuid) {
    button.cooldown(config['basic'].cooldown);
  }
};

EnhancementPane.prototype._stopped = function(data) {
  var game = this.game,
      player = this.player,
      button = this.buttons[data.enhancement];
  if(player && data.uuid === player.uuid) {
    button.stopped();
  }
};

EnhancementPane.prototype._cooled = function(data) {
  var game = this.game,
      player = this.player,
      button = this.buttons[data.enhancement];
  if(player && data.uuid === player.uuid) {
    button.cooled();
  }
};

EnhancementPane.prototype._player = function(player) {
  var enhancement, button,
      enhancements = player.data.enhancements,
      game = this.game,
      buttons = this.buttons,
      placeholders = this.placeholders;

  // set player object
  this.player = player;
  
  // create buttons
  for(var i=0; i<enhancements.length; i++) {
    enhancement = enhancements[i];

    if(enhancement) {
      button = new EnhancementButton(game);
      button.create(enhancement);
      button.start();
      button.on('selected', this.selected, this);
      buttons[enhancement] = button;

      placeholders[i].addPanel(button);
    }
  }

  this.invalidate();
};

module.exports = EnhancementPane;
