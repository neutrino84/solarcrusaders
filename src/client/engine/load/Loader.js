var CONST = require('../const'),
    Math = require('../utils/Math'),
    Tilemap = require('../tilemap/Tilemap'),
    Device = require('../system/Device'),
    EventEmitter = require('eventemitter3');

function Loader(game) {  
  this.game = game;
  this.cache = game.cache;

  this.isLoading = false;
  this.hasLoaded = false;

  this.resetLocked = false;
  this.crossOrigin = false;
  this.baseURL = '';
  this.path = '';

  // this.onLoadStart = new Phaser.Signal();
  // this.onLoadComplete = new Phaser.Signal();
  // this.onPackComplete = new Phaser.Signal();
  // this.onFileStart = new Phaser.Signal();
  // this.onFileComplete = new Phaser.Signal();
  // this.onFileError = new Phaser.Signal();

  this.useXDomainRequest = false;
  this.enableParallel = true;
  this.maxParallelDownloads = 6;

  this._withSyncPointDepth = 0;
  this._warnedAboutXDomainRequest = false;

  this._fileList = [];
  this._flightQueue = [];

  this._processingHead = 0;
  this._fileLoadStarted = false;

  this._totalPackCount = 0;
  this._totalFileCount = 0;

  this._loadedPackCount = 0;
  this._loadedFileCount = 0;

  EventEmitter.call(this);
};

Loader.TEXTURE_ATLAS_JSON_ARRAY = 0;
Loader.TEXTURE_ATLAS_JSON_HASH = 1;
Loader.TEXTURE_ATLAS_JSON_PYXEL = 2;

Loader.prototype = Object.create(EventEmitter.prototype);
Loader.prototype.constructor = Loader;

Loader.prototype.checkKeyExists = function(type, key) {
  return this.getAssetIndex(type, key) > -1;
};

Loader.prototype.getAssetIndex = function(type, key) {
  var bestFound = -1;

  for(var i = 0; i < this._fileList.length; i++) {
    var file = this._fileList[i];

    if(file.type === type && file.key === key) {
      bestFound = i;

      // An already loaded/loading file may be superceded.
      if(!file.loaded && !file.loading) {
        break;
      }
    }
  }

  return bestFound;
};

Loader.prototype.getAsset = function(type, key) {
  var fileIndex = this.getAssetIndex(type, key);

  if(fileIndex > -1) {
    return {
      index: fileIndex,
      file: this._fileList[fileIndex]
    };
  }

  return false;
};

Loader.prototype.reset = function(hard, clearEvents) {
  if(clearEvents === undefined) { clearEvents = false; }
  if(this.resetLocked) { return; }

  this.isLoading = false;

  this._processingHead = 0;
  this._fileList.length = 0;
  this._flightQueue.length = 0;

  this._fileLoadStarted = false;
  this._totalFileCount = 0;
  this._totalPackCount = 0;
  this._loadedPackCount = 0;
  this._loadedFileCount = 0;

  if(clearEvents) {
    // this is generally a bad idea,
    // might remove this ability
    this.removeAllListeners();
  }
};

Loader.prototype.addToFileList = function(type, key, url, properties, overwrite, extension) {
  if(overwrite === undefined) { overwrite = false; }
  if(key === undefined || key === '') {
    console.warn('Loader: Invalid or no key given of type ' + type);
    return this;
  }

  if(url === undefined || url === null) {
    if(extension) {
      url = key + extension;
    } else {
      console.warn('Loader: No URL given for file type: ' + type + ' key: ' + key);
      return this;
    }
  }

  var file = {
      type: type,
      key: key,
      path: this.path,
      url: url,
      syncPoint: this._withSyncPointDepth > 0,
      data: null,
      loading: false,
      loaded: false,
      error: false
  };

  if(properties) {
    for(var prop in properties) {
      file[prop] = properties[prop];
    }
  }

  var fileIndex = this.getAssetIndex(type, key);
  if(overwrite && fileIndex > -1) {
    var currentFile = this._fileList[fileIndex];

    if(!currentFile.loading && !currentFile.loaded) {
      this._fileList[fileIndex] = file;
    } else {
      this._fileList.push(file);
      this._totalFileCount++;
    }
  } else if(fileIndex === -1) {
    this._fileList.push(file);
    this._totalFileCount++;
  }

  return this;
};

