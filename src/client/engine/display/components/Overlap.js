
var Rectangle = require('../../geometry/Rectangle');

function Overlap() {};

Overlap.prototype = {
  overlap: function(rectangle) {
    return Rectangle.intersects(this.getBounds(), rectangle);
  }
};

module.exports = Overlap;
