var EventEmitter = require('eventemitter3'),
    Device = require('../system/Device');

function Sound(game, key, volume, loop, connect) {
  if(volume === undefined) { volume = 1; }
  if(loop === undefined) { loop = false; }
  if(connect === undefined) { connect = game.sound.connectToMaster; }

  this.game = game;
  this.name = key;
  this.key = key;
  this.loop = loop;
  this.volume = volume;
  this.markers = {};
  this.context = null;
  this.autoplay = false;
  this.totalDuration = 0;
  this.startTime = 0;
  this.currentTime = 0;
  this.duration = 0;
  this.durationMS = 0;
  this.position = 0;
  this.stopTime = 0;
  this.paused = false;
  this.pausedPosition = 0;
  this.pausedTime = 0;
  this.isPlaying = false;
  this.currentMarker = '';
  this.fadeTween = null;
  this.pendingPlayback = false;
  this.override = false;
  this.allowMultiple = false;

  this.usingWebAudio = this.game.sound.usingWebAudio;
  this.usingAudioTag = this.game.sound.usingAudioTag;
  
  this.externalNode = null;
  this.masterGainNode = null;
  this.gainNode = null;

  this._sound = null;

  if(this.usingWebAudio) {
    this.context = this.game.sound.context;
    this.masterGainNode = this.game.sound.masterGain;

    if(this.context.createGain === undefined) {
      this.gainNode = this.context.createGainNode();
    } else {
      this.gainNode = this.context.createGain();
    }

    this.gainNode.gain.value = volume * this.game.sound.volume;

    if(connect) {
      this.gainNode.connect(this.masterGainNode);
    }
  } else if(this.usingAudioTag) {
    if(this.game.cache.getSound(key) && this.game.cache.isSoundReady(key)) {
      this._sound = this.game.cache.getSoundData(key);
      this.totalDuration = 0;

      if(this._sound.duration) {
        this.totalDuration = this._sound.duration;
      }
    } else {
      this.game.cache.onSoundUnlock.add(this.soundHasUnlocked, this);
    }
  }

  // this.onDecoded = new Phaser.Signal();
  // this.onPlay = new Phaser.Signal();
  // this.onPause = new Phaser.Signal();
  // this.onResume = new Phaser.Signal();
  // this.onLoop = new Phaser.Signal();
  // this.onStop = new Phaser.Signal();
  // this.onMute = new Phaser.Signal();
  // this.onMarkerComplete = new Phaser.Signal();
  // this.onFadeComplete = new Phaser.Signal();

  this._volume = volume;
  this._buffer = null;
  this._muted = false;
  this._tempMarker = 0;
  this._tempPosition = 0;
  this._tempVolume = 0;
  this._muteVolume = 0;
  this._tempLoop = 0;
  this._paused = false;
  this._onDecodedEventDispatched = false;

  EventEmitter.call(this);
};

Sound.prototype = Object.create(EventEmitter.prototype);
Sound.prototype.constructor = Sound;

Sound.prototype.soundHasUnlocked = function(key) {
  if(key === this.key) {
    this._sound = this.game.cache.getSoundData(this.key);
    this.totalDuration = this._sound.duration;
  }
};

Sound.prototype.addMarker = function(name, start, duration, volume, loop) {
  if(volume === undefined || volume === null) { volume = 1; }
  if(loop === undefined) { loop = false; }

  this.markers[name] = {
    name: name,
    start: start,
    stop: start + duration,
    volume: volume,
    duration: duration,
    durationMS: duration * 1000,
    loop: loop
  };
};

Sound.prototype.removeMarker = function(name) {
  delete this.markers[name];
};

Sound.prototype.onEndedHandler = function() {
  if(this._sound) {
    this._sound.onended = null;
  }
  
  this.isPlaying = false;
  this.currentTime = this.durationMS;
  this.stop();
};