Loader.prototype.replaceInFileList = function(type, key, url, properties) {
  return this.addToFileList(type, key, url, properties, true);
};

Loader.prototype.image = function(key, url, overwrite) {
  return this.addToFileList('image', key, url, undefined, overwrite, '.png');
};

Loader.prototype.text = function(key, url, overwrite) {
  return this.addToFileList('text', key, url, undefined, overwrite, '.txt');
};

Loader.prototype.json = function(key, url, overwrite) {
  return this.addToFileList('json', key, url, undefined, overwrite, '.json');
};

Loader.prototype.shader = function(key, url, overwrite) {
  return this.addToFileList('shader', key, url, undefined, overwrite, '.frag');
};

Loader.prototype.xml = function(key, url, overwrite) {
  return this.addToFileList('xml', key, url, undefined, overwrite, '.xml');
};

Loader.prototype.script = function(key, url, callback, callbackContext) {
  if(callback === undefined) { callback = false; }
  if(callback !== false && callbackContext === undefined) { callbackContext = this; }
  return this.addToFileList('script', key, url, {
    syncPoint: true, callback: callback,
    callbackContext: callbackContext
  }, false, '.js');
};

Loader.prototype.binary = function(key, url, callback, callbackContext) {
  if(callback === undefined) { callback = false; }
  if(callback !== false && callbackContext === undefined) { callbackContext = this; }
  return this.addToFileList('binary', key, url, {
    callback: callback,
    callbackContext: callbackContext
  }, false, '.bin');
};

Loader.prototype.spritesheet = function(key, url, frameWidth, frameHeight, frameMax, margin, spacing) {
  if(frameMax === undefined) { frameMax = -1; }
  if(margin === undefined) { margin = 0; }
  if(spacing === undefined) { spacing = 0; }
  return this.addToFileList('spritesheet', key, url, {
    frameWidth: frameWidth, frameHeight: frameHeight,
    frameMax: frameMax, margin: margin, spacing: spacing
  }, false, '.png');
};

Loader.prototype.audio = function(key, urls, autoDecode) {
  if(this.game.sound.noAudio) {
    return this;
  }
  if(autoDecode === undefined) { autoDecode = true; }
  if(typeof urls === 'string') {
    urls = [urls];
  }
  return this.addToFileList('audio', key, urls, { buffer: null, autoDecode: autoDecode });
};

Loader.prototype.audiosprite = function(key, urls, jsonURL, jsonData, autoDecode) {
  if(this.game.sound.noAudio) {
    return this;
  }

  if(jsonURL === undefined) { jsonURL = null; }
  if(jsonData === undefined) { jsonData = null; }
  if(autoDecode === undefined) { autoDecode = true; }

  this.audio(key, urls, autoDecode);

  if(jsonURL) {
    this.json(key + '-audioatlas', jsonURL);
  } else if(jsonData) {
    if(typeof jsonData === 'string') {
      jsonData = JSON.parse(jsonData);
    }
    this.cache.addJSON(key + '-audioatlas', '', jsonData);
  } else {
    console.warn('Loader.audiosprite - You must specify either a jsonURL or provide a jsonData object');
  }

  return this;
};

Loader.prototype.tilemap = function(key, url, data) {
  if(url === undefined) { url = null; }
  if(data === undefined) { data = null; }
  if(!url && !data) { url = key + '.json'; }

  //  A map data object has been given
  if(data) {
    data = JSON.parse(data);
    this.cache.addTilemap(key, null, data);
  } else {
    this.addToFileList('tilemap', key, url);
  }

  return this;
};

Loader.prototype.atlasJSONArray = function(key, textureURL, atlasURL, atlasData) {
  return this.atlas(key, textureURL, atlasURL, atlasData, Loader.TEXTURE_ATLAS_JSON_ARRAY);
};

