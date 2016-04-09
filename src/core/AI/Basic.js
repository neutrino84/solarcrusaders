
function Basic(ship) {
  this.ship = ship;
  this.manager = ship.manager;
  
  this.type = 'basic';
};

Basic.prototype.constructor = Basic;

Basic.prototype.update = function() {
  var manager = this.manager,
      ships = manager.ships,
      ship = this.ship;
  
  if(global.Math.random() > 0.88) {
    // plot ship
    manager._plot(ship, manager.generateRandomPosition(4096));
  
    // hedera attack random target
    random = manager.getRandomShip();
  
    if(ship.data.race === 'hederaa' || ship.data.race === 'mechan') {
      if(random !== ship) {
        target = ships[random.uuid];
        if(target && ship.damage > 0) {
          this.battle(ship, target);
        }
      }
    }
  }
};

Basic.prototype.defence = function(battle) {
  var manager = this.manager,
      ships = manager.ships,
      origin = ships[battle.origin],
      target = ships[battle.target],
      health = target.health / target.config.stats.health;
  
  // start moving around
  if(!target.movement.animation.isPlaying) {
    manager._plot(target, manager.generateRandomPosition(4096));
  }

  // fire back
  if(target.systems['targeting']) {
    if(!manager.battles[target.uuid] || manager.battles[target.uuid].target !== origin.uuid) {
      this.battle(target, origin);
    }
  }

  // activate shielding
  if(target.systems['shield'] && health < 0.80) {
    target.activate('shield');
  }
};

Basic.prototype.battle = function(origin, target, room) {
  var manager = this.manager,
      room = room || global.Math.floor(global.Math.random() * target.rooms.length),
      battle = { origin: origin.uuid, target: target.uuid, id: room, room: target.rooms[room].system };
  
  //.. TODO: cleanup
  manager.sockets.io.sockets.emit('ship/targeted', battle);
  manager.battles[origin.uuid] = battle;
  //..
};

module.exports = Basic;