Sound.prototype.update = function() {
  if(!this.game.cache.checkSoundKey(this.key)) {
    this.destroy();
    return;
  }

  if(this.isDecoded && !this._onDecodedEventDispatched) {
    this.emit('decoded', this);
    this._onDecodedEventDispatched = true;
  }

  if(this.pendingPlayback && this.game.cache.isSoundReady(this.key)) {
    this.pendingPlayback = false;
    this.play(this._tempMarker, this._tempPosition, this._tempVolume, this._tempLoop);
  }

  if(this.isPlaying) {
    this.currentTime = this.game.clock.time - this.startTime;

    if(this.currentTime >= this.durationMS) {
      if(this.usingWebAudio) {
        if(this.loop) {
          // won't work with markers, needs to reset the position
          this.emit('loop', this);

          if(this.currentMarker === '') {
            this.currentTime = 0;
            this.startTime = this.game.clock.time;
          } else {
            this.emit('markerComplete', this.currentMarker, this);
            this.play(this.currentMarker, 0, this.volume, true, true);
          }
        } else {
          // Stop if we're using an audio marker, otherwise we let onended handle it
          if(this.currentMarker !== '') {
            this.stop();
          }
        }
      } else {
        if(this.loop) {
          this.emit('loop', this);
          this.play(this.currentMarker, 0, this.volume, true, true);
        } else {
          this.stop();
        }
      }
    }
  }
};

Sound.prototype.loopFull = function(volume) {
  this.play(null, 0, volume, true);
};

Sound.prototype.play = function(marker, position, volume, loop, forceRestart) {
  if(marker === undefined || marker === false || marker === null) { marker = ''; }
  if(forceRestart === undefined) { forceRestart = true; }
  if(this.isPlaying && !this.allowMultiple && !forceRestart && !this.override) {
    // Use Restart instead
    return this;
  }

  if(this._sound && this.isPlaying && !this.allowMultiple && (this.override || forceRestart)) {
    if(this.usingWebAudio) {
      if(this._sound.stop === undefined) {
        this._sound.noteOff(0);
      } else {
        try {
          this._sound.stop(0);
        }
        catch (e) {}
      }
      if(this.externalNode) {
        this._sound.disconnect(this.externalNode);
      } else {
        this._sound.disconnect(this.gainNode);
      }
    } else if(this.usingAudioTag) {
      this._sound.pause();
      this._sound.currentTime = 0;
    }
  }

  if(marker === '' && Object.keys(this.markers).length > 0) {
    // If they didn't specify a marker but this is an audio sprite, 
    // we should never play the entire thing
    return this;
  }

  if(marker !== '') {
    this.currentMarker = marker;

    if(this.markers[marker]) {
      // Playing a marker? Then we default to the marker values
      this.position = this.markers[marker].start;
      this.volume = this.markers[marker].volume;
      this.loop = this.markers[marker].loop;
      this.duration = this.markers[marker].duration;
      this.durationMS = this.markers[marker].durationMS;

      if(typeof volume !== 'undefined') {
        this.volume = volume;
      }

      if(typeof loop !== 'undefined') {
        this.loop = loop;
      }

      this._tempMarker = marker;
      this._tempPosition = this.position;
      this._tempVolume = this.volume;
      this._tempLoop = this.loop;
    } else {
      // console.warn("Sound.play: audio marker " + marker + " doesn't exist");
      return this;
    }
  } else {
    position = position || 0;

    if(volume === undefined) { volume = this._volume; }
    if(loop === undefined) { loop = this.loop; }

    this.position = global.Math.max(0, position);
    this.volume = volume;
    this.loop = loop;
    this.duration = 0;
    this.durationMS = 0;

    this._tempMarker = marker;
    this._tempPosition = position;
    this._tempVolume = volume;
    this._tempLoop = loop;
  }

  if(this.usingWebAudio) {
    // Does the sound need decoding?
    if(this.game.cache.isSoundDecoded(this.key)) {
      this._sound = this.context.createBufferSource();

      if(this.externalNode) {
        this._sound.connect(this.externalNode);
      } else {
        this._sound.connect(this.gainNode);
      }

      this._buffer = this.game.cache.getSoundData(this.key);
      this._sound.buffer = this._buffer;

      if(this.loop && marker === '') {
        this._sound.loop = true;
      }

      if(!this.loop && marker === '') {
        this._sound.onended = this.onEndedHandler.bind(this);
      }

      this.totalDuration = this._sound.buffer.duration;

      if(this.duration === 0) {
        this.duration = this.totalDuration;
        this.durationMS = Math.ceil(this.totalDuration * 1000);
      }

      // Useful to cache this somewhere perhaps?
      if(this._sound.start === undefined) {
        this._sound.noteGrainOn(0, this.position, this.duration);
      } else {
        if(this.loop && marker === '') {
          this._sound.start(0, 0);
        } else {
          this._sound.start(0, this.position, this.duration);
        }
      }

      this.isPlaying = true;
      this.startTime = this.game.clock.time;
      this.currentTime = 0;
      this.stopTime = this.startTime + this.durationMS;
      this.emit('play', this);
    } else {
      this.pendingPlayback = true;

      if(this.game.cache.getSound(this.key) && this.game.cache.getSound(this.key).isDecoding === false) {
        this.game.sound.decode(this.key, this);
      }
    }
  } else {
    if(this.game.cache.getSound(this.key) && this.game.cache.getSound(this.key).locked) {
      this.game.cache.reloadSound(this.key);
      this.pendingPlayback = true;
    } else {
      if(this._sound && (Device.cocoonJS || this._sound.readyState === 4)) {
        this._sound.play();
        // This doesn't become available until you call play(), wonderful ...
        this.totalDuration = this._sound.duration;

        if(this.duration === 0) {
          this.duration = this.totalDuration;
          this.durationMS = this.totalDuration * 1000;
        }

        this._sound.currentTime = this.position;
        this._sound.muted = this._muted;

        if(this._muted) {
          this._sound.volume = 0;
        } else {
          this._sound.volume = this._volume;
        }

        this.isPlaying = true;
        this.startTime = this.game.clock.time;
        this.currentTime = 0;
        this.stopTime = this.startTime + this.durationMS;
        this.emit('play', this);
      } else {
        this.pendingPlayback = true;
      }
    }
  }

  return this;
};

