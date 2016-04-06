var pixi = require('pixi'),
    earcut = require('earcut'),
    WireframeData = require('./WireframeData'),
    WireframeShader = require('./shaders/WireframeShader');

function WireframeRenderer(renderer) {
  pixi.ObjectRenderer.call(this, renderer);

  this.gl = renderer.gl;
  this.primitiveShader = null;
  this.graphicsDataPool = [];
  
  this.CONTEXT_UID = 0;
}

WireframeRenderer.prototype = Object.create(pixi.ObjectRenderer.prototype);
WireframeRenderer.prototype.constructor = WireframeRenderer;

WireframeRenderer.prototype.onContextChange = function() {
  this.gl = this.renderer.gl;
  this.CONTEXT_UID = this.renderer.CONTEXT_UID;
  this.primitiveShader = new WireframeShader(this.gl);
};

WireframeRenderer.prototype.destroy = function () {
  pixi.ObjectRenderer.prototype.destroy.call(this);

  for(var i = 0; i < this.graphicsDataPool.length; ++i) {
    this.graphicsDataPool[i].destroy();
  }

  this.graphicsDataPool = null;
};

WireframeRenderer.prototype.render = function(graphics) {
  var renderer = this.renderer,
      gl = renderer.gl,
      shader = this.primitiveShader,
      webGLData, webGL, shaderTemp;

  if(graphics.dirty || !graphics._webGL[gl.id]) {
    this.updateGraphics(graphics);
  }

  webGL = graphics._webGL[gl.id];

  renderer.bindShader(shader);
  renderer.state.setBlendMode(graphics.blendMode);

  for(var i=0, n=webGL.data.length; i<n; i++) {
    webGLData = webGL.data[i];
    shaderTemp = webGLData.shader;

    renderer.bindShader(shaderTemp);

    shaderTemp.uniforms.translationMatrix = graphics.transform.worldTransform.toArray(true);
    shaderTemp.uniforms.tint = pixi.utils.hex2rgb(graphics.tint);
    shaderTemp.uniforms.alpha = graphics.worldAlpha;

    webGLData.vao.bind()
      .draw(gl.LINE_LOOP, webGLData.indices.length)
      .unbind();
  }
};

WireframeRenderer.prototype.updateGraphics = function(graphics) {
  var i, gl = this.renderer.gl,
      webGL = graphics._webGL[gl.id],
      webGLData, data;

  if(!webGL) {
    webGL = graphics._webGL[gl.id] = { lastIndex: 0, data: [], gl: gl };
  }

  graphics.dirty = false;

  if(graphics.clearDirty) {
    graphics.clearDirty = false;

    for(i = 0; i < webGL.data.length; i++) {
      var graphicsData = webGL.data[i];
          graphicsData.reset();
      this.graphicsDataPool.push( graphicsData );
    }

    webGL.data = [];
    webGL.lastIndex = 0;
  }

  // loop through the graphics datas and construct each one..
  // if the object is a complex fill then the new stencil buffer technique will be used
  // other wise graphics objects will be pushed into a batch..
  for(i=webGL.lastIndex; i<graphics.graphicsData.length; i++) {
    data = graphics.graphicsData[i];

    webGLData = this.getWebGLData(webGL, 0);

    if(data.type === pixi.SHAPES.RECT) {
      this.buildRectangle(data, webGLData);
    } else if(data.type === pixi.SHAPES.CIRC) {
      this.buildCircle(data, webGLData);
    }

    webGL.lastIndex++;
  }

  // upload all the dirty data...
  for(i=0; i<webGL.data.length; i++) {
    webGLData = webGL.data[i];
    if(webGLData.dirty) {
      webGLData.upload();
    }
  }
};

WireframeRenderer.prototype.getWebGLData = function(webGL, type) {
  var webGLData = webGL.data[webGL.data.length-1];

  if(!webGLData || webGLData.points.length > 320000) {
    webGLData = this.graphicsDataPool.pop() ||
      new WireframeData(this.renderer.gl, this.primitiveShader, this.renderer.state.attribsState);
    webGLData.reset(type);
    webGL.data.push(webGLData);
  }

  webGLData.dirty = true;

  return webGLData;
};

WireframeRenderer.prototype.buildRectangle = function(graphicsData, webGLData) {
  var rectData = graphicsData.shape,
      x = rectData.x,
      y = rectData.y,
      width = rectData.width,
      height = rectData.height;
  
  var color = pixi.utils.hex2rgb(graphicsData.lineColor),
      alpha = graphicsData.lineAlpha,
      r = color[0] * alpha,
      g = color[1] * alpha,
      b = color[2] * alpha,
      verts = webGLData.points,
      indices = webGLData.indices,
      vertPos = verts.length/6;

  verts.push(x, y);
  verts.push(r, g, b, alpha);

  verts.push(x + width, y);
  verts.push(r, g, b, alpha);

  verts.push(x + width, y + height);
  verts.push(r, g, b, alpha);

  verts.push(x , y + height);
  verts.push(r, g, b, alpha);

  indices.push(vertPos, vertPos+1, vertPos+2, vertPos+3);
};

WireframeRenderer.prototype.buildCircle = function(graphicsData, webGLData) {
  var circleData = graphicsData.shape,
      x = circleData.x,
      y = circleData.y,
      width = circleData.radius,
      height = circleData.radius,
      totalSegs = Math.floor(5 * Math.sqrt(circleData.radius)),
      seg = (Math.PI * 2) / totalSegs;

  var color = pixi.utils.hex2rgb(graphicsData.lineColor),
      alpha = graphicsData.lineAlpha,
      r = color[0] * alpha,
      g = color[1] * alpha,
      b = color[2] * alpha,
      verts = webGLData.points,
      indices = webGLData.indices,
      vecPos = verts.length/6;

  for(var i = 0; i<totalSegs+1; i++) {
    verts.push(x + Math.sin(seg * i) * width, y + Math.cos(seg * i) * height, r, g, b, alpha);
    indices.push(vecPos++);
  }
};

pixi.WebGLRenderer.registerPlugin('wireframe', WireframeRenderer);

module.exports = WireframeRenderer;