Loader.prototype.atlasJSONHash = function(key, textureURL, atlasURL, atlasData) {
  return this.atlas(key, textureURL, atlasURL, atlasData, Loader.TEXTURE_ATLAS_JSON_HASH);
};

Loader.prototype.atlas = function(key, textureURL, atlasURL, atlasData, format) {
  if(textureURL === undefined || textureURL === null) { textureURL = key + '.png'; }
  if(atlasURL === undefined) { atlasURL = null; }
  if(atlasData === undefined) { atlasData = null; }
  if(format === undefined) { format = Loader.TEXTURE_ATLAS_JSON_ARRAY; }

  if(!atlasURL && !atlasData) {
    atlasURL = key + '.json';
  }

  // a url to a json file has been given
  if(atlasURL) {
    this.addToFileList('textureatlas', key, textureURL, { atlasURL: atlasURL, format: format });
  } else {
    switch(format) {
      // a json string or object has been given
      case Loader.TEXTURE_ATLAS_JSON_ARRAY:
        if(typeof atlasData === 'string') {
          atlasData = JSON.parse(atlasData);
        }
        break;
    }
    this.addToFileList('textureatlas', key, textureURL, { atlasURL: null, atlasData: atlasData, format: format });
  }

  return this;
};

Loader.prototype.withSyncPoint = function(callback, callbackContext) {
  this._withSyncPointDepth++;
  try {
    callback.call(callbackContext || this, this);
  } finally {
    this._withSyncPointDepth--;
  }
  return this;
};

Loader.prototype.addSyncPoint = function(type, key) {
  var asset = this.getAsset(type, key);
  if(asset) {
    asset.file.syncPoint = true;
  }
  return this;
};

Loader.prototype.removeFile = function(type, key) {
  var asset = this.getAsset(type, key);
  if(asset) {
    if(!asset.loaded && !asset.loading) {
      this._fileList.splice(asset.index, 1);
    }
  }
};

Loader.prototype.removeAll = function() {
  this._fileList.length = 0;
  this._flightQueue.length = 0;
};

Loader.prototype.start = function() {
  if(this.isLoading) { return; }

  this.hasLoaded = false;
  this.isLoading = true;

  this.updateProgress();
  this.processLoadQueue();
};

Loader.prototype.processLoadQueue = function() {
  if(!this.isLoading) {
    console.warn('Loader - active loading canceled / reset');
    this.finishedLoading(true);
    return;
  }

  // Empty the flight queue as applicable
  for(var i = 0; i < this._flightQueue.length; i++) {
    var file = this._flightQueue[i];
    if(file.loaded || file.error) {
      this._flightQueue.splice(i, 1);
      i--;

      file.loading = false;
      file.requestUrl = null;
      file.requestObject = null;

      if(file.error) {
        this.emit('fileerror', file.key, file);
      }

      this._loadedFileCount++;

      this.emit('filecomplete', this.progress, file.key, !file.error, this._loadedFileCount, this._totalFileCount);
    }
  }

  // When true further non-pack file downloads are suppressed
  var syncblock = false;
  var inflightLimit = this.enableParallel ? Math.clamp(this.maxParallelDownloads, 1, 12) : 1;
  for(var i = this._processingHead; i < this._fileList.length; i++) {
    var file = this._fileList[i];

    if(file.loaded || file.error) {
      // Item at the start of file list finished, can skip it in future
      if(i === this._processingHead) {
        this._processingHead = i + 1;
      }
    } else if(!file.loading && this._flightQueue.length < inflightLimit) {
      // -> not loaded/failed, not loading
      if(!syncblock) {
        if(!this._fileLoadStarted) {
          this._fileLoadStarted = true;
          this.emit('loadstart');
        }

        this._flightQueue.push(file);
        file.loading = true;
        
        this.emit('filestart', this.progress, file.key, file.url);
        
        this.loadFile(file);
      }
    }

    if(!file.loaded && file.syncPoint) {
      syncblock = true;
    }

    // Stop looking if queue full - or if syncblocked and there are no more packs.
    // (As only packs can be loaded around a syncblock)
    if(this._flightQueue.length >= inflightLimit ||
        (syncblock && this._loadedPackCount === this._totalPackCount)) {
      break;
    }
  }

  this.updateProgress();

  // True when all items in the queue have been advanced over
  // (There should be no inflight items as they are complete - loaded/error.)
  if(this._processingHead >= this._fileList.length) {
    this.finishedLoading();
  } else if(!this._flightQueue.length) {
    // Flight queue is empty but file list is not done being processed.
    // This indicates a critical internal error with no known recovery.
    console.warn('Loader - aborting: processing queue empty, loading may have stalled');

    var self = this;
    setTimeout(function() {
      self.finishedLoading(true);
    }, 2000);
  }

};

