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

function SquadIndicatorPane(game, settings) {
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    height: 18,
    width: 120,
    padding: [13, 0, 0, 0],
    layout: {
      type: 'flow',
      ax: Layout.CENTER, 
      ay: Layout.BOTTOM,
      direction: Layout.HORIZONTAL, 
      gap: 4
    },
    bg: false,
    paymentTimerIndicator: {
      width: 80,
      height: 2,
      progress: {
        color: 0xffffff,
        fillAlpha: 0.7,
        blendMode: engine.BlendMode.ADD,
        modifier: {
          left: 0.0,
          top: 0.0,
          width: 1.0,
          height: 1.0
        }
      },
      bg: {
        fillAlpha: 0.24,
        color: 0xffffff
      }
    }
  });


  this.paymentTimerIndicator = new ProgressBar(this.game, this.settings.paymentTimerIndicator);

  this.paymentTimerIndicator.percentage('width', 0)
  
  // this.invalidate();

  this.addPanel(this.paymentTimerIndicator)

  this.ship_containers = [];
  this.count = 0;
  for(var i = 0; i < 4; i++){
    this.ship_containers.push(
      new Pane(game, {
          height: 34,
          width: 34,
          bg : false,
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

  this.paymentClock = 0;
  this.clockStarted = false;

  this.game.on('squad/construct', this._squadConstruct, this)
  this.game.on('squad/enable', this._squadEnable, this)
  this.game.on('squad/disable', this._squadDisable, this)
  this.game.on('game/loss', this.stop, this)
  this.exists = true;
};

SquadIndicatorPane.prototype = Object.create(Pane.prototype);
SquadIndicatorPane.prototype.constructor = SquadIndicatorPane;

SquadIndicatorPane.prototype.stop = function(){
  this.exists = false;
};

SquadIndicatorPane.prototype._payment = function(){
  if(this.exists){
    this.paymentTimerIndicator.change('width', this.paymentClock) 
  }
};

SquadIndicatorPane.prototype._squadConstruct = function(chassis){
  var game = this.game, 
      containers = this.ship_containers,
      ship, ship_negative;

  if(!this.clockStarted){
    this.clockStarted = true;
    this.game.clock.events.loop(1250, function(){
      this.paymentClock += (0.1/3);  
      if(this.paymentClock >= .99999999){
        this.paymentClock = 1;
        this._payment();
        this.paymentClock = 0;
        this.game.emit('squad/payment')
        return
      }
      this._payment()
    }, this)
  }

  ship = new Image(game, {
      key: 'texture-atlas',
      frame: chassis + '_upright.png',
      width: 34,
      height: 34,
      bg: {
        fillAlpha: 0.0,
        color: 0x000000
      }
    });
  ship_negative = new Image(game, {
      key: 'texture-atlas',
      frame: chassis + '_upright_black.png',
      width: 34,
      height: 34,
      bg: {
        fillAlpha: 0.0,
        color: 0x000000
      }
    });

  ship.id = chassis;
  ship.visible = false;

  this.ship_containers[this.count].addPanel(ship_negative);
  this.ship_containers[this.count].addPanel(ship);

  this.count++;

  this._squadEnable(chassis)

};

SquadIndicatorPane.prototype._squadEnable = function(chassis) {
  for(var i = 0; i < this.ship_containers.length; i++){
    var container = this.ship_containers[i];
    if(container.panels.length && container.panels[1].id && container.panels[1].id === chassis && container.panels[1].visible === false){
      container.panels[1].visible = true;
      return
    };
  };
};

SquadIndicatorPane.prototype._squadDisable = function(chassis) {
  for(var i = 0; i < this.panels.length; i++){
    if(this.panels[i].panels[1] && this.panels[i].panels[1].id === chassis && this.panels[i].panels[1].visible === true){
      this.panels[i].panels[1].visible = false;
      return;
    }
  };
};

SquadIndicatorPane.prototype._iconFadeOut = function(chassis) {
  //
};

SquadIndicatorPane.prototype._iconFadeIn = function(chassis) {
  //
};

module.exports = SquadIndicatorPane;
