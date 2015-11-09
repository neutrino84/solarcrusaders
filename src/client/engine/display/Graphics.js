var pixi = require('pixi'),
    Const = require('../const'),
    Core = require('./components/Core'),
    Destroy = require('./components/Destroy'),
    InWorld = require('./components/InWorld'),
    Point = require('../geometry/Point');

function Graphics(game) {
  this.type = Const.GRAPHICS;

  pixi.Graphics.call(this);

  Core.init.call(this, game, '', null);
};

Graphics.prototype = Object.create(pixi.Graphics.prototype);
Graphics.prototype.constructor = Graphics;

Core.install.call(Graphics.prototype, [
  // 'Angle',
  'Mixin',
  'AutoCull',
  'Bounds',
  'Destroy',
  'FixedToCamera',
  'InWorld',
  'InputEnabled',
  'Overlap'//,
  // 'Reset'
]);

Graphics.prototype.preUpdateInWorld = InWorld.preUpdate;
Graphics.prototype.preUpdateCore = Core.preUpdate;

Graphics.prototype.preUpdate = function() {
  this.preUpdateInWorld()
  this.preUpdateCore();
};

Graphics.prototype.destroy = function(destroyChildren) {
  this.clear();
  Destroy.prototype.destroy.call(this, destroyChildren);
};

Graphics.prototype.drawTriangle = function(points, cull) {
  if(cull === undefined) { cull = false; }
  
  var triangle = new Polygon(points);
  if(cull) {
    var cameraToFace = new Point(this.game.camera.x - points[0].x, this.game.camera.y - points[0].y),
        ab = new Point(points[1].x - points[0].x, points[1].y - points[0].y),
        cb = new Point(points[1].x - points[2].x, points[1].y - points[2].y),
        faceNormal = cb.cross(ab);

    if(cameraToFace.dot(faceNormal) > 0) {
      this.drawPolygon(triangle);
    }
  } else {
    this.drawPolygon(triangle);
  }
};

Graphics.prototype.drawTriangles = function(vertices, indices, cull) {
  if(cull === undefined) { cull = false; }

  var point1 = new Point();
      point2 = new Point(),
      point3 = new Point(),
      points = [],
      i;

  if(!indices) {
    if(vertices[0] instanceof Point) {
      for(i = 0; i < vertices.length / 3; i++) {
        this.drawTriangle([vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]], cull);
      }
    } else {
      for(i = 0; i < vertices.length / 6; i++) {
        point1.x = vertices[i * 6 + 0];
        point1.y = vertices[i * 6 + 1];
        point2.x = vertices[i * 6 + 2];
        point2.y = vertices[i * 6 + 3];
        point3.x = vertices[i * 6 + 4];
        point3.y = vertices[i * 6 + 5];
        this.drawTriangle([point1, point2, point3], cull);
      }
    }
  } else {
    if(vertices[0] instanceof Point) {
      for(i = 0; i < indices.length /3; i++) {
        points.push(vertices[indices[i * 3 ]]);
        points.push(vertices[indices[i * 3 + 1]]);
        points.push(vertices[indices[i * 3 + 2]]);

        if(points.length === 3) {
          this.drawTriangle(points, cull);
          points = [];
        }
      }
    } else {
      for(i = 0; i < indices.length; i++) {
        point1.x = vertices[indices[i] * 2];
        point1.y = vertices[indices[i] * 2 + 1];
        points.push(point1.copyTo({}));

        if(points.length === 3) {
          this.drawTriangle(points, cull);
          points = [];
        }
      }
    }
  }
};

module.exports = Graphics;
