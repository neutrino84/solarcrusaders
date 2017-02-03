
var engine = require('engine'),
    Energy = require('./Energy'),
    Projectile = require('./Projectile'),
    Pulse = require('./Pulse');

function Launcher(parent) {
  this.parent = parent;
  this.game = parent.game;
  this.ship = parent.ship;
  this.data = parent.data;

  this.isDone = false;
  this.isRunning = false;

  this.items = [];
  this.types = {
    rocket: Projectile,
    energy: Energy,
    pulse: Pulse
  }
};

Launcher.prototype.constructor = Launcher;

Launcher.prototype.start = function(origin, destination, distance) {
  var item,
      data = this.data,
      items = this.items,
      length = items.length,
      spawn = this.data.spawn,
      time = this.data.projection * distance;

  if(distance <= this.data.range) {
    if(data.type === 'energy') {
      for(var i=0; i<length; i++) {
        item = items[i];

        if(item.isRunning) {
          spawn--;
        }
      }
    }

    for(var i=0; i<spawn; i++) {
      item = new this.types[data.type](this.parent);
      item.start(origin, destination, time);
      items.push(item);
    }

    this.isRunning = true;
  }
};

Launcher.prototype.hit = function(ship) {
  var item,
      items = this.items,
      length = items.length;
  for(var i=0; i<length; i++) {
    item = items[i];
    item.hit && item.hit(ship);
  }
};

Launcher.prototype.update = function(origin) {
  var item,
      items = this.items,
      length = items.length,
      remove = [],
      dest = {};

  if(!this.isRunning) { return; }
  
  // animate
  for(var i=0; i<length; i++) {
    item = items[i];
    item.update(origin);

    if(!item.isRunning) {
      item.destroy();
      remove.push(items.indexOf(item));
    }
  }

  while(remove.length > 0) {
    items.splice(remove.pop(), 1);
  }

  // stop
  if(length == 0) {
    this.isRunning = false;
  }
};

Launcher.prototype.destroy = function() {
  this.isRunning = false;

  while(this.items.length > 0) {
    this.items.pop().destroy();
  }

  this.parent = this.game =
    this.data = undefined;
};

module.exports = Launcher;
