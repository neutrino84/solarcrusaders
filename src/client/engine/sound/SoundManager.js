
var EventEmitter = require('eventemitter3'),
    Sound = require('./Sound'),
    Device = require('../system/Device'),
    ArraySet = require('../utils/ArraySet');

function SoundManager(game) {
  this.game = game;

  this.context = null;
  this.noAudio = true;

  this._codeMuted = false;
  this._muted = false;
  this._volume = 1;
  this._sounds = [];
  this._pooling = {};

  EventEmitter.call(this);
};

SoundManager.prototype = Object.create(EventEmitter.prototype);
SoundManager.prototype.constructor = SoundManager;

SoundManager.prototype.boot = function() {
  if(!!window['AudioContext']) {
    try {
      this.context = new window['AudioContext']();
    } catch(error) {
      this.context = null;
    }
  } else if(!!window['webkitAudioContext']) {
    try {
      this.context = new window['webkitAudioContext']();
    } catch(error) {
      this.context = null;
    }
  }
  if(this.context === null) {
    this.noAudio = true;
  } else {
    this.noAudio = false;
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.context.destination);
  }
};

SoundManager.prototype.stopAll = function() {
  if(this.noAudio) { return; }
  for(var i = 0; i < this._sounds.length; i++) {
    if(this._sounds[i]) {
      this._sounds[i].stop();
    }
  }
};

SoundManager.prototype.pauseAll = function() {
  if(this.noAudio) { return; }
  for(var i = 0; i < this._sounds.length; i++) {
    if(this._sounds[i]) {
      this._sounds[i].pause();
    }
  }
};

SoundManager.prototype.resumeAll = function() {
  if(this.noAudio) { return; }
  for(var i = 0; i < this._sounds.length; i++) {
    if(this._sounds[i]) {
      this._sounds[i].resume();
    }
  }
};

SoundManager.prototype.update = function() {
  if(this.noAudio) { return; }
  for(var i=0; i<this._sounds.length; i++) {
    this._sounds[i].update();
  }
};

SoundManager.prototype.play = function(key, volume, loop, rate, force) {
  if(this.noAudio) { return; }
  var sound,
      sounds = this._pooling[key];
  if(sounds) {
    sound = sounds.pop();
    sound && sound.play(undefined, undefined, volume, loop, rate, force);
  }
};

SoundManager.prototype.add = function(key, limit) {
  var sound,
      game = this.game,
      sounds = this._sounds,
      pooling = this._pooling,
      context = this.context,
      data = game.cache.getSoundData(key);
      
  if(context && data) {
    pooling[key] = [];

    try {
      context.decodeAudioData(data, function(buffer) {
        if(buffer) {
          for(var i=0; i<limit; i++) {
            sound = new Sound(game, key, buffer);
            sound.on('stop', function(sound) {
              pooling[key].push(sound);
            });
            sounds.push(sound);
            pooling[key].push(sound);
          }
        }
      });
    } catch(e) {}
  }
};

SoundManager.prototype.remove = function(sound) {
  //..
};

SoundManager.prototype.setMute = function() {
  if(this._muted) { return; }

  this._muted = true;
  this._muteVolume = this.masterGain.gain.value;
  this.masterGain.gain.value = 0.0;

  this.emit('mute');
};

SoundManager.prototype.unsetMute = function() {
  if(!this._muted || this._codeMuted) { return; }

  this._muted = false;
  this.masterGain.gain.value = this._muteVolume;

  this.emit('unmute');
};

SoundManager.prototype.destroy = function() {
  this.stopAll();
  // for(var i = 0; i < this._sounds.length; i++) {
  //   if(this._sounds[i]) {
  //     this._sounds[i].destroy();
  //   }
  // }
  // this._sounds = [];
  // if(this.context && this.context.close) {
  //   this.context.close();
  // }
};

Object.defineProperty(SoundManager.prototype, 'mute', {
  get: function() {
    return this._muted;
  },

  set: function(value) {
    value = value || false;

    if(value) {
      if(this._muted) { return; }

      this._codeMuted = true;
      this.setMute();
    } else {
      if(!this._muted) { return; }

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
    if(value < 0.0) {
      value = 0.0;
    } else if(value > 1.0) {
      value = 1.0;
    }
    if(this._volume !== value) {
      this._volume = value;
      this.masterGain.gain.value = value;

      this.emit('volume', value);
    }
  }
});

module.exports = SoundManager;
