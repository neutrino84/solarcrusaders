
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

function EnhancementPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL, 
      gap: 4
    },
    bg: false
  });

  this.containers = [];
  this.buttons = {};
  this.config = this.game.cache.getJSON('item-configuration')['enhancement'];

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/enhancement/started', this._started, this);
  this.game.on('ship/enhancement/stopped', this._stopped, this);
  this.game.on('ship/enhancement/cancelled', this._cancelled, this);
};

EnhancementPane.prototype = Object.create(Pane.prototype);
EnhancementPane.prototype.constructor = EnhancementPane;

// EnhancementPane.prototype.reset = function() {
//   var button,
//       buttons = this.buttons,
//       content = this.content;
//   for(var b in buttons) {
//     buttons[b].stop();
//     content.removePanel(buttons[b]);
//   }
// };

EnhancementPane.prototype.create = function(enhancement, key) {
  var game = this.game,
      label = new Label(game, {
        text: {
          fontName: 'medium'
        },
        bg: false
      }),
      button = new ButtonIcon(game, {
        constraint: Layout.CENTER,
        width: 34,
        height: 34,
        padding: [0],
        margin: [0],
        bg: {
          fillAlpha: 0.10,
          color: 0xFFFFFF
        },
        icon: {
          key: 'texture-atlas',
          frame: 'enhancement-' + enhancement + '.png'
        }
      });

  button.label = label;
  button.label.visible = false;
  button.addPanel(label);

  return button;
};

EnhancementPane.prototype._select = function(button) {
  var game = this.game,
      player = this.player;
  
  // disable
  button.parent.disabled(true);
  
  // send event
  game.emit('ship/enhancement/start', {
    uuid: player.details.uuid,
    enhancement: button.parent.id
  });
};

EnhancementPane.prototype._started = function(data) {
  var config = this.config[data.enhancement],
      button = this.buttons[data.enhancement];
  if(data.uuid === this.player.details.uuid) {
    
    // disable
    button.disabled(true);
    button.count = global.parseInt(config['basic'].cooldown);
    button.label.text = button.count;
    button.label.visible = true;
    // button.parent.invalidate(button);

    // timer
    this.timer && this.game.clock.events.remove(this.timer);
    this.timer = this.game.clock.events.repeat(1000, button.count,
      function() {
        button.label.text = (--button.count).toString();
        // button.parent.invalidate(button);
      });
  }
};

EnhancementPane.prototype._stopped = function(data) {
  if(data.uuid !== this.player.details.uuid) { return; }
};

EnhancementPane.prototype._cancelled = function(data) {
  if(data.uuid !== this.player.details.uuid) { return; }

  var button = this.buttons[data.enhancement];
      button.disabled(false);
      button.label.visible = false;

  // cancel timer
  this.timer && this.game.clock.events.remove(this.timer);
};

EnhancementPane.prototype._player = function(player) {
  var enhancement, button, container,
      enhancementData, enhancementStats,
      tooltipText, tooltip,
      enhancements = player.details.enhancements,
      buttons = this.buttons;

  if(this.player) { return; }

  // set player object
  this.player = player;
  
  // create buttons
  for(var i=0; i<10; i++) {
    enhancement = enhancements[i];

    container = new Pane(this.game, {
      constraint: Layout.CENTER,
      width: 34,
      height: 34,
      layout: {
        type: 'stack'
      },
      bg: {
        fillAlpha: 0.5,
        color: 0x000000
      },
    });

    if(enhancement) {
      button = this.create(enhancement);
      button.id = enhancement;
      button.bg.on('inputUp', this._select, this);
      button.start();

      buttons[enhancement] = button;

      container.addPanel(button);
    }

    this.addPanel(container);
    
    // enhancementData = client.ItemConfiguration['enhancement'][enhancement];
    // enhancementStats = Object.keys(enhancementData.stats);
    // tooltipText = enhancementData.tooltip.replace('{statValue}', enhancementData.stats[enhancementStats[0]].value);
  
    // tooltip = new Tooltip(game, tooltipText, button);
    // tooltip.attach();
  }

  // hotkey
  // this.game.input.on('keypress', function(event, key){
  //   var button = this.buttons[enhancements[key-1]];
  //   button && this._select(button);
  // }, this);

  this.parent.parent.invalidate();
};

module.exports = EnhancementPane;
