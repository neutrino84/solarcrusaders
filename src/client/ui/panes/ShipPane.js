
var engine = require('engine'),
    Layout = require('../Layout'),
    ContentPane = require('./ContentPane'),
    Tilemap = require('../components/Tilemap');//,
    // GlitchFilter = require('../../fx/filters/GlitchFilter');

function ShipPane(game, string, settings) {
  ContentPane.call(this, game, string, settings);

  // glitch filter
  // this.glitchFilter = new GlitchFilter(game, 256, 128);

  // ship outline
  this.shipOutline = new engine.Sprite(game, 'ship-outline');
  this.shipOutline.position.set(6, 21);
  this.shipOutline.blendMode = engine.BlendMode.ADD;
  this.shipOutline.alpha = 0.8;
  // this.shipOutline.filters = [this.glitchFilter];
  this.addChild(this.shipOutline);

  // create tilemap component
  this.tilemapComponent = new Tilemap(game, 'ship', ['grid', 'deck', 'wall']);

  this.crew1 = new engine.Sprite(game, 'crew');
  this.crew1.animations.add('work', [0,1,2,3,4,5], 6, true);
  this.crew1.animations.play('work');
  this.crew1.pivot.set(8,8);
  this.crew1.position.set(10 * 16 + 6, 6 * 16 + 8);
  this.crew1.rotation = -global.Math.PI / 2;

  this.crew2 = new engine.Sprite(game, 'crew');
  this.crew2.animations.add('work', [2,3,4,5,0,1], 6, true);
  this.crew2.animations.play('work');
  this.crew2.pivot.set(8,8);
  this.crew2.position.set(9 * 16 + 8, 6 * 16 + 7);
  
  this.crew3 = new engine.Sprite(game, 'crew');
  this.crew3.animations.add('work', [2,5,3,4,1,0], 6, true);
  this.crew3.animations.play('work');
  this.crew3.pivot.set(8,8);
  this.crew3.position.set(5 * 16 + 8, 6 * 16 + 7);

  this.tilemapComponent.addChild(this.crew1);
  this.tilemapComponent.addChild(this.crew2);
  this.tilemapComponent.addChild(this.crew3);

  // create doors
  var door, doors = [
    [5, 5, 0], [7, 5, 0], [8, 6, 0], [10, 5, 0],
    [5, 3, 1], [6, 4, 1], [6, 6, 1], [5, 7, 1],
    [4, 5, 2], [4, 6, 2]
  ];
  for(var d in doors) {
    door = new engine.Sprite(game, 'door', doors[d][2]);
    if(doors[d][2] === 3) {
      door.pivot.set(0,-7);
    } else if(doors[d][2] === 2) {
      door.pivot.set(9,0);
    } else if(doors[d][2] === 1) {
      door.pivot.set(0,-8);
    } else {
      door.pivot.set(8,0);
    }
    door.position.set(doors[d][0] * 16, doors[d][1] * 16);
    this.tilemapComponent.addChild(door);
  }
  
  // add tilemap
  this.addContent(Layout.STRETCH, this.tilemapComponent);
};

ShipPane.prototype = Object.create(ContentPane.prototype);
ShipPane.prototype.constructor = ShipPane;

module.exports = ShipPane;