Loader.prototype.finishedLoading = function(abnormal) {
  if(this.hasLoaded) {
    return;
  }

  this.hasLoaded = true;
  this.isLoading = false;

  // If there were no files make sure to trigger the event anyway, for consistency
  if(!abnormal && !this._fileLoadStarted) {
    this._fileLoadStarted = true;
    this.emit('loadstart');
  }

  this.emit('loadcomplete');
  this.reset();
};

Loader.prototype.asyncComplete = function(file, errorMessage) {
  if(errorMessage === undefined) { errorMessage = ''; }

  file.loaded = true;
  file.error = !!errorMessage;

  if(errorMessage) {
    file.errorMessage = errorMessage;
    console.warn('Loader - ' + file.type + '[' + file.key + ']' + ': ' + errorMessage);
    // debugger;
  }

  this.processLoadQueue();
};

Loader.prototype.transformUrl = function(url, file) {
  if(!url) { return false; }
  if(url.match(/^(?:blob:|data:|http:\/\/|https:\/\/|\/\/)/)) {
    return url;
  } else {
    return this.baseURL + file.path + url;
  }
};

Loader.prototype.loadFile = function(file) {
  switch(file.type) {
    case 'image':
    case 'spritesheet':
    case 'textureatlas':
      this.loadImageTag(file);
      break;

    case 'audio':
      file.url = this.getAudioURL(file.url);
      if(file.url) {
        //  WebAudio or Audio Tag?
        if(this.game.sound.usingWebAudio) {
          this.xhrLoad(file, this.transformUrl(file.url, file), 'arraybuffer', this.fileComplete);
        } else if(this.game.sound.usingAudioTag) {
          this.loadAudioTag(file);
        }
      } else {
        this.fileError(file, null, 'No supported audio URL specified or device does not have audio playback support');
      }
      break;

    case 'json':
      this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.jsonLoadComplete);
      break;

    case 'xml':
      this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.xmlLoadComplete);
      break;

    case 'tilemap':
      this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.jsonLoadComplete);
      break;

    case 'text':
    case 'script':
    case 'shader':
      this.xhrLoad(file, this.transformUrl(file.url, file), 'text', this.fileComplete);
      break;

    case 'binary':
      this.xhrLoad(file, this.transformUrl(file.url, file), 'arraybuffer', this.fileComplete);
      break;
  }

};

Loader.prototype.loadImageTag = function(file) {
  var self = this;

  file.data = new Image();
  file.data.name = file.key;

  if(this.crossOrigin) {
    file.data.crossOrigin = this.crossOrigin;
  }
  
  file.data.onload = function() {
    if(file.data.onload) {
      file.data.onload = null;
      file.data.onerror = null;
      self.fileComplete(file);
    }
  };

  file.data.onerror = function() {
    if(file.data.onload) {
      file.data.onload = null;
      file.data.onerror = null;
      self.fileError(file);
    }
  };

  file.data.src = this.transformUrl(file.url, file);
  
  // Image is immediately-available/cached
  if(file.data.complete && file.data.width && file.data.height) {
    file.data.onload = null;
    file.data.onerror = null;
    this.fileComplete(file);
  }
};

