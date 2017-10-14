var pixi = require('pixi'),
    Loader = require('./Loader'),
    Frame = require('../animation/Frame'),
    FrameData = require('../animation/FrameData'),
    AnimationParser = require('../animation/AnimationParser'),
    Class = require('../utils/Class');

function Cache(game) {
  this.game = game;

  this._cache = {
    canvas: {},
    image: {},
    texture: {},
    sound: {},
    video: {},
    text: {},
    json: {},
    xml: {},
    physics: {},
    tilemap: {},
    binary: {},
    bitmapData: {},
    bitmapFont: {},
    shader: {},
    renderTexture: {}
  };

  this._cacheMap = [];
  this._cacheMap[Cache.CANVAS] = this._cache.canvas;
  this._cacheMap[Cache.IMAGE] = this._cache.image;
  this._cacheMap[Cache.TEXTURE] = this._cache.texture;
  this._cacheMap[Cache.SOUND] = this._cache.sound;
  this._cacheMap[Cache.TEXT] = this._cache.text;
  this._cacheMap[Cache.PHYSICS] = this._cache.physics;
  this._cacheMap[Cache.TILEMAP] = this._cache.tilemap;
  this._cacheMap[Cache.BINARY] = this._cache.binary;
  this._cacheMap[Cache.BITMAPDATA] = this._cache.bitmapData;
  this._cacheMap[Cache.BITMAPFONT] = this._cache.bitmapFont;
  this._cacheMap[Cache.JSON] = this._cache.json;
  this._cacheMap[Cache.XML] = this._cache.xml;
  this._cacheMap[Cache.VIDEO] = this._cache.video;
  this._cacheMap[Cache.SHADER] = this._cache.shader;
  this._cacheMap[Cache.RENDER_TEXTURE] = this._cache.renderTexture;

  this.addDefaultImage();
  this.addDefaultTexture();
  this.addMissingImage();
};

Cache.CANVAS = 1;
Cache.IMAGE = 2;
Cache.TEXTURE = 3;
Cache.SOUND = 4;
Cache.TEXT = 5;
Cache.PHYSICS = 6;
Cache.TILEMAP = 7;
Cache.BINARY = 8;
Cache.BITMAPDATA = 9;
Cache.BITMAPFONT = 10;
Cache.JSON = 11;
Cache.XML = 12;
Cache.VIDEO = 13;
Cache.SHADER = 14;
Cache.RENDER_TEXTURE = 15;

