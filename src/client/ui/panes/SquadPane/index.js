
var engine = require('engine'),
    client = require('client'),
    Panel = require('../../Panel'),
    Layout = require('../../Layout'),
    Pane = require('../../components/Pane'),
    Label = require('../../components/Label'),
    FlowLayout = require('../../layouts/FlowLayout'),
    BorderLayout = require('../../layouts/BorderLayout'),
    BackgroundView = require('../../views/BackgroundView'),
    ButtonIcon = require('../../components/ButtonIcon'),
    Tooltip = require('../../components/Tooltip'),
    Class = engine.Class;

function SquadPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.LEFT,
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL, 
      gap: 4
    },
    bg: false
  });
  this.socket = this.game.net.socket
  this.containers = [];
  this.buttons = {};
  // this.config = this.game.cache.getJSON('item-configuration')['enhancement'];
  // this.socket = game.net.socket;

  // generate containers
  for(var i=0; i<SquadPane.MAXIMUM; i++) {
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
  this.game.on('ship/player/squadSync', this._squadIcons, this);

  this.initialized = false;
  this.game.on('hotkey/squad/closestHostile', this._hotkeySelect, this);
  this.game.on('hotkey/squad/engageTarget', this._hotkeySelect, this);
  this.game.on('hotkey/squad/regroup', this._hotkeySelect, this);
  this.game.on('hotkey/squad/shieldUp', this._hotkeySelect, this);
  this.game.on('hotkey/squad/repairOverdrive', this._hotkeySelect, this);
  // this.game.on('squad/detectHostiles', this._select, this);
  this.game.on('hotkey/squad/shieldDestination', this._shieldDestination, this);


  this.shieldDestinationActive = false;
};

SquadPane.prototype = Object.create(Pane.prototype);
SquadPane.prototype.constructor = SquadPane;

SquadPane.MAXIMUM = 6;

// SquadPane.prototype.reset = function() {
//   var button,
//       buttons = this.buttons,
//       content = this.content;
//   for(var b in buttons) {
//     buttons[b].stop();
//     content.removePanel(buttons[b]);
//   }
// };

