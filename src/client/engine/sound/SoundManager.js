
var Sound = require('./Sound'),
    Device = require('../system/Device'),
    ArraySet = require('../utils/ArraySet');

function SoundManager(game) {
  this.game = game;

  // this.onSoundDecode = new Phaser.Signal();
  // this.onVolumeChange = new Phaser.Signal();
  // this.onMute = new Phaser.Signal();
  // this.onUnMute = new Phaser.Signal();

  this.context = null;
  this.usingWebAudio = false;
  this.noAudio = false;

  this.connectToMaster = true;
  this.touchLocked = false;

  this.channels = 32;

  this._codeMuted = false;
  this._muted = false;
  this._unlockSource = null;
  this._volume = 1;
  this._sounds = [];

  this._watchList = new ArraySet();
  this._watching = false;
  this._watchCallback = null;
  this._watchContext = null;
};

SoundManager.prototype = {

  boot: function() {
    if(Device.iOS && Device.webAudio === false) {
      this.channels = 1;
    }

    if(!!window['AudioContext']) {
      try {
        this.context = new window['AudioContext']();
      } catch (error) {
        this.context = null;
        this.usingWebAudio = false;
        this.touchLocked = false;
      }
    } else if(!!window['webkitAudioContext']) {
      try {
        this.context = new window['webkitAudioContext']();
      } catch (error) {
        this.context = null;
        this.usingWebAudio = false;
        this.touchLocked = false;
      }
    }

    if(this.context === null) {
      this.noAudio = true;
    } else {
      this.usingWebAudio = true;

      if(this.context.createGain === undefined) {
        this.masterGain = this.context.createGainNode();
      } else {
        this.masterGain = this.context.createGain();
      }

      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.context.destination);
    }
  },

  stopAll: function() {
    if(this.noAudio) { return; }
    for(var i = 0; i < this._sounds.length; i++) {
      if(this._sounds[i]) {
        this._sounds[i].stop();
      }
    }
  },

  pauseAll: function() {
    if(this.noAudio) { return; }
    for(var i = 0; i < this._sounds.length; i++) {
      if(this._sounds[i]) {
        this._sounds[i].pause();
      }
    }
  },

  resumeAll: function() {
    if(this.noAudio) { return; }
    for(var i = 0; i < this._sounds.length; i++) {
      if(this._sounds[i]) {
        this._sounds[i].resume();
      }
    }
  },

  decode: function(key, sound) {
    var self = this,
        game = this.game,
        sound = sound = sound || null,
        soundData = this.game.cache.getSoundData(key);
    if(soundData) {
      if(this.game.cache.isSoundDecoded(key) === false) {
        this.game.cache.updateSound(key, 'isDecoding', true);
        try {
          this.context.decodeAudioData(soundData, function(buffer) {
            if(buffer) {
              self.game.cache.decodedSound(key, buffer);
              // self.onSoundDecode.dispatch(key, sound);
            }
          });
        } catch (e) {}
      }
    }
  },

  setDecodedCallback: function(files, callback, callbackContext) {
    if(typeof files === 'string') { files = [ files ]; }

    this._watchList.reset();

    for(var i=0; i<files.length; i++) {
      if(files[i] instanceof Sound) {
        if(!this.game.cache.isSoundDecoded(files[i].key)) {
          this._watchList.add(files[i].key);
        }
      } else if(!this.game.cache.isSoundDecoded(files[i])) {
        this._watchList.add(files[i]);
      }
    }

    if(this._watchList.total === 0) {
      this._watching = false;
      callback.call(callbackContext);
    } else {
      this._watching = true;
      this._watchCallback = callback;
      this._watchContext = callbackContext;
    }
  },

  update: function() {
    if(this.noAudio) { return; }

    if(this.touchLocked && this._unlockSource !== null && (this._unlockSource.playbackState === this._unlockSource.PLAYING_STATE || this._unlockSource.playbackState === this._unlockSource.FINISHED_STATE)) {
      this.touchLocked = false;
      this._unlockSource = null;
    }

    for(var i = 0; i < this._sounds.length; i++) {
      this._sounds[i].update();
    }

    if(this._watching) {
      var key = this._watchList.first;

      while (key) {
        if(this.game.cache.isSoundDecoded(key)) {
          this._watchList.remove(key);
        }
        key = this._watchList.next;
      }

      if(this._watchList.total === 0) {
        this._watching = false;
        this._watchCallback.call(this._watchContext);
      }
    }
  },

  add: function(key, volume, loop, connect) {
    if(volume === undefined) { volume = 1; }
    if(loop === undefined) { loop = false; }
    if(connect === undefined) { connect = this.connectToMaster; }

    var sound = new Sound(this.game, key, volume, loop, connect);

    this._sounds.push(sound);

    return sound;
  },

  remove: function(sound) {
    var i = this._sounds.length;
    while (i--) {
      if(this._sounds[i] === sound) {
        this._sounds[i].destroy(false);
        this._sounds.splice(i, 1);
        return true;
      }
    }
    return false;
  },

  removeByKey: function(key) {
    var i = this._sounds.length,
        removed = 0;
    while (i--) {
      if(this._sounds[i].key === key) {
        this._sounds[i].destroy(false);
        this._sounds.splice(i, 1);
        removed++;
      }
    }
    return removed;
  },

  play: function(key, volume, loop) {
    if(this.noAudio) { return; }
    var sound = this.add(key, volume, loop);
        sound.play();
    return sound;
  },

  setMute: function() {
    if(this._muted) { return; }

    this._muted = true;

    if(this.usingWebAudio) {
      this._muteVolume = this.masterGain.gain.value;
      this.masterGain.gain.value = 0;
    }

    // this.onMute.dispatch();
  },

  unsetMute: function() {
    if(!this._muted || this._codeMuted) { return; }

    this._muted = false;

    if(this.usingWebAudio) {
      this.masterGain.gain.value = this._muteVolume;
    }

    // this.onUnMute.dispatch();
  },

  destroy: function() {
    this.stopAll();

    for(var i = 0; i < this._sounds.length; i++) {
      if(this._sounds[i]) {
        this._sounds[i].destroy();
      }
    }

    this._sounds = [];

    // this.onSoundDecode.dispose();

    if(this.context && this.context.close) {
      this.context.close();
    }
  }
};

SoundManager.prototype.constructor = SoundManager;

Object.defineProperty(SoundManager.prototype, 'mute', {
  get: function() {
    return this._muted;
  },

  set: function(value) {
    value = value || false;

    if(value) {
      if(this._muted) {
        return;
      }

      this._codeMuted = true;
      this.setMute();
    } else {
      if(!this._muted) {
        return;
      }

      this._codeMuted = false;
      this.unsetMute();
    }
  }
});

Object.defineProperty(SoundManager.prototype, 'volume', {
  get: function() {
    return this._volume;
  },

  set: function(value) {
    if(value < 0) {
      value = 0;
    } else if(value > 1) {
      value = 1;
    }

    if(this._volume !== value) {
      this._volume = value;

      if(this.usingWebAudio) {
        this.masterGain.gain.value = value;
      }

      // this.onVolumeChange.dispatch(value);
    }
  }
});

module.exports = SoundManager;
