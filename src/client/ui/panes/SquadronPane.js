
var engine = require('engine'),
    Pane = require('../components/Pane'),
    Button = require('../components/Button'),
    Label = require('../components/Label'),
    Layout = require('../Layout');

function SquadronPane(game) {
  Pane.call(this, game, {
    constraint: Layout.LEFT,
    padding: [8],
    layout: {
      type: 'flow',
      ax: Layout.TOP,
      ay: Layout.LEFT,
      direction: Layout.VERTICAL, 
      gap: 4
    },
    title: {
      padding: [0, 0, 2, 0],
      font: {
        name: 'full',
        text: 'SQUADRON COMMANDS'
      }
    },
    button: {
      constraint: Layout.STRETCH,
      togglable: true,
      toggled: false,
      layout: {
        type: 'flow',
        ax: Layout.TOP,
        ay: Layout.LEFT,
        direction: Layout.HORIZONTAL, 
        gap: 4
      },
      label: {
        width: 128,
        padding: [8],
        font: {
          name: 'full',
          color: 0xffffff
        }
      },
      toggle: {
        label: {
          toggled: 0x000000
        },
        color: 0xffffff,
        fillAlpha: 1.0,
        alpha: {
          disabled: 0.5,
          over: 0.25,
          down: 0.5,
          up: 0.0,
          toggled: 0.75
        }
      },
      bg: {
        color: 0xffffff,
        fillAlpha: 0.25,
        borderSize: 1.0,
        borderColor: 0xffffff,
        borderAlpha: 1.0,
        alpha: {
          disabled: 0.5,
          over: 1.0,
          down: 0.75,
          up: 0.75
        }
      }
    }
  });

  // commands
  this.buttons = [];
  this.actions = [];
  this.hotkeys = [];

  // subscribe to messaging
  this.game.on('ship/user', this.user, this);
};

SquadronPane.COMMANDS = [
  { name: 'focus fire (q)', hotkey: 'q', action: 'focus' },
  { name: 'stay in formation (w)', hotkey: 'w', action: 'formation' },
  { name: 'supress fire (e)', hotkey: 'e', action: 'supress' },
  { name: 'defend area (r)', hotkey: 'r', action: 'defend' }
];

SquadronPane.prototype = Object.create(Pane.prototype);
SquadronPane.prototype.constructor = SquadronPane;

SquadronPane.prototype.create = function() {
  var command, button,
      commands = SquadronPane.COMMANDS,
      game = this.game,
      settings = this.settings,
      buttons = this.buttons,
      actions = this.actions,
      hotkeys = this.hotkeys;

  // title label
  this.titleLabel = new Label(game, settings.title);

  // add title
  this.addPanel(this.titleLabel);

  // create buttons
  for(var index=0; index<commands.length; index++) {
    command = commands[index];

    button = new Button(game, settings.button);
    button.id = index;
    button.start();
    button.on('inputUp', this.toggle, this);
    button.label.text = command.name.toUpperCase();

    // register hotkey
    game.emit('ui/hotkey/register', 'press', command.hotkey, this.hotkey, this);

    // store hotkey
    // and button
    buttons.push(button);
    hotkeys.push(command.hotkey);
    actions.push(command.action);

    // add to display
    this.addPanel(button);
  }
};

SquadronPane.prototype.toggle = function(button) {
  var game = this.game,
      player = this.player,
      command = SquadronPane.COMMANDS[button.id];

  // emit squadron command
  game.net.socket.emit('ship/squadron', {
    uuid: player.uuid,
    action: command.action,
    toggled: button.toggled 
  });
};

SquadronPane.prototype.hotkey = function(event) {
  var hotkeys = this.hotkeys,
      buttons = this.buttons,
      index = hotkeys.indexOf(event.key),
      button = buttons[index];

  // button
  if(button !== undefined) {
    // toggle
    button.toggle();
    
    // send message
    this.toggle(button);
  }
};


SquadronPane.prototype.user = function(ship) {
  var buttons = this.buttons,
      actions = this.actions,
      commands = ship.data.commands,
      toggled, button;
  
  // set player ship
  this.player = ship;

  // populate defaults
  for(var command in commands) {
    toggled = commands[command];
    button = buttons[actions.indexOf(command)];
    button && toggled && button.toggle();
  }
};

module.exports = SquadronPane;