Loader.prototype.loadAudioTag = function(file) {
  var self = this;
  if(this.game.sound.touchLocked) {
    //  If audio is locked we can't do this yet, so need to queue this load request. Bum.
    file.data = new Audio();
    file.data.name = file.key;
    file.data.preload = 'auto';
    file.data.src = this.transformUrl(file.url, file);

    this.fileComplete(file);
  } else {
    file.data = new Audio();
    file.data.name = file.key;
    
    var playThroughEvent = function() {
      file.data.removeEventListener('canplaythrough', playThroughEvent, false);
      file.data.onerror = null;
      // Why does this cycle through games?
      // Phaser.GAMES[self.game.id].load.fileComplete(file);
    };

    file.data.onerror = function() {
        file.data.removeEventListener('canplaythrough', playThroughEvent, false);
        file.data.onerror = null;
        self.fileError(file);
    };

    file.data.preload = 'auto';
    file.data.src = this.transformUrl(file.url, file);
    file.data.addEventListener('canplaythrough', playThroughEvent, false);
    file.data.load();
  }
};

Loader.prototype.xhrLoad = function(file, url, type, onload, onerror) {
  var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = type;

  onerror = onerror || this.fileError;

  var self = this;
  xhr.onload = function() {
    try {
      return onload.call(self, file, xhr);
    } catch (e) {
      //  If this was the last file in the queue and an error is thrown in the create method
      //  then it's caught here, so be sure we don't carry on processing it
      if(!self.hasLoaded) {
        self.asyncComplete(file, e.message || 'Exception');
      } else {
        if(window['console']) {
          console.error(e);
        }
      }
    }
  };

  xhr.onerror = function() {
    try {
      return onerror.call(self, file, xhr);
    } catch (e) {
      if(!self.hasLoaded) {
        self.asyncComplete(file, e.message || 'Exception');
      } else {
        if(window['console']) {
          console.error(e);
        }
      }
    }
  };

  file.requestObject = xhr;
  file.requestUrl = url;

  xhr.send();
};

Loader.prototype.getAudioURL = function(urls) {
  if(this.game.sound.noAudio) { return null; }

  for(var i = 0; i < urls.length; i++) {
    var url = urls[i];
    var audioType;
    
    // {uri: .., type: ..} pair
    if(url.uri) {
      audioType = url.type;
      url = url.uri;
    } else {
      // Assume direct-data URI can be played if not in a paired form; select immediately
      if(url.indexOf("blob:") === 0 || url.indexOf("data:") === 0) {
        return url;
      }

      // remove query from url
      if(url.indexOf("?") >= 0) {
        url = url.substr(0, url.indexOf("?"));
      }

      var extension = url.substr((global.Math.max(0, url.lastIndexOf(".")) || Infinity) + 1);

      audioType = extension.toLowerCase();
    }

    if(Device.canPlayAudio(audioType)) {
      return url;
    }
  }

  return null;
};

Loader.prototype.fileError = function(file, xhr, reason) {
  var url = file.requestUrl || this.transformUrl(file.url, file);
  var message = 'error loading asset from URL ' + url;

  if(!reason && xhr) {
    reason = xhr.status;
  }

  if(reason) {
    message = message + ' (' + reason + ')';
  }

  this.asyncComplete(file, message);
};

