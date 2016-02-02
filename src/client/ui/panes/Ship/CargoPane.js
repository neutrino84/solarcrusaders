
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
        padding: [5],
        layout: {
          gap: [5, 5],
          columns: 5,
          rows: 6
        },
        cell: {
          width: 40,
          height: 40
        }
      },
      bg: false
    })
  );
  
  this.pageButtons = [];
  this.pagePanes = [];

  this.infoPane = new Pane(game, this.settings.info);
  this.addContent(Layout.STRETCH, this.infoPane);

  // create
  this.create();
};

CargoPane.prototype = Object.create(ContentPane.prototype);
CargoPane.prototype.constructor = CargoPane;

CargoPane.prototype.reset = function(data) {
  var slice, page,
      items = data.items,
      layout = this.settings.item.layout,
      columns = layout.columns,
      rows = layout.rows,
      size = columns * rows,
      pages = global.Math.ceil(items.length / size);
  for(var i=0; i<pages; i++) {
    slice = items.slice(i, size);
    page = this.pagePanes[i];
    page.reset(items);
  }
};

CargoPane.prototype.start = function() {
  this.button.start();
  //.. start page buttons
};

CargoPane.prototype.stop = function() {
  this.button.stop();
  //.. stop page buttons
};

CargoPane.prototype.create = function() {
  var index = this.pagePanes.length+1;
      pagePane = new ItemPane(this.game, this.settings.item),
      pageButton = new Button(this.game, index.toString(), this.settings.tab);
      pageButton.disabled = true;
      pageButton.stop();

  //.. add button listener

  this.pageButtons.push(pageButton);
  this.pagePanes.push(pagePane);
  this.addContent(Layout.NONE, pagePane);
  this.addTab(Layout.NONE, pageButton);
};

CargoPane.prototype.page = function(page) {
  //.. show page
  //.. hide page
};

module.exports = CargoPane;
