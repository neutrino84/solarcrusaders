
var engine = require('engine'),
    Panel = require('../Panel'),
    TilemapView = require('../views/TilemapView'),
    ImageView = require('../views/ImageView'),
    BackgroundView = require('../views/BackgroundView'),
    Class = engine.Class;//,

    // Room = require('../../objects/structure/Room'),
    // Door = require('../../objects/structure/Door'),
    // Crew = require('../../objects/structure/Crew'),
    // System = require('../../objects/structure/System');

function Tilemap(game, key, settings) {
  Panel.call(this, game, this);

  this.layers = {};
  this.rooms = [];

  if(key) {
    this.key = key;
    this.config = game.cache.getJSON('ship-configuration', false)[key];
    this.tilemap = new engine.Tilemap(game, 'ship-tilemap', this.config.tilemap);
    this.pathing = new engine.TilemapPathing(this.tilemap, 'wall', 'wall');
    this.pathing.updateMap();
  } else {
    this.tilemap = new engine.Tilemap(game, 'ship-tilemap');
  }

  this.settings = Class.mixin(settings, {
    padding: [0],
    border: [0],
    bg: {
      fillAlpha: 0.1,
      borderSize: 0.0
    }
  });

  this.setPadding.apply(this, this.settings.padding);
  this.setBorder.apply(this, this.settings.border);

  this.bg = new BackgroundView(game, this.settings.bg);
  this.bg.inputEnabled = true;
  this.bg.input.priorityID = 2;
  this.addView(this.bg);

  this.load();
};

Tilemap.prototype = Object.create(Panel.prototype);
Tilemap.prototype.constructor = Tilemap;

Tilemap.prototype.load = function() {
  this.createLayers();
  this.createDoors();
  this.createCrew();
  this.createRooms();
};

Tilemap.prototype.start = function() {
  var room, rooms = this.rooms;
  for(var r in rooms) {
    room = rooms[r];
    room.inputEnabled = true;
    room.input.priorityID = 3;
  }
};

Tilemap.prototype.stop = function() {
  var room, rooms = this.rooms;
  for(var r in rooms) {
    room = rooms[r];
    room.inputEnabled = false;
  }
};

Tilemap.prototype.target = function(displayObject) {
  this._target && (this._target.renderable = false);
  this._target = displayObject;
  this._target.renderable = true;
  this._target.alpha = 1.0;
  this._targetTween && this._targetTween.stop();
  this._targetTween = this.game.tweens.create(displayObject);
  this._targetTween.to({ alpha: 0}, 250, engine.Easing.Default, true, 0, -1, true);
};

Tilemap.prototype.createImages = function() {
  var key,
      images = this.tilemap.images;
  for(var i in images) {
    if(images[i].name === 'outline') { continue; }

    key = images[i].name;
    this.layers[key] = new ImageView(this.game, key);
    this.layers[key].alpha = images[i].alpha;
    this.addView(this.layers[key]);
  }
};

Tilemap.prototype.createLayers = function() {
  var key,
      tilemap = this.tilemap,
      w = tilemap.widthInPixels,
      h = tilemap.heightInPixels,
      layers = tilemap.layers;
  for(var l in layers) {
    key = layers[l].name;

    this.tilemap.addTilesetImage(key);
    
    this.layers[key] = new TilemapView(this.game, tilemap, l, w, h);
    this.layers[key].alpha = layers[l].alpha;
    
    this.addView(this.layers[key]);
    
    // add outline
    if(this.key && key === 'grid') {
      this.layers['outline'] = new ImageView(this.game, this.key + '-outline');
      this.layers['outline'].alpha = 0.25;
      this.addView(this.layers['outline']);
    }
  };
};

Tilemap.prototype.createDoors = function(data) {
  var door, frame, sprite,
      tilemap = this.tilemap,
      doors = tilemap.objects.doors;
  for(var d in doors) {
    door = doors[d];
    frame = global.parseInt(door.properties.frame, 10);
    
    sprite = new engine.Sprite(game, 'door', frame);
    sprite.position.set(door.x, door.y);

    this.add(sprite);
  }
};

Tilemap.prototype.createCrew = function(data) {
  var crew, frame, sprite,
      tilemap = this.tilemap,
      members = tilemap.objects.crew;
  for(var c in members) {
    crew = members[c];
    
    sprite = new engine.Sprite(game, 'crew');
    sprite.pivot.set(8, 8);
    sprite.rotation = engine.Math.degToRad(crew.rotation);
    sprite.animations.add('work', [0,1,2,3,4,5], 6, true);
    sprite.animations.play('work');
    sprite.position.set(crew.x - 8, crew.y + 8);

    this.add(sprite);
  }
};

Tilemap.prototype.createRooms = function(data) {
  var r, room, frame, sprite, prop,
      tilemap = this.tilemap,
      rooms = tilemap.objects.rooms,
      settings = this.settings;
  for(var r in rooms) {
    room = rooms[r];
    prop = room.properties;
  
    r = new engine.Graphics(this.game);
    r.renderable = false;
    r.data = prop;

    r.lineStyle(2, settings.player ? 0x6699cc : 0xff6666, 1.0);
    r.beginFill(settings.player ? 0x6699cc : 0xff6666, 0.2);
    r.drawRect(room.x, room.y, room.width, room.height);
    r.endFill();

    r.on('inputOver', this._inputOver, this);
    r.on('inputOut', this._inputOut, this);
    r.on('inputDown', this._inputDown, this);

    this.add(r);
    this.rooms.push(r);
  }
};

Tilemap.prototype.calcPreferredSize = function(target) {
  return { width: this.tilemap.widthInPixels, height: this.tilemap.heightInPixels };
};

Tilemap.prototype.doLayout = function() {
  var sprite, sprites = this.layers;
  for(var s in sprites) {
    sprite = sprites[s];
    sprite.position.set(this.left, this.top);
  }
};

Tilemap.prototype._inputOver = function(displayObject) {
  if(this._target == displayObject) { return; }
  displayObject.renderable = true;
  this.emit('roomOver', displayObject);
}

Tilemap.prototype._inputOut = function(displayObject) {
  if(this._target == displayObject) { return; }
  displayObject.renderable = false;
  this.emit('roomOut', displayObject);
};

Tilemap.prototype._inputDown = function(displayObject, pointer) {
  if(this._target == displayObject) { return; }
  if(pointer.button === engine.Mouse.RIGHT_BUTTON) {
    this.emit('roomDown', displayObject);
  }
};

module.exports = Tilemap;