Loader.prototype.fileComplete = function(file, xhr) {
  var loadNext = true;
  switch(file.type) {
    case 'image':
      this.cache.addImage(file.key, file.url, file.data);
      break;

    case 'spritesheet':
      this.cache.addSpriteSheet(file.key, file.url, file.data, file.frameWidth, file.frameHeight, file.frameMax, file.margin, file.spacing);
      break;

    case 'textureatlas':
      if(file.atlasURL == null) {
        this.cache.addTextureAtlas(file.key, file.url, file.data, file.atlasData, file.format);
      } else {
        // load the JSON before carrying on with the next file
        loadNext = false;

        if(file.format == Loader.TEXTURE_ATLAS_JSON_ARRAY ||
            file.format == Loader.TEXTURE_ATLAS_JSON_HASH ||
            file.format == Loader.TEXTURE_ATLAS_JSON_PYXEL) {
          this.xhrLoad(file, this.transformUrl(file.atlasURL, file), 'text', this.jsonLoadComplete);
        } else {
          throw new Error('Loader - Invalid Texture Atlas format: ' + file.format);
        }
      }
      break;

    case 'audio':
      if(this.game.sound.usingWebAudio) {
        file.data = xhr.response;

        this.cache.addSound(file.key, file.url, file.data, true, false);

        if(file.autoDecode) {
          this.game.sound.decode(file.key);
        }
      } else {
        this.cache.addSound(file.key, file.url, file.data, false, true);
      }
      break;

    case 'text':
      file.data = xhr.responseText;
      this.cache.addText(file.key, file.url, file.data);
      break;

    case 'shader':
      file.data = xhr.responseText;
      this.cache.addShader(file.key, file.url, file.data);
      break;

    case 'script':
      file.data = document.createElement('script');
      file.data.language = 'javascript';
      file.data.type = 'text/javascript';
      file.data.defer = false;
      file.data.text = xhr.responseText;

      document.head.appendChild(file.data);

      if(file.callback) {
        file.data = file.callback.call(file.callbackContext, file.key, xhr.responseText);
      }
      break;

    case 'binary':
      if(file.callback) {
        file.data = file.callback.call(file.callbackContext, file.key, xhr.response);
      } else {
        file.data = xhr.response;
      }

      this.cache.addBinary(file.key, file.data);
      break;
  }

  if(loadNext) {
    this.asyncComplete(file);
  }
};

Loader.prototype.jsonLoadComplete = function(file, xhr) {
  var data = JSON.parse(xhr.responseText);
  if(file.type === 'tilemap') {
    this.cache.addTilemap(file.key, file.url, data);
  } else if(file.type === 'json') {
    this.cache.addJSON(file.key, file.url, data);
  } else if(file.type === 'textureatlas') {
    this.cache.addTextureAtlas(file.key, file.url, file.data, data, file.format);
  }
  this.asyncComplete(file);
};

Loader.prototype.xmlLoadComplete = function(file, xhr) {
  // Always try parsing the content as XML, regardless of actually response type
  var data = xhr.responseText;
  var xml = this.parseXml(data);

  if(!xml) {
    var responseType = xhr.responseType || xhr.contentType; // contentType for MS-XDomainRequest
    console.warn('Loader - ' + file.key + ': invalid XML (' + responseType + ')');
    this.asyncComplete(file, 'invalid XML');
    return;
  }

  if(file.type === 'xml') {
    this.cache.addXML(file.key, file.url, xml);
  }

  this.asyncComplete(file);
};

Loader.prototype.parseXml = function(data) {
  var xml;
  try {
    if(window['DOMParser']) {
      var domparser = new DOMParser();
      xml = domparser.parseFromString(data, 'text/xml');
    } else {
      xml = new ActiveXObject('Microsoft.XMLDOM');
      // Why is this 'false'?
      xml.async = 'false';
      xml.loadXML(data);
    }
  } catch (e) {
    xml = null;
  }

  if(!xml || !xml.documentElement || xml.getElementsByTagName('parsererror').length) {
    return null;
  } else {
    return xml;
  }
};

Loader.prototype.updateProgress = function() {
  //.. update loading sprite
};

Loader.prototype.totalLoadedFiles = function() {
  return this._loadedFileCount;
};

Loader.prototype.totalQueuedFiles = function() {
  return this._totalFileCount - this._loadedFileCount;
};

Loader.prototype.totalLoadedPacks = function() {
  return this._totalPackCount;
};

Loader.prototype.totalQueuedPacks = function() {
  return this._totalPackCount - this._loadedPackCount;
};

Object.defineProperty(Loader.prototype, 'progressRaw', {
  get: function() {
    var progress = (this._loadedFileCount / this._totalFileCount);
    return Math.clamp(progress || 0, 0, 100);
  }
});

Object.defineProperty(Loader.prototype, 'progressFloat', {
  get: function() {
    var progress = (this._loadedFileCount / this._totalFileCount) * 100;
    return Math.clamp(progress || 0, 0, 100);
  }
});

Object.defineProperty(Loader.prototype, 'progress', {
  get: function() {
    return global.Math.round(this.progressFloat);
  }
});

Loader.prototype.constructor = Loader;

module.exports = Loader;
