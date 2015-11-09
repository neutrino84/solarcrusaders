
var Class = require('../../utils/Class');

function Mixin() {};

Mixin.prototype = {
  mixinPrototype: function(mixin) {
    Class.mixinPrototype(this, mixin, true);
  }
};

module.exports = Mixin;
