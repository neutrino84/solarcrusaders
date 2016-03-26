
var pixi = require('pixi'),
    fs = require('fs');

function ShieldShader() {
  pixi.AbstractFilter.call(this, null,
    fs.readFileSync(__dirname + '/ShieldShader.frag', 'utf8'), {
      time: { type: '1f', value: 0 }
    }
  );
}

ShieldShader.prototype = Object.create(pixi.AbstractFilter.prototype);
ShieldShader.prototype.constructor = ShieldShader;

Object.defineProperties(ShieldShader.prototype, {
  time: {
    get: function() {
      return this.uniforms.time.value;
    },
    set: function(value) {
      this.uniforms.time.value = value;
    }
  }
});

module.exports = ShieldShader;