Sound.prototype.restart = function(marker, position, volume, loop) {
  marker = marker || '';
  position = position || 0;
  volume = volume || 1;
  if(loop === undefined) { loop = false; }
  this.play(marker, position, volume, loop, true);
};

Sound.prototype.pause = function() {
  if(this.isPlaying && this._sound) {
    this.paused = true;
    this.pausedPosition = this.currentTime;
    this.pausedTime = this.game.clock.time;
    this.emit('pause', this);
    this.stop();
  }
};

Sound.prototype.resume = function() {
  if(this.paused && this._sound) {
    if(this.usingWebAudio) {
      var p = Math.max(0, this.position + (this.pausedPosition / 1000));

      this._sound = this.context.createBufferSource();
      this._sound.buffer = this._buffer;

      if(this.externalNode) {
        this._sound.connect(this.externalNode);
      } else {
        this._sound.connect(this.gainNode);
      }

      if(this.loop) {
        this._sound.loop = true;
      }

      if(!this.loop && this.currentMarker === '') {
        this._sound.onended = this.onEndedHandler.bind(this);
      }

      var duration = this.duration - (this.pausedPosition / 1000);
      if(this._sound.start === undefined) {
        this._sound.noteGrainOn(0, p, duration);
        this._sound.noteOn(0); // the zero is vitally important, crashes iOS6 without it
      } else {
        if(this.loop && Device.chrome) {
          // Handle chrome bug: https://code.google.com/p/chromium/issues/detail?id=457099
          if(Device.chromeVersion === 42) {
            this._sound.start(0);
          } else {
            this._sound.start(0, p);
          }
        } else {
          this._sound.start(0, p, duration);
        }
      }
    } else {
      this._sound.play();
    }

    this.isPlaying = true;
    this.paused = false;
    this.startTime += (this.game.clock.time - this.pausedTime);
    this.emit('resume', this);
  }
};

