
function TilemapPathing(map, layerName, tilesetName) {
  this._tilemap = map;
  this._layerIndex = this._tilemap.getLayerIndex(layerName);
  this._tilesetIndex = this._tilemap.getTilesetIndex(tilesetName);
 
  this._open;
  this._closed;
  this._visited;

  this._useDiagonal = true;
  this._findClosest = true;

  this._walkablePropName = 'walkable';
  this._distanceFunction = TilemapPathing.DISTANCE_EUCLIDIAN;

  this._lastPath = null;
  this._debug = true;
};

TilemapPathing.COST_ORTHOGONAL = 1;
TilemapPathing.COST_DIAGONAL = TilemapPathing.COST_ORTHOGONAL * global.Math.sqrt(2);
TilemapPathing.DISTANCE_MANHATTAN = 'distManhattan';
TilemapPathing.DISTANCE_EUCLIDIAN = 'distEuclidian';

TilemapPathing.prototype.constructor = TilemapPathing;

TilemapPathing.prototype.updateMap = function() {
  var tile;
  var index;
  var walkable;
  var properties;
  var tileset = this._tilemap.tilesets[this._tilesetIndex];

  // for each tile, add a default TilemapPathingNode with x, y 
  // and walkable properties according to the tilemap/tileset datas
  for(var y=0; y < this._tilemap.height; y++) {
    for(var x=0; x < this._tilemap.width; x++) {
      tile = this._tilemap.layers[this._layerIndex].data[y][x];
      index = tile.index - tileset.firstgid;

      if(tile.index < 0) { continue; }

      properties = tileset.tileProperties[index];
      walkable = properties && properties.walkable === 'true' ? true : false;
      tile.properties.astarNode = new TilemapPathing.TilemapPathingNode(x, y, walkable, properties);
    }
  }
};

TilemapPathing.prototype.findPath = function(startPoint, goalPoint) {
  var path = new TilemapPathing.TilemapPathingPath();
  var start = this._tilemap.layers[this._layerIndex].data[startPoint.y][startPoint.x].properties.astarNode; //:TilemapPathingNode;
  var goal = this._tilemap.layers[this._layerIndex].data[goalPoint.y][goalPoint.x].properties.astarNode
  
  path.start = start;
  path.goal = goal;
  
  this._open = [];
  this._closed = [];
  this._visited = [];
  
  this._open.push(start);
  
  start.g = 0;
  start.h = this[this._distanceFunction](start, goal);
  start.f = start.h;
  start.parent = null;
  
  // loop until there are no more nodes to search
  while(this._open.length > 0) {
    // find lowest f in this._open
    var f = Infinity;
    var x;
    for(var i=0; i<this._open.length; i++) {
      if(this._open[i].f < f) {
        x = this._open[i];
        f = x.f;
      }
    }
   
    // solution found, return solution
    if(x == goal) {
      path.nodes = this.reconstructPath(goal);
      this._lastPath = path;
      if(this._debug === true)
        path.visited = this._visited;
      return path;
    }    
   
    // close current node
    this._open.splice(this._open.indexOf(x), 1);
    this._closed.push(x);
   
    // then get its neighbors       
    var n = this.neighbors(x);
    for(var j=0; j < n.length; j++) {
      var y = n[j];
         
      if(-1 != this._closed.indexOf(y)) {
        continue;
      }
     
      var g = x.g + y.travelCost;
      var better = false;
     
      //Add the node for being considered next loop.
      if(-1 == this._open.indexOf(y)) {
        this._open.push(y);
        better = true;
        if(this._debug === true) this.visit(y);
      } else if(g < y.g) {
        better = true;
      }

      if(better) {
        y.parent = x;
        y.g = g;
        y.h = this[this._distanceFunction](y, goal);
        y.f = y.g + y.h;
      }
    }
  }

  // if no solution found, does A* try to return the closest result?
  if(this._findClosest === true) {
    var min = Infinity;
    var closestGoal, node, dist;
    for(var i=0, ii=this._closed.length; i<ii; i++) {
      node = this._closed[i];

      var dist = this[this._distanceFunction](goal, node);
      if(dist < min) {
        min = dist;
        closestGoal = node;
      }
    }

    // reconstruct a path a path from the closestGoal
    path.nodes = this.reconstructPath(closestGoal);
    
    if(this._debug === true)
      path.visited = this._visited;
  }

  this._lastPath = path;

  return path;                              
};

TilemapPathing.prototype.reconstructPath = function(n) {
  var solution = [];
  var nn = n;
  while(nn.parent) {
    solution.push({ x: nn.x, y: nn.y });
    nn = nn.parent;
  }
  return solution;
};

TilemapPathing.prototype.visit = function(node) {
  for(var i in this._visited) {
    if(this._visited[i] == node) {
      return;
    }
  }
  this._visited.push(node);
};

