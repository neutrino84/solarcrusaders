var pixi = require('pixi'),
    earcut = require('earcut'),
    WireframeData = require('./WireframeData'),
    WireframeShader = require('./shaders/WireframeShader');

function WireframeRenderer(renderer) {
  pixi.ObjectRenderer.call(this, renderer);

  this.graphicsDataPool = [];
}

WireframeRenderer.prototype = Object.create(pixi.ObjectRenderer.prototype);
WireframeRenderer.prototype.constructor = WireframeRenderer;

WireframeRenderer.prototype.onContextChange = function() {
  this.shader = new WireframeShader(this.renderer.shaderManager);
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
      shader = this.shader,
      webGLData, webGL;

  if(graphics.dirty || !graphics._webGL[gl.id]) {
    this.updateGraphics(graphics);
  }

  webGL = graphics._webGL[gl.id];
  renderer.blendModeManager.setBlendMode(graphics.blendMode);

  for(var i=0, n=webGL.data.length; i<n; i++) {
    webGLData = webGL.data[i];

    renderer.shaderManager.setShader(shader);

    gl.lineWidth(graphics.lineWidth);

    gl.uniformMatrix3fv(shader.uniforms.translationMatrix._location, false, graphics.worldTransform.toArray(true));
    gl.uniformMatrix3fv(shader.uniforms.projectionMatrix._location, false, renderer.currentRenderTarget.projectionMatrix.toArray(true));
    
    gl.uniform1f(shader.uniforms.alpha._location, graphics.worldAlpha);

    gl.bindBuffer(gl.ARRAY_BUFFER, webGLData.buffer);

    gl.vertexAttribPointer(shader.attributes.aVertexPosition, 2, gl.FLOAT, false, 4 * 6, 0);
    gl.vertexAttribPointer(shader.attributes.aColor, 4, gl.FLOAT, false, 4 * 6, 2 * 4);

    // set the index buffer!
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webGLData.indexBuffer);
    gl.drawElements(gl.LINE_LOOP, webGLData.indices.length, gl.UNSIGNED_SHORT, 0 );

    renderer.drawCount++;
  }
};

WireframeRenderer.prototype.updateGraphics = function(graphics) {
  var i, gl = this.renderer.gl,
      webGL = graphics._webGL[gl.id];

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

    // clear the array and reset the index..
    webGL.data = [];
    webGL.lastIndex = 0;
  }

  var webGLData, data;

  // loop through the graphics datas and construct each one..
  // if the object is a complex fill then the new stencil buffer technique will be used
  // other wise graphics objects will be pushed into a batch..
  for(i=webGL.lastIndex; i<graphics.graphicsData.length; i++) {
    data = graphics.graphicsData[i];
    
    if(!webGL.data.length) {
      webGLData = this.graphicsDataPool.pop() || new WireframeData(webGL.gl);
      webGL.data.push(webGLData);
    } else {
      webGLData = webGL.data[webGL.data.length-1];
    }

    webGLData.dirty = true;

    if(data.type === pixi.SHAPES.RECT) {
      this.buildRectangle(data, webGLData);
    }

    webGL.lastIndex++;
  }

  // upload all the dirty data...
  for(i = 0; i < webGL.data.length; i++) {
    webGLData = webGL.data[i];
    if(webGLData.dirty) {
      webGLData.upload();
    }
  }
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

pixi.WebGLRenderer.registerPlugin('wireframe', WireframeRenderer);

module.exports = WireframeRenderer;
