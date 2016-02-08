
function WireframeData(gl) {
  this.gl = gl;

  this.color = [0,0,0]; // color split!

  this.points = [];
  this.indices = [];

  this.buffer = gl.createBuffer();
  this.indexBuffer = gl.createBuffer();

  this.mode = 1;
  this.alpha = 1;
  this.dirty = true;

  this.glPoints = null;
  this.glIndices = null;
}

WireframeData.prototype.constructor = WireframeData;

WireframeData.prototype.reset = function () {
  this.points.length = 0;
  this.indices.length = 0;
};

WireframeData.prototype.upload = function () {
  var gl = this.gl;

  this.glPoints = new Float32Array(this.points);

  gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
  gl.bufferData(gl.ARRAY_BUFFER, this.glPoints, gl.STATIC_DRAW);

  this.glIndices = new Uint16Array(this.indices);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.glIndices, gl.STATIC_DRAW);

  this.dirty = false;
};

WireframeData.prototype.destroy = function () {
  this.color = null;
  this.points = null;
  this.indices = null;

  this.gl.deleteBuffer(this.buffer);
  this.gl.deleteBuffer(this.indexBuffer);
  
  this.gl = null;

  this.buffer = null;
  this.indexBuffer = null;

  this.glPoints = null;
  this.glIndices = null;
};

module.exports = WireframeData;