TilemapPathing.prototype.neighbors = function(node) {
  var x = node.x;
  var y = node.y;
  var n = null;
  var neighbors = [];
  var properties = node.properties || {};
  var map = this._tilemap.layers[this._layerIndex].data;

  // west left
  if(x > 0 && properties.collisionLeft === 'false') {
    n = map[y][x-1].properties.astarNode;
    if(n && n.walkable) {
      n.travelCost = TilemapPathing.COST_ORTHOGONAL;
      neighbors.push(n);
    }
  }

  // east right
  if(x < this._tilemap.width-1 && properties.collisionRight === 'false') {
    n = map[y][x+1].properties.astarNode;
    if(n && n.walkable) {
      n.travelCost = TilemapPathing.COST_ORTHOGONAL;
      neighbors.push(n);
    }
  }

  // north top
  if(y > 0 && properties.collisionTop === 'false') {
    n = map[y-1][x].properties.astarNode;
    if(n && n.walkable) {
      n.travelCost = TilemapPathing.COST_ORTHOGONAL;
      neighbors.push(n);
    }
  }

  // south bottom
  if(y < this._tilemap.height-1 && properties.collisionBottom === 'false') {
    n = map[y+1][x].properties.astarNode;
    if(n && n.walkable) {
      n.travelCost = TilemapPathing.COST_ORTHOGONAL;
      neighbors.push(n);
    }
  }
 
  // if diagonals aren't used do not
  // search for other neighbors and 
  // return orthogonal search result
  if(this._useDiagonal === false) {
    return neighbors;
  }
 
  // northwest top left
  if(x > 0 && y > 0 &&
      properties.collisionTop === 'false' &&
      properties.collisionLeft === 'false') {
    n = map[y-1][x-1].properties.astarNode;
    if(n && n.walkable && 
        n.properties.collisionRight === 'false' &&
        n.properties.collisionBottom === 'false') {
      n.travelCost = TilemapPathing.COST_DIAGONAL;
      neighbors.push(n);
    }
  }

  // northeast top right 
  if(x < this._tilemap.width-1 && y > 0 &&
      properties.collisionTop === 'false' &&
      properties.collisionRight === 'false') {
    n = map[y-1][x+1].properties.astarNode;
    if(n && n.walkable &&
        n.properties.collisionLeft === 'false' &&
        n.properties.collisionBottom === 'false') {
      n.travelCost = TilemapPathing.COST_DIAGONAL;
      neighbors.push(n);
    }
  }

  // southwest bottom left
  if(x > 0 && y < this._tilemap.height-1 &&
      properties.collisionBottom === 'false' &&
      properties.collisionLeft === 'false') {
    n = map[y+1][x-1].properties.astarNode;
    if(n && n.walkable &&
        n.properties.collisionRight === 'false' &&
        n.properties.collisionTop === 'false') {
      n.travelCost = TilemapPathing.COST_DIAGONAL;
      neighbors.push(n);
    }
  }

  // southeast bottom right
  if(x < this._tilemap.width-1 && y < this._tilemap.height-1 &&
      properties.collisionRight === 'false' &&
      properties.collisionBottom === 'false') {
    n = map[y+1][x+1].properties.astarNode;
    if(n && n.walkable &&
        n.properties.collisionTop === 'false' &&
        n.properties.collisionLeft === 'false') {
      n.travelCost = TilemapPathing.COST_DIAGONAL;
      neighbors.push(n);
    }
  }
 
  return neighbors;
};

TilemapPathing.prototype.distManhattan = function(a, b) {
  return global.Math.abs(a.x-b.x) + global.Math.abs(a.y-b.y);
};

TilemapPathing.prototype.distEuclidian = function(a, b) {
  return global.Math.sqrt(global.Math.pow((a.x-b.x), 2) + global.Math.pow((a.y-b.y), 2));
};

TilemapPathing.TilemapPathingNode = function(x, y, walkable, properties) {
  this.x = x;
  this.y = y;

  this.g = 0;
  this.h = 0;
  this.f = 0;

  this.parent;

  this.walkable = walkable;
  this.properties = properties;

  this.travelCost;
};

TilemapPathing.TilemapPathingPath = function(nodes, start, goal) {
  this.nodes = nodes || [];
  this.start = start || null;
  this.goal = goal || null;
  this.visited = [];
};

module.exports = TilemapPathing;

/*
Phaser.Utils.Debug.prototype.pathingInfo = function(astar, x, y, color, showVisited) {
  if(this.context == null)
    return;
  
  var path = astar._lastPath,
      tilemap  = astar._tilemap,
      length = path ? path.nodes.length : 0,
      color = color || 'rgb(255,255,255)',
      cameraXY;

  game.debug.start(x, y, color);

  if(length > 0) {
    var node = path.nodes[0];
    
    this.context.strokeStyle = color;
    this.context.beginPath();
    this.context.moveTo(
      (node.x * tilemap.tileWidth) + (tilemap.tileWidth / 2) - game.camera.view.x,
      (node.y * tilemap.tileHeight) + (tilemap.tileHeight / 2) - game.camera.view.y
    );

    for(var i=0; i<length; i++) {
      node = path.nodes[i];
      this.context.lineTo(
        (node.x * tilemap.tileWidth) + (tilemap.tileWidth / 2) - game.camera.view.x,
        (node.y * tilemap.tileHeight) + (tilemap.tileHeight / 2) - game.camera.view.y
      );
    }

    this.context.lineTo(
      (path.start.x * tilemap.tileWidth) + (tilemap.tileWidth / 2) - game.camera.view.x,
      (path.start.y * tilemap.tileHeight) + (tilemap.tileHeight / 2) - game.camera.view.y
    );
    this.context.stroke(); 

    // draw circles on visited nodes
    if(showVisited !== false) {
      var visitedNode;
      for(var j=0; j < path.visited.length; j++) {
        visitedNode = path.visited[j];
        this.context.beginPath();
        this.context.arc(
          (visitedNode.x * tilemap.tileWidth) + (tilemap.tileWidth / 2) - game.camera.view.x,
          (visitedNode.y * tilemap.tileHeight) + (tilemap.tileHeight / 2) - game.camera.view.y,
            2, 0, global.Math.PI * 2, true
        );
        this.context.stroke(); 
      }
    }
  }

  this.line('Path length: ' + length);
  this.line('Distance func: ' + astar._distanceFunction);
  this.line('Use diagonal: ' + astar._useDiagonal);
  this.line('Find Closest: ' + astar._findClosest);

  game.debug.stop();
};
*/
