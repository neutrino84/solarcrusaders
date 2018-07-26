
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

function SquadUpgradePane(game, settings) {
    Pane.call(this, game, {
        constraint: Layout.CENTER,
        layout: {
            type: 'flow',
            ax: Layout.CENTER,
            ay: Layout.BOTTOM,
            direction: Layout.HORIZONTAL,
            gap: 2
        },
        bg: false
    });
    this.socket = this.game.net.socket
    this.containers = [];
    this.buttons = {};
    // this.config = this.game.cache.getJSON('item-configuration')['enhancement'];
    // this.socket = game.net.socket;

    // generate containers
    for (var i = 0; i < SquadUpgradePane.MAXIMUM; i++) {
        this.containers.push(
            new Pane(this.game, {
                constraint: Layout.CENTER,
                width: 34,
                height: 34,
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
    this.initialized = false;
    this.game.on('ship/player', this._player, this);
    // this.game.on('ship/player/squadSync', this._squadIcons, this);
};

SquadUpgradePane.prototype = Object.create(Pane.prototype);
SquadUpgradePane.prototype.constructor = SquadUpgradePane;

SquadUpgradePane.MAXIMUM = 3;

SquadUpgradePane.prototype.create = function (icon) {
    var game = this.game, button,
        label = new Label(game, {
            constraint: Layout.USE_PS_SIZE,
            text: {
                fontName: 'medium'
            },
            bg: false
        }),
        descriptor = new Label(game, {
            constraint: Layout.USE_PS_SIZE,
            text: {
                fontName: 'medium'
            },
            bg: false,
            margin: [50, 0, 0, 0]
        }),
        iconMatrix = {
            attackShip: {
                frame: 'squad-attack_upright.png',
                descriptor: 'AttackShip'
            },
            shieldShip: {
                frame: 'squad-shield_upright.png',
                descriptor: 'ShieldShip'
            },
            repairShip: {
                frame: 'squad-repair_upright.png',
                descriptor: 'RepairShip'
            }
        };

    button = new ButtonIcon(game, {
        padding: [0, 0, 0, 0],
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
            frame: iconMatrix[icon].frame,
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
    button.descriptor = descriptor;
    button.descriptor.text = iconMatrix[icon].descriptor;
    button.descriptor.alpha = -1;
    button.label.visible = false;
    button.addPanel(label);
    button.addPanel(descriptor);

    return button;
};

SquadUpgradePane.prototype._fill = function (key) {
    attackShipButton = this.create('attackShip');
    attackShipButton.id = 'attackShipButton';
    attackShipButton.bg.on('inputUp', this._select, this);
    attackShipButton.bg.on('inputOver', this._hover, this);
    attackShipButton.bg.on('inputOut', this._unhover, this);
    attackShipButton.start();

    this.buttons['attackShipButton'] = attackShipButton;

    this.containers[0].addPanel(attackShipButton);
};

SquadUpgradePane.prototype._hotkeySelect = function (key) {
    if (this.buttons[key]) {
        this._select(this.buttons[key].bg)
    };
};

SquadUpgradePane.prototype._select = function (button_bg) {
    var key = button_bg.parent.id;
    this.game.emit('squad/select', key);
};

SquadUpgradePane.prototype._hover = function (button) {
    button.parent.descriptor.alpha = button.parent.descriptor.alpha * -1;
};

SquadUpgradePane.prototype._unhover = function (button) {
    button.parent.descriptor.alpha = button.parent.descriptor.alpha * -1;
};

SquadUpgradePane.prototype._player = function (player) {
    var enhancement, button, container,
        squadShips = player.data.enhancements,
        containers = this.containers,
        buttons = this.buttons;
    // set player object
    this.player = player;
    this._fillButtons();
};

SquadUpgradePane.prototype._fillButtons = function (icon) {
    var buttons = this.buttons, containers = this.containers, attackShipButton, shieldShipButton, repairShipButton;
    
    attackShipButton = this.create('attackShip');

    attackShipButton.id = 'squad-attack';
    attackShipButton.bg.on('inputUp', this._select, this);
    attackShipButton.bg.on('inputOver', this._hover, this);
    attackShipButton.bg.on('inputOut', this._unhover, this);
    attackShipButton.start();

    shieldShipButton = this.create('shieldShip');
    shieldShipButton.id = 'squad-shield'
    shieldShipButton.bg.on('inputUp', this._select, this);
    shieldShipButton.bg.on('inputOver', this._hover, this);
    shieldShipButton.bg.on('inputOut', this._unhover, this);
    shieldShipButton.start();
    
    repairShipButton = this.create('repairShip');
    repairShipButton.id = 'squad-repair'
    repairShipButton.bg.on('inputUp', this._select, this);
    repairShipButton.bg.on('inputOver', this._hover, this);
    repairShipButton.bg.on('inputOut', this._unhover, this);
    repairShipButton.start();
    
    buttons['attackShip'] = attackShipButton;
    buttons['shieldShip'] = shieldShipButton;
    buttons['repairShip'] = repairShipButton;
    
    containers[0].addPanel(attackShipButton)
    containers[1].addPanel(shieldShipButton);
    containers[2].addPanel(repairShipButton)

    this.invalidate();
};

SquadUpgradePane.prototype.destroy = function () {
    this.removeAll();

    this.game.removeListener('ship/player', this._player, this);
    this.game.removeListener('ship/player/squadSync', this._squadIcons, this);

    this.game.removeListener('hotkey/squad/closestHostile', this._hotkeySelect, this);
    this.game.removeListener('hotkey/squad/engageTarget', this._hotkeySelect, this);
    this.game.removeListener('hotkey/squad/regroup', this._hotkeySelect, this);
    this.game.removeListener('hotkey/squad/shieldUp', this._hotkeySelect, this);
    this.game.removeListener('hotkey/squad/repairOverdrive', this._hotkeySelect, this);
    this.game.removeListener('hotkey/squad/shieldDestination', this._shieldDestination, this);
};

module.exports = SquadUpgradePane;