Cache.prototype = {
  addCanvas: function(key, canvas, context) {
    if(context === undefined) { context = canvas.getContext('2d'); }
    this._cache.canvas[key] = { canvas: canvas, context: context };
  },

  addImage: function(key, url, data) {
    var cache = this._cache,
        resolution = pixi.utils.getResolutionOfUrl(url),
        scale = pixi.SCALE_MODES.LINEAR,
        baseTexture;

    if(this.checkImageKey(key)) {
      this.removeImage(key);
    }

    // create base texture
    baseTexture = new pixi.BaseTexture(data, scale, resolution);
    baseTexture.key = key;

    cache.image[key] = {
      key: key,
      url: url,
      data: data,
      base: baseTexture,
      frame: new Frame(0, 0, 0, data.width, data.height, key),
      frameData: new FrameData()
    };

    // add to PIXI cache
    pixi.BaseTexture.addToCache(baseTexture, key);
  },

  addDefaultImage: function() {
    var img = new Image();
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgAQMAAABJtOi3AAAAA1BMVEX///+nxBvIAAAAAXRSTlMAQObYZgAAABVJREFUeF7NwIEAAAAAgKD9qdeocAMAoAABm3DkcAAAAABJRU5ErkJggg==";
    this.addImage('__default', null, img);
  },

  addMissingImage: function() {
    var img = new Image();
        img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAJ9JREFUeNq01ssOwyAMRFG46v//Mt1ESmgh+DFmE2GPOBARKb2NVjo+17PXLD8a1+pl5+A+wSgFygymWYHBb0FtsKhJDdZlncG2IzJ4ayoMDv20wTmSMzClEgbWYNTAkQ0Z+OJ+A/eWnAaR9+oxCF4Os0H8htsMUp+pwcgBBiMNnAwF8GqIgL2hAzaGFFgZauDPKABmowZ4GL369/0rwACp2yA/ttmvsQAAAABJRU5ErkJggg==";
    this.addImage('__missing', null, img);
  },

  addDefaultTexture: function() {
    var base = this.getBaseTexture('__default'),
        texture = new pixi.Texture(base);
    this.addTexture('__default', texture);
  },

  addSound: function(key, url, data) {
    this._cache.sound[key] = {
      url: url,
      data: data
    };
  },

  addText: function(key, url, data) {
    this._cache.text[key] = { url: url, data: data };
  },

  addTilemap: function(key, url, mapData) {
    this._cache.tilemap[key] = { url: url, data: mapData };
  },

  addBinary: function(key, binaryData) {
    this._cache.binary[key] = binaryData;
  },

  addBitmapData: function(key, bitmapData, frameData) {
    bitmapData.key = key;
    if(frameData === undefined) {
      frameData = new FrameData();
      frameData.addFrame(bitmapData.textureFrame);
    }
    this._cache.bitmapData[key] = { data: bitmapData, frameData: frameData };
    return bitmapData;
  },

  addJSON: function(key, url, data) {
    this._cache.json[key] = { url: url, data: data };
  },

  addXML: function(key, url, data) {
    this._cache.xml[key] = { url: url, data: data };
  },

  addShader: function(key, url, data) {
    this._cache.shader[key] = { url: url, data: data };
  },

  addRenderTexture: function(key, texture) {
    this._cache.renderTexture[key] = { texture: texture, frame: new Frame(0, 0, 0, texture.width, texture.height, '', '') };
  },

  addTexture: function(key, texture) {
    this._cache.texture[key] = { texture: texture };
  },

  addSpriteSheet: function(key, url, data, frameWidth, frameHeight, frameMax, margin, spacing) {
    if(frameMax === undefined) { frameMax = -1; }
    if(margin === undefined) { margin = 0; }
    if(spacing === undefined) { spacing = 0; }

    var obj = {
      key: key,
      url: url,
      data: data,
      frameWidth: frameWidth,
      frameHeight: frameHeight,
      margin: margin,
      spacing: spacing,
      base: new pixi.BaseTexture(data),
      frameData: AnimationParser.spriteSheet(this.game, data, frameWidth, frameHeight, frameMax, margin, spacing)
    };

    this._cache.image[key] = obj;
  },

  addTextureAtlas: function(key, url, data, atlasData, format) {
    var cache = this._cache,
        resolution = pixi.utils.getResolutionOfUrl(url),
        scale = pixi.SCALE_MODES.LINEAR,
        atlas = {
          key: key,
          url: url,
          data: data,
          base: new pixi.BaseTexture(data, scale, resolution)
        };
    if(Array.isArray(atlasData.frames)) {
      atlas.frameData = AnimationParser.JSONData(this.game, atlasData, key);
    } else {
      atlas.frameData = AnimationParser.JSONDataHash(this.game, atlasData, key);
    }
    cache.image[key] = atlas;
  },

  checkKey: function(cache, key) {
    if(this._cacheMap[cache][key]) {
      return true;
    }
    return false;
  },

  checkCanvasKey: function(key) {
    return this.checkKey(Cache.CANVAS, key);
  },

  checkImageKey: function(key) {
    return this.checkKey(Cache.IMAGE, key);
  },

  checkTextureKey: function(key) {
    return this.checkKey(Cache.TEXTURE, key);
  },

  checkSoundKey: function(key) {
    return this.checkKey(Cache.SOUND, key);
  },

  checkTextKey: function(key) {
    return this.checkKey(Cache.TEXT, key);
  },

  checkTilemapKey: function(key) {
    return this.checkKey(Cache.TILEMAP, key);
  },

  checkBinaryKey: function(key) {
    return this.checkKey(Cache.BINARY, key);
  },

  checkBitmapDataKey: function(key) {
    return this.checkKey(Cache.BITMAPDATA, key);
  },

  checkJSONKey: function(key) {
    return this.checkKey(Cache.JSON, key);
  },

  checkXMLKey: function(key) {
    return this.checkKey(Cache.XML, key);
  },

  checkShaderKey: function(key) {
    return this.checkKey(Cache.SHADER, key);
  },

  checkRenderTextureKey: function(key) {
    return this.checkKey(Cache.RENDER_TEXTURE, key);
  },

  getItem: function(key, cache, property) {
    
    if(!this.checkKey(cache, key)) {
      console.warn('Cache: Key "' + key + '" not found in Cache.');
    } else {
      if(property === undefined) {
        return this._cacheMap[cache][key];
      } else {
        return this._cacheMap[cache][key][property];
      }
    }
    return null;
  },

  getCanvas: function(key) {
    return this.getItem(key, Cache.CANVAS, 'canvas');
  },

  getTextureFrame: function(key) {
    return this.getItem(key, Cache.TEXTURE, 'frame');
  },

  getSound: function(key) {
    return this.getItem(key, Cache.SOUND);
  },

  getSoundData: function(key) {
    return this.getItem(key, Cache.SOUND, 'data');
  },

  getText: function(key) {
    return this.getItem(key, Cache.TEXT, 'data');
  },

  getTilemapData: function(key) {
    return this.getItem(key, Cache.TILEMAP);
  },

  getBinary: function(key) {
    return this.getItem(key, Cache.BINARY);
  },

  getBitmapData: function(key) {
    return this.getItem(key, Cache.BITMAPDATA, 'data');
  },

  getJSON: function(key, clone) {
    var data = this.getItem(key, Cache.JSON, 'data');
    if(data) {
      if(clone) {
        return Class.extend(true, data);
      } else {
        return data;
      }
    } else {
      return null;
    }
  },

  getXML: function(key) {
    return this.getItem(key, Cache.XML, 'data');
  },

  getShader: function(key) {
    return this.getItem(key, Cache.SHADER, 'data');
  },

  getRenderTexture: function(key) {
    return this.getItem(key, Cache.RENDER_TEXTURE);
  },

  getImage: function(key) {
    if(key === undefined || key === null) { key = '__default'; }
    var img = this.getItem(key, Cache.IMAGE);
    if(img === null) {
      img = this.getItem('__missing', Cache.IMAGE);
    }
    return img.data;
  },

  getBaseTexture: function(key, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    return this.getItem(key, cache, 'base');
  },

  getFrame: function(key, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    return this.getItem(key, cache, 'frame');
  },

  getFrameData: function(key, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    return this.getItem(key, cache, 'frameData');
  },

  updateFrameData: function(key, frameData, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    if(this._cacheMap[cache][key]) {
      this._cacheMap[cache][key].frameData = frameData;
    }
  },

  getFrameCount: function(key, cache) {
    var data = this.getFrameData(key, cache);
    if(data) {
      return data.total;
    } else {
      return 0;
    }
  },

  getFrameByIndex: function(key, index, cache) {
    var data = this.getFrameData(key, cache);
    if(data) {
      return data.getFrame(index);
    } else {
      return null;
    }
  },

  getFrameByName: function(key, name, cache) {
    var data = this.getFrameData(key, cache);
    if(data) {
        return data.getFrameByName(name);
    } else {
        return null;
    }
  },

  getKeys: function(cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    var out = [];
    if(this._cacheMap[cache]) {
      for(var key in this._cacheMap[cache]) {
        if(key !== '__default' && key !== '__missing') {
          out.push(key);
        }
      }
    }
    return out;
  },

  removeCanvas: function(key) {
    delete this._cache.canvas[key];
  },

  removeImage: function(key) {
    var img = this._cache.image[key];
        img.base.destroy();
        img.framedata.destroy();
    delete this._cache.image[key];
  },

  removeSound: function(key) {
    delete this._cache.sound[key];
  },

  removeText: function(key) {
    delete this._cache.text[key];
  },

  removeTilemap: function(key) {
    delete this._cache.tilemap[key];
  },

  removeBinary: function(key) {
    delete this._cache.binary[key];
  },

  removeBitmapData: function(key) {
    delete this._cache.bitmapData[key];
  },

  removeJSON: function(key) {
    delete this._cache.json[key];
  },

  removeXML: function(key) {
    delete this._cache.xml[key];
  },

  removeShader: function(key) {
    delete this._cache.shader[key];
  },

  removeRenderTexture: function(key) {
    delete this._cache.renderTexture[key];
  },

  removeSpriteSheet: function(key) {
    delete this._cache.spriteSheet[key];
  },

  removeTextureAtlas: function (key) {
    delete this._cache.atlas[key];
  },

  destroy: function() {
    for(var i = 0; i < this._cacheMap.length; i++) {
      var cache = this._cacheMap[i];

      for(var key in cache) {
        if(key !== '__default' && key !== '__missing') {
          if(cache[key]['destroy']) {
            cache[key].destroy();
          }
          delete cache[key];
        }
      }
    }
  }

};

Cache.prototype.constructor = Cache;

module.exports = Cache;
