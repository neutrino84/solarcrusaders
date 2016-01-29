
var engine = require('engine'),
    Layout = require('../Layout'),
    ContentPane = require('./ContentPane'),
    ItemPane = require('./ItemPane'),
    Pane = require('../components/Pane'),
    Button = require('../components/Button'),
    Class = engine.Class;

function CargoPane(game, settings) {
  ContentPane.call(this, game, 'cargo hold',
    Class.mixin(settings, {
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
        width: 35,
        height: 35,
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
        layout: {
          columns: 6
        }
      }
    })
  );

  this.pageButton1 = new Button(game, '1', this.settings.tab);
  this.pageButton1.disabled = true;
  this.pageButton1.stop();

  this.pageButton2 = new Button(game, '2', this.settings.tab);
  this.pageButton2.disabled = true;
  this.pageButton2.stop();

  this.itemPane = new ItemPane(game, this.settings.item);
  this.infoPane = new Pane(game, this.settings.info);

  this.addTab(Layout.NONE, this.pageButton1);
  this.addTab(Layout.NONE, this.pageButton2);

  this.addContent(Layout.STRETCH, this.infoPane);
  this.addContent(Layout.NONE, this.itemPane);
};

CargoPane.prototype = Object.create(ContentPane.prototype);
CargoPane.prototype.constructor = CargoPane;

CargoPane.prototype.start = function() {
  this.button.start();
  this.pageButton1.start();
  this.pageButton2.start();
};

CargoPane.prototype.stop = function() {
  this.button.stop();
  this.pageButton1.stop();
  this.pageButton2.stop();
};

module.exports = CargoPane;
