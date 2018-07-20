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
    ProgressBar = require('../../components/ProgressBar'),
    Image = require('../../components/Image'),
    Tooltip = require('../../components/Tooltip'),
    Class = engine.Class;

function SquadUpgradePane(game, settings) {
    Pane.call(this, game, {
        constraint: Layout.LEFT,
        height: 40,
        width: 200,
        margin: [0, 0, 0, 0],
        padding: [0, 0, 0, 0],
        layout: {
            type: 'flow',
            ax: Layout.LEFT,
            ay: Layout.BOTTOM,
            direction: Layout.HORIZONTAL,
            // gap: 4
        },
        bg: {
            color: 0xffffff,
            fillAlpha: 0.0,
            borderSize: 1.0,
            borderColor: 0xff0000,
            borderAlpha: 0.0
        }, 
    });

    this.buttonContainers = [];
    this.ship_containers = [];
    this.buttons = {};
    this.socket = game.net.socket;

    // generate containers
    // for (var i = 0; i < 6; i++) {
    //     this.buttonContainers.push(
    //         new Pane(this.game, {
    //             constraint: Layout.CENTER,
    //             width: 34,
    //             height: 34,
    //             layout: {
    //                 type: 'stack'
    //             },
    //             bg: {
    //                 fillAlpha: 0.4,
    //                 color: 0x000000
    //             }
    //         })
    //     );
    //     this.addPanel(this.containers[i]);
    // };

    for (var i = 0; i < 3; i++) {
        this.ship_containers.push(
            new Pane(game, {
                height: 34,
                width: 34,
                bg: {
                    color: 0x000000,
                    fillAlpha: 0.1,
                    borderSize: 1,
                    borderColor: 0xffff00,
                    borderAlpha: 0.5
                },
                layout: {
                    type: 'stack',
                    ax: Layout.CENTER,
                    ay: Layout.CENTER,
                    direction: Layout.HORIZONTAL,
                    gap: 0
                },
            })
        );
        this.addPanel(this.ship_containers[i])
    };

    // this.game.on('squad/construct', this._squadConstruct, this)
    // this.game.on('squad/enable', this._squadEnable, this)
    // this.game.on('squad/disable', this._squadDisable, this)
    this.game.on('ship/player', function(){
        this._squadConstruct('squad-attack')
        this._squadConstruct('squad-shield')
        this._squadConstruct('squad-repair')
        // this._squadConstruct('squad-attack')
    }, this)
    this.exists = true;
    this.count = 0;
};

SquadUpgradePane.prototype = Object.create(Pane.prototype);
SquadUpgradePane.prototype.constructor = SquadUpgradePane;

SquadUpgradePane.prototype.stop = function () {
    this.exists = false;
};

SquadUpgradePane.prototype._payment = function () {
    if (this.exists) {
        this.paymentTimerIndicator.change('width', this.paymentClock)
    }
};

SquadUpgradePane.prototype._squadConstruct = function (chassis) {
    var game = this.game,
        containers = this.ship_containers,
        ship, ship_negative;
    var button;
    // ship = new Image(game, {
    //     key: 'texture-atlas',
    //     frame: chassis + '_upright.png',
    //     width: 34,
    //     height: 34,
    //     bg: {
    //         fillAlpha: 0.0,
    //         color: 0x000000
    //     }
    // });
    // ship_negative = new Image(game, {
    //     key: 'texture-atlas',
    //     frame: chassis + '_upright_black.png',
    //     width: 34,
    //     height: 34,
    //     bg: {
    //         fillAlpha: 0.0,
    //         color: 0x000000
    //     }
    // });
    
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
            },
            borderSize: 0.2,
            borderColor: 0xffff00,
            borderAlpha: 0.5
        },
        icon: {
            key: 'texture-atlas',
            frame: chassis + '_upright.png',
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





    // ship.id = chassis;
    // ship.visible = false;

    this.ship_containers[this.count].addPanel(button);
    // this.ship_containers[this.count].addPanel(ship);

    this.count++;

    // this._squadEnable(chassis)

};

SquadUpgradePane.prototype._squadEnable = function (chassis) {
    var button;
    console.log('upgrade squad enable');
    
    // this._squadConstruct('squad-attack')
    // this._squadConstruct('squad-attack')
    // this._squadConstruct('squad-attack')
    // button = new ButtonIcon(game, {
    //     padding: [0, 0, 2, 0],
    //     bg: {
    //         color: 0x009999,
    //         alpha: {
    //             enabled: 0.5,
    //             disabled: 1.0,
    //             over: 0.85,
    //             down: 0.85,
    //             up: 0.85
    //         }
    //     },
    //     icon: {
    //         key: 'texture-atlas',
    //         frame: 'enhancement-' + enhancement + '.png',
    //         width: 34,
    //         height: 34,
    //         bg: {
    //             fillAlpha: 1.0,
    //             color: 0x000000
    //         },
    //         alpha: {
    //             enabled: 1.0,
    //             disabled: 0.5,
    //             over: 1.0,
    //             down: 1.0,
    //             up: 0.9
    //         },
    //         tint: {
    //             enabled: 0xFFFFFF,
    //             disabled: 0xFF0000,
    //             over: 0xFFFFFF,
    //             down: 0xFFFFFF,
    //             up: 0xFFFFFF
    //         }
    //     }
    // });





    for (var i = 0; i < this.ship_containers.length; i++) {
        var container = this.ship_containers[i];
        if (container.panels.length && container.panels[1].id && container.panels[1].id === chassis && container.panels[1].visible === false) {
            console.log('in squadEnable populate');
            
            container.panels[1].visible = true;
            return
        };
    };
};

SquadUpgradePane.prototype._squadDisable = function (chassis) {
    for (var i = 0; i < this.panels.length; i++) {
        if (this.panels[i].panels[1] && this.panels[i].panels[1].id === chassis && this.panels[i].panels[1].visible === true) {
            this.panels[i].panels[1].visible = false;
            return;
        }
    };
};

SquadUpgradePane.prototype.destroy = function () {

    this.ship_containers = [];
    this.count = 0;

    this.game.removeListener('squad/construct', this._squadConstruct, this)
    this.game.removeListener('squad/enable', this._squadEnable, this)
    this.game.removeListener('squad/disable', this._squadDisable, this)

    this.removeAll();
};

SquadUpgradePane.prototype._iconFadeOut = function (chassis) {
    //
};

SquadUpgradePane.prototype._iconFadeIn = function (chassis) {
    //
};

module.exports = SquadUpgradePane;