SquadPane.prototype.create = function(icon, key) {
  var game = this.game,
      label = new Label(game, {
        constraint: Layout.USE_PS_SIZE,
        text: {
          fontName: 'medium'
        },
        bg: false
      }), button, iconMatrix = {
        closestHostile : 'squad-closest-hostile.png',
        engageTarget : 'squad-engage-target.png',
        repairOverdrive : 'squad-repair-overdrive.png',
        regroup : 'squad-regroup.png',
        shieldUp : 'squad-shieldUp.png',
        shieldDestination_green : 'squad-shieldDestination.png',
        shieldDestination_yellow : 'squad-shieldDestination_yellow.png',
        shieldDestination : 'squad-shieldDestination_hollow.png'
      };
      // detect : 'enhancement-detect.png'

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
          frame: iconMatrix[icon],
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

SquadPane.prototype._hotkeySelect = function(key){
  if(this.buttons[key]){
    this._select(this.buttons[key].bg) 
  };
};

SquadPane.prototype._select = function(button_bg) {
  var game = this.game,
      player = this.player,
      key = button_bg.parent.id, button;

      button = this.buttons[key];

      if(button == this.buttons['shieldDestination']){
        this._shieldDestination('shieldDestination')
        return;
      }

      if(!button.label.visible){
        button.disabled(true);
        button.count = 5;
        button.label.text = button.count;
        button.label.visible = true;
        button.invalidate(false, true);

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
          this.game.emit('squad/' + key);
      };
};

SquadPane.prototype._shieldDestination = function(key) {
  var game = this.game,
      player = this.player;
      // key = button_bg.parent.id, button;

      button = this.buttons[key];

  if(!button.label.visible){
    button.disabled(true);
    button.count = 5;
    button.label.text = button.count;
    button.label.visible = true;
    // button.icon.frame = 'squad-shieldDestination_yellow.png';
    button.invalidate(false, true);

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
    if(!this.shieldDestinationActive){
      this.game.emit('squad/shieldDestination', 'shieldDestination');
    } else {
      this.game.emit('squad/shieldDestinationDeactivate', 'shieldDestinationDeactivate')
    }
  };
  this.shieldDestinationActive = !this.shieldDestinationActive;
};

SquadPane.prototype._player = function(player) {
  var enhancement, button, container,
      squadShips = player.data.enhancements,
      containers = this.containers,
      buttons = this.buttons;

  // set player object
  this.player = player;
  this._squadIcons('regroup');
  // clear buttons
  // for(var b in buttons) {
  //   button = buttons[b];
  //   button.destroy({
  //     children: false,
  //     texture: true,
  //     baseTexture: false
  //   });
  // }
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
  this.invalidate();
};

SquadPane.prototype._squadIcons = function(icon) {
  var buttons = this.buttons, containers = this.containers, closestHostileButton;
  // var button, container,
  //     enhancements = this.player.data.enhancements,
  //     containers = this.containers,
  //     buttons = this.buttons,
  //     player = this.player;
  if(!this.initialized){
    this.initialized = true;
    regroupButton = this.create('regroup');
    regroupButton.id = 'regroup'
    regroupButton.bg.on('inputUp', this._select, this);
    regroupButton.start();

    this.buttons['regroup'] = regroupButton;

    containers[0].addPanel(regroupButton)
  }
  //  figure out how to place the 'regroup' button ONCE

  switch(icon) {
      // case 'regroup':
      //   regroupButton = this.create('regroup');
      //   regroupButton.id = 'regroup'
      //   regroupButton.bg.on('inputUp', this._select, this);
      //   regroupButton.start();

      //   this.buttons['regroup'] = regroupButton;

      //   containers[0].addPanel(regroupButton)
      // break
      case 'attackship':
        closestHostileButton = this.create('closestHostile');
        closestHostileButton.id = 'closestHostile';
        closestHostileButton.bg.on('inputUp', this._select, this);
        closestHostileButton.start();

        this.buttons['closestHostile'] = closestHostileButton;

        containers[1].addPanel(closestHostileButton)

        engageTargetButton = this.create('engageTarget');
        engageTargetButton.id = 'engageTarget'
        engageTargetButton.bg.on('inputUp', this._select, this);
        engageTargetButton.start();

        this.buttons['engageTarget'] = engageTargetButton;

        containers[2].addPanel(engageTargetButton)

        break;
      case 'shieldship':
        shieldUpButton = this.create('shieldUp');
        shieldUpButton.id = 'shieldUp'
        shieldUpButton.bg.on('inputUp', this._select, this);
        shieldUpButton.start();

        this.buttons['shieldUp'] = shieldUpButton;

        containers[3].addPanel(shieldUpButton)

        shieldDestinationButton = this.create('shieldDestination');
        shieldDestinationButton.id = 'shieldDestination'
        shieldDestinationButton.bg.on('inputUp', this._select, this);
        shieldDestinationButton.start();

        this.buttons['shieldDestination'] = shieldDestinationButton;

        containers[4].addPanel(shieldDestinationButton)

        break
      case 'repairship':
        repairOverdriveButton = this.create('repairOverdrive');
        repairOverdriveButton.id = 'repairOverdrive'
        repairOverdriveButton.bg.on('inputUp', this._select, this);
        repairOverdriveButton.start();

        this.buttons['repairOverdrive'] = repairOverdriveButton;

        containers[5].addPanel(repairOverdriveButton)

        break;
      default:
        break;
    }
  // if(icon === 'shieldmaiden'){
  //   shieldmaidenButton = this.create();
  //   shieldmaidenButton.id = icon;
  //   shieldmaidenButton.bg.on('inputUp', this._selectExtraIcon, this);
  //   shieldmaidenButton.start();

  //   buttons[icon] = shieldmaidenButton;

  //   containers[enhancements.length].addPanel(shieldmaidenButton)

  //   this.game.emit('hotkey/shieldmaiden', enhancements.length+1);
  // };

  this.invalidate();
};

module.exports = SquadPane;
