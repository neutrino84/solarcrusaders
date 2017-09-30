
var Panel = require('../../Panel'),
    Pane = require('../../components/Pane'),
    Layout = require('../../Layout');

function Shipyard(game) {
  console.log('got to shipyard constructor')
  Pane.call(this, game, {
    constraint: Layout.CENTER,
    padding: [100],
    layout: {
      type: 'stack'
    }
  });

  // this.bg = new Pane(this.game, {
  //   padding: [25],
  //   layout: {
  //     type: 'list',
  //     columns: 10,
  //     gap: [2, 2]
  //   },
  //   bg: {
  //     fillAlpha: 0.1,
  //     color: 0x000000
  //   }
  // });

  // for(var i=0; i<32; i++) {
  //   var pane = new Pane(this.game, {
  //     width: 64,
  //     height: 64,
  //     layout: {
  //       type: 'stack'
  //     },
  //     bg: {
  //       fillAlpha: 0.4,
  //       color: 0xFFFFFF
  //     }
  //   })
  //   this.bg.addPanel(pane);
  // }


  // this.addPanel(this.bg);
};

Shipyard.prototype = Object.create(Pane.prototype);
Shipyard.prototype.constructor = Shipyard;

Shipyard.prototype.create = function() {
};

Shipyard.prototype.show = function() {

};

Shipyard.prototype.hide = function() {

};

module.exports = Shipyard;
