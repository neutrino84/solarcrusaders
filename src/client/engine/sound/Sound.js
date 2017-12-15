var EventEmitter = require('eventemitter3'),
    Device = require('../system/Device');

function Sound(game, key, buffer) {
  this.game = game;
  this.name = key;
  this.key = key;
  this.buffer = buffer;
  this.markers = {};
  this.loop = false;
  this.totalDuration = 0;
  this.startTime = 0;
  this.currentTime = 0;
  this.duration = 0;
  this.durationMS = 0;
  this.rate = 1.0;
  this.position = 0;
  this.stopTime = 0;
  this.paused = false;
  this.pausedPosition = 0;
  this.pausedTime = 0;
  this.isPlaying = false;
  this.currentMarker = '';
  this.fadeTween = null;
  this.decoded = false;

  // connect sound to manager
  this.context = this.game.sound.context;
  this.masterGain = this.game.sound.masterGain;
  this.gainNode = this.context.createGain();
  this.gainNode.connect(this.masterGain);

  // private vars
  this._sound = null;
  this._volume = 1.0;
  this._muted = false;
  this._tempMarker = 0;
  this._tempPosition = 0;
  this._tempVolume = 0;
  this._muteVolume = 0;
  this._tempLoop = 0;
  this._paused = false;

  EventEmitter.call(this);
};

Sound.prototype = Object.create(EventEmitter.prototype);
Sound.prototype.constructor = Sound;


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
  if(this.isPlaying) {
    this.currentTime = this.game.clock.time - this.startTime;

    if(this.currentTime >= this.durationMS) {
      if(this.loop) {
        this.emit('loop', this);

        if(this.currentMarker === '') {
          this.currentTime = 0;
          this.startTime = this.game.clock.time;
        } else {
          this.emit('markerComplete', this.currentMarker, this);
          this.play(this.currentMarker, 0, this.volume, true, true);
        }
      } else {
        if(this.currentMarker !== '') {
          this.stop();
        }
      }
    }
  }
};

Sound.prototype.play = function(marker, position, volume, loop, rate, force) {
  if(marker === undefined || marker === false || marker === null) { marker = ''; }
  if(force === undefined) { force = true; }


  // already playing
  if(this.isPlaying && !force) {
    return this;
  }

  // force play
  if(this._sound && this.isPlaying && force) {
    this._sound.stop(0);
    this._sound.disconnect(this.gainNode);
  }

  // must provide marker if audiosprite
  if(marker === '' && Object.keys(this.markers).length > 0) {
    return this;
  }

  // play marker
  if(marker !== '') {
    this.currentMarker = marker;

    if(this.markers[marker]) {
      this.position = this.markers[marker].start;
      this.volume = this.markers[marker].volume;
      this.loop = this.markers[marker].loop;
      this.duration = this.markers[marker].duration;
      this.durationMS = this.markers[marker].durationMS;

      if(volume !== undefined) { this.volume = volume; }
      if(loop !== undefined) { this.loop = loop; }

      this._tempMarker = marker;
      this._tempPosition = this.position;
      this._tempVolume = this.volume;
      this._tempLoop = this.loop;
    } else {
      return this;
    }
  } else {
    position = position || 0;

    if(volume === undefined) { volume = this.volume; }
    if(loop === undefined) { loop = this.loop; }
    if(rate === undefined) { rate = 1.0; }

    this.position = global.Math.max(0, position);
    this.volume = volume;
    this.loop = loop;
    this.rate = rate;
    this.duration = 0;
    this.durationMS = 0;

    this._tempMarker = marker;
    this._tempPosition = position;
    this._tempVolume = volume;
    this._tempLoop = loop;
  }

  this._sound = this.context.createBufferSource();
  this._sound.connect(this.gainNode);
  this._sound.buffer = this.buffer;
  this._sound.playbackRate.value = this.rate;

  if(this.loop && marker === '') {
    this._sound.loop = true;
  }

  if(!this.loop && marker === '') {
    this._sound.onended = this.onEndedHandler.bind(this);
  }

  this.totalDuration = this._sound.buffer.duration;
  if(this.duration === 0) {
    this.duration = this.totalDuration;
    this.durationMS = global.Math.ceil(this.totalDuration * 1000);
  }

  if(this.loop && marker === '') {
    this._sound.start(0, 0);
  } else {
    this._sound.start(0, this.position, this.duration);
  }

  this.isPlaying = true;
  this.currentTime = 0;
  this.startTime = this.game.clock.time;
  this.stopTime = this.startTime + this.durationMS;
  this.emit('play', this);
};

Sound.prototype.restart = function(marker, position, volume, loop) {
  marker = marker || '';
  position = position || 0;
  volume = volume || 1;
  loop = loop || false;

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
    var pausedPosition = Math.max(0, this.position + (this.pausedPosition / 1000)),
        duration = this.duration - (this.pausedPosition / 1000);

    this._sound = this.context.createBufferSource();
    this._sound.buffer = this.buffer;
    this._sound.connect(this.gainNode);

    if(this.loop) {
      this._sound.loop = true;
    }

    if(!this.loop && this.currentMarker === '') {
      this._sound.onended = this.onEndedHandler.bind(this);
    }

    if(this.loop && Device.chrome) {
      this._sound.start(0, pausedPosition);
    } else {
      this._sound.start(0, pausedPosition, duration);
    }

    this.isPlaying = true;
    this.paused = false;
    this.startTime += (this.game.clock.time - this.pausedTime);

    this.emit('resume', this);
  }
};

Sound.prototype.stop = function() {
  // disconnect sound
  if(this.isPlaying && this._sound) {
    this._sound.stop(0);
    this._sound.disconnect(this.gainNode);
  }

  // stop playing
  this.isPlaying = false;

  // emit if not paused
  if(!this.paused) {
    // var prevMarker = this.currentMarker;
    // if(this.currentMarker !== '') {
    //   this.emit('markerComplete', this.currentMarker, this);
    // }
    // this.currentMarker = '';
    if(this.fadeTween !== null) {
      this.fadeTween.stop();
    }
    this.emit('stop', this); //, prevMarker);
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

Sound.prototype.destroy = function() {
  this.stop();
  this.game.sound.remove(this);
};

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
      this.gainNode.gain.setValueAtTime(0, 0)
    } else {
      this._muted = false;
      this.gainNode.gain.setValueAtTime(this._muteVolume, 0)
    }
    this.emit('mute', this);
  }
});

Object.defineProperty(Sound.prototype, 'volume', {
  get: function() {
    return this._volume;
  },

  set: function(value) {
    if(this._muted) {
      this._muteVolume = value;
      return;
    }
    this._tempVolume = value;
    this._volume = value;
    this.gainNode.gain.setValueAtTime(value, 0);
  }
});

module.exports = Sound;
