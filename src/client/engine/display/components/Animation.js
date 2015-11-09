
function Animation() {};

Animation.prototype = {
  play: function(name, frameRate, loop, killOnComplete) {
    if(this.animations) {
      return this.animations.play(name, frameRate, loop, killOnComplete);
    }
  }
};

module.exports = Animation;
