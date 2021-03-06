
var Tile = require('./Tile'),
    Tileset = require('./Tileset'),
    Class = require('../utils/Class');

var TilemapParser = {

  parse: function(game, key, mixin) {
    if(key === undefined) { return this.getEmptyData(); }
    if(mixin === undefined) { mixin = {}; }
    
    var map = game.cache.getTilemapData(key);
    if(map) {
      return this.parseTiledJSON(Class.mixin(mixin, map.data));
    } else {
      throw new Error('TilemapParser.parse - No map data found for key ' + key);
    }
  },

  getEmptyData: function(tileWidth, tileHeight, width, height) {
    var map = {};
        map.width = 0;
        map.height = 0;
        map.tileWidth = 0;
        map.tileHeight = 0;

    if(typeof tileWidth !== 'undefined' && tileWidth !== null) { map.tileWidth = tileWidth; }
    if(typeof tileHeight !== 'undefined' && tileHeight !== null) { map.tileHeight = tileHeight; }
    if(typeof width !== 'undefined' && width !== null) { map.width = width; }
    if(typeof height !== 'undefined' && height !== null) { map.height = height; }

    map.orientation = 'orthogonal';
    map.version = '1';
    map.properties = {};
    map.widthInPixels = 0;
    map.heightInPixels = 0;

    var layers = [];
    var layer = {
      name: 'layer',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      widthInPixels: 0,
      heightInPixels: 0,
      alpha: 1,
      visible: true,
      properties: {},
      indexes: [],
      callbacks: [],
      bodies: [],
      data: []
    };

    // fill with nulls?
    layers.push(layer);

    map.layers = layers;
    map.images = [];
    map.objects = {};
    map.collision = {};
    map.tilesets = [];
    map.tiles = [];

    return map;
  },

  parseTiledJSON: function(json) {
    if(json.orientation !== 'orthogonal') {
      console.warn('TilemapParser.parseTiledJSON - Only orthogonal map types are supported in this version of Phaser');
      return null;
    }

    // Map data will consist of: layers, objects, images, tilesets, sizes
    var map = {};
        map.width = json.width;
        map.height = json.height;
        map.tileWidth = json.tilewidth;
        map.tileHeight = json.tileheight;
        map.orientation = json.orientation;
        map.version = json.version;
        map.properties = json.properties;
        map.widthInPixels = map.width * map.tileWidth;
        map.heightInPixels = map.height * map.tileHeight;

    // Tile Layers
    var layers = [];
    for(var i = 0; i < json.layers.length; i++) {
      if(json.layers[i].type !== 'tilelayer') { continue; }

      // Base64 decode data if necessary
      // NOTE: uncompressed base64 only.
      var curl = json.layers[i];
      if(!curl.compression && curl.encoding && curl.encoding === 'base64') {
        var binaryString =  window.atob(curl.data),
            len = binaryString.length,
            bytes = new Array(len);

        // Interpret binaryString as an array of bytes representing
        // little-endian encoded uint32 values. 
        for(var j=0; j<len; j+=4) {
          bytes[j/4] = (binaryString.charCodeAt(j) |
            binaryString.charCodeAt(j+1) << 8 |
            binaryString.charCodeAt(j+2) << 16 |
            binaryString.charCodeAt(j+3) << 24) >>> 0;
        }
        curl.data = bytes;
      }

      var layer = {
        name: json.layers[i].name,
        x: json.layers[i].x,
        y: json.layers[i].y,
        width: json.layers[i].width,
        height: json.layers[i].height,
        widthInPixels: json.layers[i].width * json.tilewidth,
        heightInPixels: json.layers[i].height * json.tileheight,
        alpha: json.layers[i].opacity,
        visible: json.layers[i].visible,
        properties: {},
        indexes: [],
        callbacks: [],
        bodies: []
      };

      if(json.layers[i].properties) {
        layer.properties = json.layers[i].properties;
      }

      var x = 0;
      var row = [];
      var output = [];
      var rotation, flipped, flippedVal, gid;

      // Loop through the data field in the JSON.

      // This is an array containing the tile indexes, one after the other. -1 = no tile, everything else = the tile index (starting at 1 for Tiled, 0 for CSV)
      // If the map contains multiple tilesets then the indexes are relative to that which the set starts from.
      // Need to set which tileset in the cache = which tileset in the JSON, if you do this manually it means you can use the same map data but a new tileset.
      for(var t = 0, len = json.layers[i].data.length; t < len; t++) {
        rotation = 0;
        flipped = false;
        gid = json.layers[i].data[t];

        // If true the current tile is flipped or rotated (Tiled TMX format) 
        if(gid > 0x20000000) {
          flippedVal = 0;

          // FlippedX
          if(gid > 0x80000000) {
            gid -= 0x80000000;
            flippedVal += 4;
          }

          // FlippedY
          if(gid > 0x40000000) {
            gid -= 0x40000000;
            flippedVal += 2;
          }

          // FlippedAD
          if(gid > 0x20000000) {
            gid -= 0x20000000;
            flippedVal += 1;
          }
         
          switch (flippedVal) {
            case 5:
              rotation = Math.PI/2;
              break;
            case 6:
              rotation = Math.PI;
              break;
            case 3:
              rotation = 3*Math.PI/2;
              break;
            case 4:
              rotation = 0;
              flipped = true;
              break;
            case 7:
              rotation = Math.PI/2;
              flipped = true;
              break;
            case 2:
              rotation = Math.PI;
              flipped = true;
              break;
            case 1:
              rotation = 3*Math.PI/2;
              flipped = true;
              break;
          }
        }

        // index, x, y, width, height
        if(gid > 0) {
          row.push(new Tile(layer, gid, x, output.length, json.tilewidth, json.tileheight));
          row[row.length - 1].rotation = rotation;
          row[row.length - 1].flipped = flipped;
        } else {
          row.push(new Tile(layer, -1, x, output.length, json.tilewidth, json.tileheight));
        }

        x++;
        if(x === json.layers[i].width) {
          output.push(row);
          x = 0;
          row = [];
        }
      }

      layer.data = output;
      layers.push(layer);
    }

    map.layers = layers;

    // Images
    var images = [];
    for(var i = 0; i < json.layers.length; i++) {
      if(json.layers[i].type !== 'imagelayer') { continue; }

      var image = {
        name: json.layers[i].name,
        image: json.layers[i].image,
        x: json.layers[i].x,
        y: json.layers[i].y,
        alpha: json.layers[i].opacity,
        visible: json.layers[i].visible,
        properties: {}
      };

      if(json.layers[i].properties) {
        image.properties = json.layers[i].properties;
      }
      images.push(image);
    }

    map.images = images;

    // Tilesets & Image Collections
    var tilesets = [];
    var imagecollections = [];
    for(var i = 0; i < json.tilesets.length; i++) {
      // name, firstgid, width, height, margin, spacing, properties
      var set = json.tilesets[i];
      if(set.image) {
        var newSet = new Tileset(set.name, set.firstgid, set.tilewidth, set.tileheight, set.margin, set.spacing, set.properties);
        if(set.tileproperties) {
          newSet.tileProperties = set.tileproperties;
        }

        // For a normal sliced tileset the row/count/size information is computed when updated.
        // This is done (again) after the image is set.
        newSet.updateTileData(set.imagewidth, set.imageheight);
        tilesets.push(newSet);
      }
      // else {
      //  var newCollection = new Phaser.ImageCollection(set.name, set.firstgid, set.tilewidth, set.tileheight, set.margin, set.spacing, set.properties);
      //  for(var i in set.tiles) {
      //    var image = set.tiles[i].image;
      //    var gid = set.firstgid + parseInt(i, 10);
      //    newCollection.addImage(gid, image);
      //  }
      //  imagecollections.push(newCollection);
      // }
    }

    map.tilesets = tilesets;
    map.imagecollections = imagecollections;

    // Objects & Collision Data (polylines, etc)
    var objects = {};
    var collision = {};

    var slice = function(obj, fields) {
      var sliced = {};
      for(var k in fields) {
        var key = fields[k];
        if(typeof obj[key] !== 'undefined') {
          sliced[key] = obj[key];
        }
      }
      return sliced;
    }

    for(var i = 0; i < json.layers.length; i++) {
      if(json.layers[i].type !== 'objectgroup') { continue; }

      objects[json.layers[i].name] = [];
      collision[json.layers[i].name] = [];

      for(var v = 0, len = json.layers[i].objects.length; v < len; v++) {
        // Object Tiles
        if(json.layers[i].objects[v].gid) {
          var object = {
            gid: json.layers[i].objects[v].gid,
            name: json.layers[i].objects[v].name,
            type: json.layers[i].objects[v].hasOwnProperty("type") ? json.layers[i].objects[v].type : "",
            x: json.layers[i].objects[v].x,
            y: json.layers[i].objects[v].y,
            visible: json.layers[i].objects[v].visible,
            properties: json.layers[i].objects[v].properties
          };

          if(json.layers[i].objects[v].rotation) {
            object.rotation = json.layers[i].objects[v].rotation;
          }

          objects[json.layers[i].name].push(object);
        } else if(json.layers[i].objects[v].polyline) {
          var object = {
            name: json.layers[i].objects[v].name,
            type: json.layers[i].objects[v].type,
            x: json.layers[i].objects[v].x,
            y: json.layers[i].objects[v].y,
            width: json.layers[i].objects[v].width,
            height: json.layers[i].objects[v].height,
            visible: json.layers[i].objects[v].visible,
            properties: json.layers[i].objects[v].properties
          };

          if(json.layers[i].objects[v].rotation) {
            object.rotation = json.layers[i].objects[v].rotation;
          }

          object.polyline = [];

          // Parse the polyline into an array
          for(var p = 0; p < json.layers[i].objects[v].polyline.length; p++) {
            object.polyline.push([ json.layers[i].objects[v].polyline[p].x, json.layers[i].objects[v].polyline[p].y ]);
          }

          collision[json.layers[i].name].push(object);
          objects[json.layers[i].name].push(object);
        } else if(json.layers[i].objects[v].polygon) {
          // polygon
          var object = slice(json.layers[i].objects[v], ["name", "type", "x", "y", "visible", "rotation", "properties" ]);
              object.polygon = [];

          // Parse the polygon into an array
          for(var p = 0; p < json.layers[i].objects[v].polygon.length; p++) {
            object.polygon.push([ json.layers[i].objects[v].polygon[p].x, json.layers[i].objects[v].polygon[p].y ]);
          }
          objects[json.layers[i].name].push(object);
        } else if(json.layers[i].objects[v].ellipse) {
          // ellipse
          var object = slice(json.layers[i].objects[v], ["name", "type", "ellipse", "x", "y", "width", "height", "visible", "rotation", "properties" ]);
          objects[json.layers[i].name].push(object);
        } else {
          // otherwise it's a rectangle
      
          var object = slice(json.layers[i].objects[v], ["name", "type", "x", "y", "width", "height", "visible", "rotation", "properties" ]);
          object.rectangle = true;
          objects[json.layers[i].name].push(object);
        }
      }
    }

    map.objects = objects;
    map.collision = collision;
    map.tiles = [];

    // Finally lets build our super tileset index
    for(var i = 0; i < map.tilesets.length; i++) {
      var set = map.tilesets[i];

      var x = set.tileMargin;
      var y = set.tileMargin;

      var count = 0;
      var countX = 0;
      var countY = 0;
      for(var t = set.firstgid; t < set.firstgid + set.total; t++) {
        // Can add extra properties here as needed
        map.tiles[t] = [x, y, i];
        x += set.tileWidth + set.tileSpacing;

        count++;
        if(count === set.total) {
          break;
        }

        countX++;
        if(countX === set.columns) {
          x = set.tileMargin;
          y += set.tileHeight + set.tileSpacing;

          countX = 0;
          countY++;

          if(countY === set.rows) {
            break;
          }
        }
      }
    }

    // assign tile properties

    var layer;
    var tile;
    var sid;
    var set;
    // go through each of the map layers
    for(var i = 0; i < map.layers.length; i++) {
      layer = map.layers[i];

      // rows of tiles
      for(var j = 0; j < layer.data.length; j++) {
        row = layer.data[j];

        // individual tiles
        for(var k = 0; k < row.length; k++) {
          tile = row[k];

          if(tile.index < 0) {
            continue;
          }

          // find the relevant tileset
          sid = map.tiles[tile.index][2];
          set = map.tilesets[sid];

          // if that tile type has any properties, add them to the tile object
          if(set.tileProperties && set.tileProperties[tile.index - set.firstgid]) {
            tile.properties = Class.mixin(set.tileProperties[tile.index - set.firstgid], tile.properties);
          }
        }
      }
    }

    return map;
  }
};

module.exports = TilemapParser;
