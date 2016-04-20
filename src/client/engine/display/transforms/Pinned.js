
var pixi = require('pixi');

function Pinned() {
  pixi.Transform.call(this);
};

Pinned.prototype = Object.create(pixi.Transform.prototype);
Pinned.prototype.constructor = Pinned;

Pinned.prototype.updateTransform = function(parentTransform) {
  var pt = parentTransform.worldTransform,
      wt = this.worldTransform,
      lt = this.localTransform,
      a, b, c, d;

  a = this._cr * this.scale.x;
  b = this._sr * this.scale.x;
  c = -this._sr * this.scale.y;
  d = this._cr * this.scale.y;

  lt.a = this._cy * a + this._sy * c;
  lt.b = this._cy * b + this._sy * d;
  lt.c = this._nsx * a + this._cx * c;
  lt.d = this._nsx * b + this._cx * d;

  lt.tx = this.position.x - (this.pivot.x * lt.a + this.pivot.y * lt.c);
  lt.ty = this.position.y - (this.pivot.x * lt.b + this.pivot.y * lt.d);

  wt.tx = lt.tx * pt.a + lt.ty * pt.c + pt.tx;
  wt.ty = lt.tx * pt.b + lt.ty * pt.d + pt.ty;
};

module.exports = Pinned;
