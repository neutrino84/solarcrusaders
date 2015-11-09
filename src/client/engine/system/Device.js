var pixi = require('pixi');

var Device = {
  // features
  android: false,
  chromeOS: false,
  iOS: false,
  linux: false,
  macOS: false,
  windows: false,
  windowsPhone: false,
  desktop: false,
  canvas: false,
  file: false,
  fileSystem: false,
  webGL: false,
  worker: false,
  canvasBitBltShift: false,

  // audio
  audioData: false,
  webAudio: false,

  // browser
  chrome: false,
  chromeVersion: false,
  arora: false,
  epiphany: false,
  firefox: false,
  firefoxVersion: false,
  safari: false,
  mobileSafari: false,
  ie: false,
  ieVersion: false,
  trident: false,
  tridentVersion: false,

  // headless
  cocoonJS: false,
  node: false,
  nodeWebkit: false,
  electron: false,

  // fs
  fullscreen: false,
  requestFullscreen: '',
  cancelFullscreen: '',
  fullscreenKeyboard: false,

  // input
  pointerLock: false,
  quirksMode: false,
  touch: false,
  mspointer: false,
  wheelEvent: '',

  whenReady: function(callback, context, nonPrimer) {
    var readyCheck = this._readyCheck;

    if(this.deviceReadyAt || !readyCheck) {
      callback.call(context, this);
    } else if(readyCheck._monitor || nonPrimer) {
      readyCheck._queue = readyCheck._queue || [];
      readyCheck._queue.push([callback, context]);
    } else {
      readyCheck._monitor = readyCheck.bind(this);
      readyCheck._queue = readyCheck._queue || [];
      readyCheck._queue.push([callback, context]);
      
      if(global.document.readyState === 'complete' || global.document.readyState === 'interactive') {
        // Why is there an additional timeout here?
        global.setTimeout(readyCheck._monitor, 0);
      } else {
        global.document.addEventListener('DOMContentLoaded', readyCheck._monitor, false);
        global.addEventListener('load', readyCheck._monitor, false);
      }
    }
  },

  _readyCheck: function() {
    var readyCheck = this._readyCheck;

    if(!global.document.body) {
      global.setTimeout(readyCheck._monitor, 20);
    } else if(!this.deviceReadyAt) {
      this.deviceReadyAt = Date.now();

      global.document.removeEventListener('DOMContentLoaded', readyCheck._monitor);
      global.removeEventListener('load', readyCheck._monitor);

      this._initialize();
      this.initialized = true;

      // this.onInitialized.dispatch(this);

      var item;
      while((item = readyCheck._queue.shift())) {
        var callback = item[0];
        var context = item[1];
        callback.call(context, this);
      }

      // Remove methods and properties.
      this._readyCheck = null;
      this._initialize = null;
      // this.onInitialized = null;
    }
  },

  _initialize: function() {
    var device = this;

    function _checkOS () {
      var ua = global.navigator.userAgent;

      if(/Android/.test(ua)) {
        device.android = true;
      } else if(/CrOS/.test(ua)) {
        device.chromeOS = true;
      } else if(/iP[ao]d|iPhone/i.test(ua)) {
        device.iOS = true;
      } else if(/Linux/.test(ua)) {
        device.linux = true;
      } else if(/Mac OS/.test(ua)) {
        device.macOS = true;
      } else if(/Windows/.test(ua)) {
        device.windows = true;
      }

      if(/Windows Phone/i.test(ua) || /IEMobile/i.test(ua)) {
        device.android = false;
        device.iOS = false;
        device.macOS = false;
        device.windows = true;
        device.windowsPhone = true;
      }

      // check is desktop
      if(device.windows || device.macOS || device.linux || device.chromeOS) {
        device.desktop = true;
      }

      //  Windows Phone / Table reset
      if(device.windowsPhone || ((/Windows NT/i.test(ua)) && (/Touch/i.test(ua)))) {
        device.desktop = false;
      }
    }

    function _checkAudio () {
      device.audioData = !!(global.window['Audio']);
      device.webAudio = !!(global.window['AudioContext'] || global.window['webkitAudioContext']);
      
      var audioElement = document.createElement('audio'),
          result = false;

      try {
        if(result = !!audioElement.canPlayType) {
          if(audioElement.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, '')) {
            device.ogg = true;
          }

          if(audioElement.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, '') || audioElement.canPlayType('audio/opus;').replace(/^no$/, '')) {
            device.opus = true;
          }

          if(audioElement.canPlayType('audio/mpeg;').replace(/^no$/, '')) {
            device.mp3 = true;
          }

          // Mimetypes accepted:
          //   developer.mozilla.org/En/Media_formats_supported_by_the_audio_and_video_elements
          //   bit.ly/iphoneoscodecs
          if(audioElement.canPlayType('audio/wav; codecs="1"').replace(/^no$/, '')) {
            device.wav = true;
          }

          if(audioElement.canPlayType('audio/x-m4a;') || audioElement.canPlayType('audio/aac;').replace(/^no$/, '')) {
            device.m4a = true;
          }

          if(audioElement.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')) {
            device.webm = true;
          }
        }
      } catch (e) {}
    }

    function _checkFeatures() {
      device.canvas = !!global['CanvasRenderingContext2D'];
      device.file = !!global['File'] && !!global['FileReader'] && !!global['FileList'] && !!global['Blob'];
      device.fileSystem = !!global['requestFileSystem'];
      device.webGL = pixi.utils.isWebGLSupported();
      device.worker = !!global['Worker'];
      device.pointerLock = 'pointerLockElement' in global.document || 'mozPointerLockElement' in global.document || 'webkitPointerLockElement' in global.document;
      device.quirksMode = (global.document.compatMode === 'CSS1Compat') ? false : true;

      // Excludes iOS versions as they generally wrap UIWebView (eg. Safari WebKit) and it
      // is safer to not try and use the fast copy-over method.
      if(!device.iOS && (device.ie || device.firefox || device.chrome)) {
        device.canvasBitBltShift = true;
      }

      // Known not to work
      if(device.safari || device.mobileSafari) {
        device.canvasBitBltShift = false;
      }
    }

    function _checkInput() {
      if('ontouchstart' in document.documentElement || (global.navigator.maxTouchPoints && global.navigator.maxTouchPoints >= 1)) {
        device.touch = true;
      }

      if(global.navigator.msPointerEnabled || global.navigator.pointerEnabled) {
        device.mspointer = true;
      }

      // See https://developer.mozilla.org/en-US/docs/Web/Events/wheel
      if('onwheel' in global || (device.ie && 'WheelEvent' in global)) {
        // DOM3 Wheel Event: FF 17+, IE 9+, Chrome 31+, Safari 7+
        device.wheelEvent = 'wheel';
      } else if('onmousewheel' in global) {
        // Non-FF legacy: IE 6-9, Chrome 1-31, Safari 5-7.
        device.wheelEvent = 'mousewheel';
      }
    }

    function _checkFullScreenSupport() {
      var element = document.createElement('div'),
          fs = [
            'requestFullscreen',
            'requestFullScreen',
            'webkitRequestFullscreen',
            'webkitRequestFullScreen',
            'msRequestFullscreen',
            'msRequestFullScreen',
            'mozRequestFullScreen',
            'mozRequestFullscreen'
          ],
          cfs = [
            'cancelFullScreen',
            'exitFullscreen',
            'webkitCancelFullScreen',
            'webkitExitFullscreen',
            'msCancelFullScreen',
            'msExitFullscreen',
            'mozCancelFullScreen',
            'mozExitFullscreen'
          ];

      for(var i = 0; i < fs.length; i++) {
        if(element[fs[i]]) {
          device.fullscreen = true;
          device.requestFullscreen = fs[i];
          break;
        }
      }

      if(device.fullscreen) {
        for(var i = 0; i < cfs.length; i++) {
          if(document[cfs[i]]) {
            device.cancelFullscreen = cfs[i];
            break;
          }
        }
      }

      // Keyboard Input?
      if(global.Element && global.Element['ALLOW_KEYBOARD_INPUT']) {
        device.fullscreenKeyboard = true;
      }
    }

    function _checkBrowser () {
      var ua = global.navigator.userAgent;

      if(/Arora/.test(ua)) {
        device.arora = true;
      } else if(/Chrome\/(\d+)/.test(ua) && !device.windowsPhone) {
        device.chrome = true;
        device.chromeVersion = parseInt(RegExp.$1, 10);
      } else if(/Epiphany/.test(ua)) {
        device.epiphany = true;
      } else if(/Firefox\D+(\d+)/.test(ua)) {
        device.firefox = true;
        device.firefoxVersion = parseInt(RegExp.$1, 10);
      } else if(/AppleWebKit/.test(ua) && device.iOS) {
        device.mobileSafari = true;
      } else if(/MSIE (\d+\.\d+);/.test(ua)) {
        device.ie = true;
        device.ieVersion = parseInt(RegExp.$1, 10);
      } else if(/Safari/.test(ua) && !device.windowsPhone) {
        device.safari = true;
      } else if(/Trident\/(\d+\.\d+)(.*)rv:(\d+\.\d+)/.test(ua)) {
        device.ie = true;
        device.trident = true;
        device.tridentVersion = parseInt(RegExp.$1, 10);
        device.ieVersion = parseInt(RegExp.$3, 10);
      }
        
      if(process !== undefined && require !== undefined) {
        device.node = true;
      }
        
      if(device.node && typeof process.versions === 'object') {
        device.nodeWebkit = !!process.versions['node-webkit'];
        device.electron = !!process.versions.electron;
      }
      
      if(navigator['isCocoonJS']) {
        device.cocoonJS = true;
      }
        
      if(device.cocoonJS) {
        try {
          device.cocoonJSApp = (CocoonJS !== undefined);
        } catch(error) {
          device.cocoonJSApp = false;
        }
      }

      if(window.ejecta !== undefined) {
        device.ejecta = true;
      }
    }

    _checkOS();
    _checkAudio();
    _checkBrowser();
    _checkFeatures();
    _checkInput();
    _checkFullScreenSupport();
  },

  canPlayAudio: function(type) {
    if(type === 'mp3' && this.mp3) {
      return true;
    } else if(type === 'ogg' && (this.ogg || this.opus)) {
      return true;
    } else if(type === 'm4a' && this.m4a) {
      return true;
    } else if(type === 'opus' && this.opus) {
      return true;
    } else if(type === 'wav' && this.wav) {
      return true;
    } else if(type === 'webm' && this.webm) {
      return true;
    }
    return false;
  }
};

module.exports = Device;
