
var engine = require('engine'),
    Layout = require('../../Layout'),
    ContentPane = require('../ContentPane'),
    ItemPane = require('../ItemPane'),
    Pane = require('../../components/Pane'),
    Button = require('../../components/Button'),
    Class = engine.Class;

function CargoPane(game, settings) {
  ContentPane.call(this, game, 'cargo hold',
    Class.mixin(settings, {
      content: {
        padding: [1]//,
        // layout: {
        //   gap: 0
        // }
      },
      tab: {
        padding: [0],
        bg: {
          fillAlpha: 1.0,
          borderSize: 0.0,
          radius: 0.0
        },
        label: {
          padding: [5, 8, 6, 8],
          border: [0],
          text: {
            fontName: 'small'
          },
          bg: {
            highlight: false,
            borderSize: 0.0,
            fillAlpha: 0.0,
            radius: 0.0
          }
        }
      },
      info: {
        width: 32,
        height: 32,
        padding: [0],
        // layout: {
        //   type: 'percent',
        //   direction: Layout.HORIZONTAL,
        //   gap: 1,
        //   stretch: false
        // },
        bg: {
          fillAlpha: 0.5,
          color: 0x000000
        }
      },
      item: {
        padding: [1],
        layout: {
          gap: [1, 1],
          columns: 6,
          rows: 8
        },
        cell: {
          width: 40,
          height: 40
        }
      },
      bg: false
    })
  );
  
  this.pagePanes = [];

  // this.infoPane = new Pane(game, this.settings.info);
  // this.addContent(Layout.STRETCH, this.infoPane);

  this.content.bg.inputEnabled = true;
  this.content.bg.input.priorityID = 4;
  this.content.bg.input.stop();
  // this.content.bg.input.enableDrop();
  this.content.bg.on('inputDropped', this._itemDropped, this);
};

CargoPane.prototype = Object.create(ContentPane.prototype);
CargoPane.prototype.constructor = CargoPane;

CargoPane.prototype.reset = function(cargo) {
  var page = this.pagePanes[0];
      page.reset(cargo);
};

CargoPane.prototype.start = function() {
  this.button.start();
  this.content.bg.input.start();
};

CargoPane.prototype.stop = function() {
  this.button.stop();
  this.content.bg.input.stop();
};

CargoPane.prototype.create = function(data) {
  var index = this.pagePanes.length+1;
      pagePane = new ItemPane(this.game, this.settings.item);

  this.pagePanes.push(pagePane);
  this.reset(data.cargo);

  this.addContent(Layout.NONE, pagePane);
};

CargoPane.prototype._itemDropped = function(item) {
  //..
};

module.exports = CargoPane;
