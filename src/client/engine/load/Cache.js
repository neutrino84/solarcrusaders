var pixi = require('pixi'),
    Loader = require('./Loader'),
    Frame = require('../animation/Frame'),
    FrameData = require('../animation/FrameData'),
    AnimationParser = require('../animation/AnimationParser'),
    Class = require('../utils/Class');

function Cache(game) {
  this.game = game;

  this.autoResolveURL = false;

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

  this._urlMap = {};
  this._urlResolver = new Image();
  this._urlTemp = null;

  // this.onSoundUnlock = new Phaser.Signal();

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
    if(this.checkImageKey(key)) {
      this.removeImage(key);
    }

    var baseTexture = new pixi.BaseTexture(data),
        img = {
          key: key,
          url: url,
          data: data,
          base: baseTexture,
          frame: new Frame(0, 0, 0, data.width, data.height, key),
          frameData: new FrameData()
        };

    img.frameData.addFrame(new Frame(0, 0, 0, data.width, data.height, url));

    this._cache.image[key] = img;
    this._resolveURL(url, img);

    // add to PIXI cache
    pixi.utils.BaseTextureCache[key] = baseTexture;

    // if there is an @2x at the end of the url we are 
    // going to assume its a highres image
    baseTexture.resolution = pixi.utils.getResolutionOfUrl(url);
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
    var base = this.getImage('__default', true).base,
        texture = new pixi.Texture(base);
    this.addTexture('__default', texture);
  },

  addSound: function(key, url, data, webAudio, audioTag) {
    if(webAudio === undefined) { webAudio = true; audioTag = false; }
    if(audioTag === undefined) { webAudio = false; audioTag = true; }

    var decoded = false;

    if(audioTag) {
      decoded = true;
    }

    this._cache.sound[key] = {
      url: url,
      data: data,
      isDecoding: false,
      decoded: decoded,
      webAudio: webAudio,
      audioTag: audioTag,
      locked: this.game.sound.touchLocked
    };

    this._resolveURL(url, this._cache.sound[key]);
  },

  addText: function(key, url, data) {
    this._cache.text[key] = { url: url, data: data };
    this._resolveURL(url, this._cache.text[key]);
  },

  addTilemap: function(key, url, mapData) {
    this._cache.tilemap[key] = { url: url, data: mapData };
    this._resolveURL(url, this._cache.tilemap[key]);
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
    this._resolveURL(url, this._cache.json[key]);
  },

  addXML: function(key, url, data) {
    this._cache.xml[key] = { url: url, data: data };
    this._resolveURL(url, this._cache.xml[key]);
  },

  addShader: function(key, url, data) {
    this._cache.shader[key] = { url: url, data: data };
    this._resolveURL(url, this._cache.shader[key]);
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
    this._resolveURL(url, obj);
  },

  addTextureAtlas: function (key, url, data, atlasData, format) {
    var obj = {
      key: key,
      url: url,
      data: data,
      base: new pixi.BaseTexture(data)
    };

    if(format === Loader.TEXTURE_ATLAS_JSON_PYXEL) {
      // currently unsupported
      obj.frameData = AnimationParser.JSONDataPyxel(this.game, atlasData, key);
    } else {
      // let's just work it out from the frames array
      if(Array.isArray(atlasData.frames)) {
        obj.frameData = AnimationParser.JSONData(this.game, atlasData, key);
      } else {
        obj.frameData = AnimationParser.JSONDataHash(this.game, atlasData, key);
      }
    }

    this._cache.image[key] = obj;
    this._resolveURL(url, obj);
  },

  reloadSound: function(key) {
    var self = this,
        sound = this.getSound(key);

    if(sound) {
      sound.data.src = sound.url;
      sound.data.addEventListener('canplaythrough',
        function() {
          return self.reloadSoundComplete(key);
        }, false);
      sound.data.load();
    }
  },

  reloadSoundComplete: function(key) {
    var sound = this.getSound(key);
    if(sound) {
      sound.locked = false;
      this.onSoundUnlock.dispatch(key);
    }
  },

  updateSound: function(key, property, value) {
    var sound = this.getSound(key);
    if(sound) {
      sound[property] = value;
    }
  },

  decodedSound: function(key, data) {
    var sound = this.getSound(key);
        sound.data = data;
        sound.decoded = true;
        sound.isDecoding = false;
  },

  isSoundDecoded: function(key) {
    var sound = this.getItem(key, Cache.SOUND, 'isSoundDecoded');
    if(sound) {
      return sound.decoded;
    }
  },

  isSoundReady: function(key) {
    var sound = this.getItem(key, Cache.SOUND, 'isSoundDecoded');
    if(sound) {
      return (sound.decoded && !this.game.sound.touchLocked);
    }
  },

  checkKey: function(cache, key) {
    if(this._cacheMap[cache][key]) {
      return true;
    }
    return false;
  },

  checkURL: function(url) {
    if(this._urlMap[this._resolveURL(url)]) {
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

  getItem: function(key, cache, method, property) {
    if(!this.checkKey(cache, key)) {
      if(method) {
        console.warn('Cache.' + method + ': Key "' + key + '" not found in Cache.');
      }
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
    return this.getItem(key, Cache.CANVAS, 'getCanvas', 'canvas');
  },

  getImage: function(key, full) {
    if(key === undefined || key === null) { key = '__default'; }
    if(full === undefined) { full = false; }

    var img = this.getItem(key, Cache.IMAGE, 'getImage');
    if(img === null) {
      img = this.getItem('__missing', Cache.IMAGE, 'getImage');
    }

    if(full) {
      return img;
    } else {
      return img.data;
    }
  },

  getTextureFrame: function(key) {
    return this.getItem(key, Cache.TEXTURE, 'getTextureFrame', 'frame');
  },

  getSound: function(key) {
    return this.getItem(key, Cache.SOUND, 'getSound');
  },

  getSoundData: function(key) {
    return this.getItem(key, Cache.SOUND, 'getSoundData', 'data');
  },

  getText: function(key) {
    return this.getItem(key, Cache.TEXT, 'getText', 'data');
  },

  getTilemapData: function(key) {
    return this.getItem(key, Cache.TILEMAP, 'getTilemapData');
  },

  getBinary: function(key) {
    return this.getItem(key, Cache.BINARY, 'getBinary');
  },

  getBitmapData: function(key) {
    return this.getItem(key, Cache.BITMAPDATA, 'getBitmapData', 'data');
  },

  getJSON: function(key, clone) {
    var data = this.getItem(key, Cache.JSON, 'getJSON', 'data');
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
    return this.getItem(key, Cache.XML, 'getXML', 'data');
  },

  getShader: function(key) {
    return this.getItem(key, Cache.SHADER, 'getShader', 'data');
  },

  getRenderTexture: function(key) {
    return this.getItem(key, Cache.RENDER_TEXTURE, 'getRenderTexture');
  },

  getBaseTexture: function(key, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    return this.getItem(key, cache, 'getBaseTexture', 'base');
  },

  getFrame: function(key, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    return this.getItem(key, cache, 'getFrame', 'frame');
  },

  getFrameCount: function(key, cache) {
    var data = this.getFrameData(key, cache);
    if(data) {
      return data.total;
    } else {
      return 0;
    }
  },

  getFrameData: function(key, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    return this.getItem(key, cache, 'getFrameData', 'frameData');
  },

  hasFrameData: function(key, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    return (this.getItem(key, cache, '', 'frameData') !== null);
  },

  updateFrameData: function(key, frameData, cache) {
    if(cache === undefined) { cache = Cache.IMAGE; }
    if(this._cacheMap[cache][key]) {
      this._cacheMap[cache][key].frameData = frameData;
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

  getPixiTexture: function(key) {
    if(pixi.TextureCache[key]) {
      return pixi.TextureCache[key];
    } else {
      console.warn('Cache.getPixiTexture: Invalid key: "' + key + '"');
      return null;
    }
  },

  getPixiBaseTexture: function(key) {
    if(pixi.BaseTextureCache[key]) {
      return pixi.BaseTextureCache[key];
    } else {
      console.warn('Cache.getPixiBaseTexture: Invalid key: "' + key + '"');
      return null;
    }
  },

  getURL: function(url) {
    var url = this._resolveURL(url);
    if(url) {
      return this._urlMap[url];
    } else {
        console.warn('Cache.getUrl: Invalid url: "' + url  + '" or Cache.autoResolveURL was false');
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
    var img = this.getImage(key, true);
        img.base.destroy();
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

  _resolveURL: function(url, data) {
    if(!this.autoResolveURL) {
      return null;
    }

    this._urlResolver.src = this.game.load.baseURL + url;
    this._urlTemp = this._urlResolver.src;

    //  Ensure no request is actually made
    this._urlResolver.src = '';

    //  Record the URL to the map
    if(data) {
      this._urlMap[this._urlTemp] = data;
    }

    return this._urlTemp;
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

    this._urlMap = null;
    this._urlResolver = null;
    this._urlTemp = null;
  }

};

Cache.prototype.constructor = Cache;

module.exports = Cache;