Sound.prototype.stop = function() {
  if(this.isPlaying && this._sound) {
    if(this.usingWebAudio) {
      if(this._sound.stop === undefined) {
        this._sound.noteOff(0);
      } else {
        try {
          this._sound.stop(0);
        } catch (e) {}
      }
      if(this.externalNode) {
        this._sound.disconnect(this.externalNode);
      } else {
        this._sound.disconnect(this.gainNode);
      }
    } else if(this.usingAudioTag) {
      this._sound.pause();
      this._sound.currentTime = 0;
    }
  }

  this.pendingPlayback = false;
  this.isPlaying = false;

  if(!this.paused) {
    var prevMarker = this.currentMarker;

    if(this.currentMarker !== '') {
      this.emit('markerComplete', this.currentMarker, this);
    }

    this.currentMarker = '';

    if(this.fadeTween !== null) {
      this.fadeTween.stop();
    }

    this.emit('stop', this, prevMarker);
  }
};

Sound.prototype.fadeIn = function(duration, loop, marker) {
  if(loop === undefined) { loop = false; }
  if(marker === undefined) { marker = this.currentMarker; }
  if(this.paused) { return; }

  this.play(marker, 0, 0, loop);
  this.fadeTo(duration, 1);
};
  
Sound.prototype.fadeOut = function(duration) {
  this.fadeTo(duration, 0);
};

Sound.prototype.fadeTo = function(duration, volume) {
  if(!this.isPlaying || this.paused || volume === this.volume) { return; }
  if(duration === undefined) { duration = 1000; }
  if(volume === undefined) {
    console.warn('Sound.fadeTo: No Volume Specified.');
    return;
  }

  this.fadeTween = this.game.tweens.create(this);
  this.fadeTween.to({ volume: volume }, duration, undefined, true);
  this.fadeTween.on('complete', this.fadeComplete, this);
};

Sound.prototype.fadeComplete = function() {
  this.emit('fadeComplete', this, this.volume);
  if(this.volume === 0) {
    this.stop();
  }
};

Sound.prototype.destroy = function(remove) {
  if(remove === undefined) { remove = true; }
    this.stop();
  if(remove) {
    this.game.sound.remove(this);
  } else {
    this.markers = {};
    this.context = null;
    this._buffer = null;
    this.externalNode = null;

    this.removeAllListeners();
  }
};

Object.defineProperty(Sound.prototype, 'isDecoding', {
  get: function() {
    return this.game.cache.getSound(this.key).isDecoding;
  }
});

Object.defineProperty(Sound.prototype, 'isDecoded', {
  get: function() {
    return this.game.cache.isSoundDecoded(this.key);
  }
});

Object.defineProperty(Sound.prototype, 'mute', {
  get: function() {
    return (this._muted || this.game.sound.mute);
  },

  set: function(value) {
    value = value || false;

    if(value === this._muted) { return; }

    if(value) {
      this._muted = true;
      this._muteVolume = this._tempVolume;

      if(this.usingWebAudio) {
        this.gainNode.gain.value = 0;
      } else if(this.usingAudioTag && this._sound) {
        this._sound.volume = 0;
      }
    } else {
      this._muted = false;

      if(this.usingWebAudio) {
        this.gainNode.gain.value = this._muteVolume;
      } else if(this.usingAudioTag && this._sound) {
        this._sound.volume = this._muteVolume;
      }
    }

    this.emit('mute', this);
  }
});

Object.defineProperty(Sound.prototype, 'volume', {
  get: function() {
    return this._volume;
  },

  set: function(value) {
    // Causes an Index size error in Firefox if you don't clamp the value
    if(Device.firefox && this.usingAudioTag) {
      value = this.game.math.clamp(value, 0, 1);
    }

    if(this._muted) {
      this._muteVolume = value;
      return;
    }

    this._tempVolume = value;
    this._volume = value;

    if(this.usingWebAudio) {
      this.gainNode.gain.value = value;
    } else if(this.usingAudioTag && this._sound) {
      this._sound.volume = value;
    }
  }
});

module.exports = Sound;
