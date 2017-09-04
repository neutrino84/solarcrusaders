
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
        constraint: Layout.USE_PS_SIZE,
        text: {
          fontName: 'medium'
        },
        bg: false
      }),
      button = new ButtonIcon(game, {
        padding: [0, 0, 2, 0],
        bg: {
          color: 0x009999,
          alpha: {
            enabled: 0.5,
            disabled: 1.0,
            over: 0.85,
            down: 0.85,
            up: 0.85
          }
        },
        icon: {
          key: 'texture-atlas',
          frame: 'enhancement-' + enhancement + '.png',
          width: 34,
          height: 34,
          bg: {
            fillAlpha: 1.0,
            color: 0x000000
          },
          alpha: {
            enabled: 1.0,
            disabled: 0.5,
            over: 1.0,
            down: 1.0,
            up: 0.9
          },
          tint: {
            enabled: 0xFFFFFF,
            disabled: 0xFF0000,
            over: 0xFFFFFF,
            down: 0xFFFFFF,
            up: 0xFFFFFF
          }
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
    uuid: player.uuid,
    enhancement: button.parent.id
  });
};

EnhancementPane.prototype._started = function(data) {
  var config = this.config[data.enhancement],
      button = this.buttons[data.enhancement];
      
  if(!button){return}
  if(this.player && data.uuid === this.player.uuid) {
    // disable
    button.disabled(true);
    button.count = global.parseInt(config['basic'].cooldown);
    button.label.text = button.count;
    button.label.visible = true;
    button.invalidate(false, true);

    // timer
    button.timer && this.game.clock.events.remove(this.timer);
    button.timer = this.game.clock.events.repeat(1000, button.count,
      function() {
        button.label.text = (--button.count).toString();
        button.invalidate(false, true);
      });
  }
};

EnhancementPane.prototype._stopped = function(data) {
  if(!this.player || data.uuid !== this.player.uuid) { return; }
};

EnhancementPane.prototype._cancelled = function(data) {
  if(!this.player || data.uuid !== this.player.uuid) { return; }

  // console.log(data)

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
      enhancements = player.data.enhancements,
      buttons = this.buttons;

  if(this.player) { return;}

  // set player object
  this.player = player;
  
  // create buttons
  for(var i=0; i<10; i++) {
    enhancement = enhancements[i];

    container = new Pane(this.game, {
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
