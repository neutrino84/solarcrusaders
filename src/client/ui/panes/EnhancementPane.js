
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
  this.socket = game.net.socket;

  // generate containers
  for(var i=0; i<EnhancementPane.MAXIMUM; i++) {
    this.containers.push(
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
    this.addPanel(this.containers[i]);
  }

  this.game.on('ship/player', this._player, this);
  this.game.on('ship/player/shieldmaiden', this._extraIcons, this);
  this.game.on('ship/player/shieldmaidenActivate', this._started, this);
  this.game.on('ship/enhancement/started', this._started, this);
  this.game.on('ship/enhancement/stopped', this._stopped, this);
  this.game.on('ship/enhancement/cooled', this._cooled, this);
};

EnhancementPane.prototype = Object.create(Pane.prototype);
EnhancementPane.prototype.constructor = EnhancementPane;

EnhancementPane.MAXIMUM = 10;

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
      }), button;
      if(enhancement){
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
      } else {
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
            frame: 'shieldmaiden.png',
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
      }

  button.label = label;
  button.label.visible = false;
  button.addPanel(label);

  return button;
};

EnhancementPane.prototype._select = function(button) {
  var game = this.game,
      player = this.player;
  
  // disable
  // button.parent.disabled(true);
  
  // send event
  game.emit('ship/enhancement/start', {
    uuid: player.uuid,
    enhancement: button.parent.id
  });
};

EnhancementPane.prototype._started = function(data) {
  var config = this.config[data.enhancement],
      button = this.buttons[data.enhancement];

  if(data === 'shieldmaidenActivate' && this.buttons['shieldmaiden']){


    button = this.buttons['shieldmaiden'];
    button.disabled(true);
    button.count = 5;
    button.label.text = button.count;
    button.label.visible = true;
    button.invalidate(false, true);

    //need to figure out how to make this not clickable if it's on cooldown
    this.socket.emit('squad/shieldmaidenActivate', {player_uuid: this.player.uuid})
    // timer
    button.timer && this.game.clock.events.remove(this.timer);
    button.timer = this.game.clock.events.repeat(1000, button.count,
      function() {
        button.label.text = (--button.count).toString();
        button.invalidate(false, true);
        if(button.count === 0){
          button.disabled(false);
          button.label.visible = false;
        }
      });

    return
  }

  if(this.player && button && data.uuid === this.player.uuid) {
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

  // cancel timer
  this.timer && this.game.clock.events.remove(this.timer);
};

EnhancementPane.prototype._cooled = function(data) {
  if(!this.player || data.uuid !== this.player.uuid) { return; }

  var button = this.buttons[data.enhancement];
      button.disabled(false);
      button.label.visible = false;

  // cancel timer
  this.timer && this.game.clock.events.remove(this.timer);
};

EnhancementPane.prototype._player = function(player) {
  var enhancement, button, container,
      enhancements = player.data.enhancements,
      containers = this.containers,
      buttons = this.buttons, shieldmaiden;

  // set player object
  this.player = player;

  // clear buttons
  for(var b in buttons) {
    button = buttons[b];
    button.destroy({
      children: false,
      texture: true,
      baseTexture: false
    });
  }
  // create buttons
  for(var i=0; i<enhancements.length; i++) {
    enhancement = enhancements[i];

    if(enhancement) {
      button = this.create(enhancement);
      button.id = enhancement;
      button.bg.on('inputUp', this._select, this);
      button.start();

      buttons[enhancement] = button;

      containers[i].addPanel(button);
    }
  }
  // console.log(player, player.squadron)
  // for(var a in player.squadron){
  //   console.log(player.squadron[a])
  //   console.log(player.squadron[a].data.chassis)
  //   if (player.squadron[a].data.chassis === 'squad-shield'){
  //     shieldmaiden = true
  //     console.log('I HAVE A SHIELDMAIDEN!')
  //   }
  // };
  // if(shieldmaiden){
  //   shieldmaidenButton = this.create()
  //   containers[enhancements.length].addPanel(shieldmaidenButton)
  // };

  this.invalidate();
};

EnhancementPane.prototype._extraIcons = function(icon) {
  var button, container,
      enhancements = this.player.data.enhancements,
      containers = this.containers,
      buttons = this.buttons,
      player = this.player;

  // clear buttons
  // for(var b in buttons) {
  //   button = buttons[b];
  //   button.destroy({
  //     children: false,
  //     texture: true,
  //     baseTexture: false
  //   });
  // }
  console.log('in enhancement pane, icon is ', icon)

  // create buttons
  // for(var i=0; i<enhancements.length; i++) {
  //   enhancement = enhancements[i];

  //   if(enhancement) {
  //     button = this.create(enhancement);
  //     button.id = enhancement;
  //     button.bg.on('inputUp', this._select, this);
  //     button.start();

  //     buttons[enhancement] = button;

  //     containers[i].addPanel(button);
  //   }
  // }
  // console.log(player, player.squadron)
  // for(var a in player.squadron){
  //   console.log(player.squadron[a])
  //   console.log(player.squadron[a].data.chassis)
  //   if(player.squadron[a].data.chassis === 'squad-shield'){
  //     shieldmaiden = true
  //     console.log('I HAVE A SHIELDMAIDEN!')
  //   }
  // };
  if(icon === 'shieldmaiden'){
    shieldmaidenButton = this.create();
    shieldmaidenButton.id = icon;
    shieldmaidenButton.bg.on('inputUp', this._started('shieldmaidenActivate'), this);
    shieldmaidenButton.start();

    buttons[icon] = shieldmaidenButton;


    containers[enhancements.length].addPanel(shieldmaidenButton)

    this.game.emit('hotkey/shieldmaiden', enhancements.length+1);
  };

  this.invalidate();
};

module.exports = EnhancementPane;
