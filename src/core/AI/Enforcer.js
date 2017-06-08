var engine = require('engine'),
    client = require('client'),
    Basic = require('./Basic');

function Enforcer(ship, home) {
  Basic.call(this, ship);

  this.ship = ship;
  this.type = 'enforcer';
  this.master = ship.master;
  this.attacking = false;
  this.repairing = false;

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;

};

Enforcer.prototype = Object.create(Basic.prototype);

Enforcer.prototype.constructor = Enforcer;

// Enforcer.prototype.scanner = function() {

//   var target, targets, scan, distance, size,
//       rnd = this.game.rnd,
//       sensor = this.sensor,
//       settings = this.settings,
//       ships = this.manager.ships,
//       ship = this.ship,
//       priority = {
//         enemy: {},
//         friendly: {}
//       },
//       ascending = function(a, b) {
//         return a-b;
//       };




//   if(this.master){

//     master = ships[this.master];
//     position = master.movement.position
//     if(this.attacking){return}

//     size = master.data.size / 3;
//     position.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));

//     // ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);

//     // ship.movement.plot({ x: position.x - ship.movement.position.x, y: position.y - ship.movement.position.y })
//   } else {
//       // Battleship scan nearby ships
//       var scavengerPrioritizer = 0;

//       for(var s in ships) {
//         scan = ships[s];
//         p2 = scan.movement.position;

//         if(scan.disabled) { continue; }
//         if(sensor.contains(p2.x, p2.y)) {
//           if(!this.friendly(scan)) {
//             if(scan.data.chassis === 'scavengers-x03c' || scan.data.chassis === 'scavengers-x04d'){
//               priority.enemy[scavengerPrioritizer] = scan;
//               scavengerPrioritizer++
//               console.log('got here prioritizer is ', scavengerPrioritizer)
//             } else {
//               priority.enemy[scan.data.health] = scan;
//             }
//           } else {
//             priority.friendly[scan.data.health] = scan;
//           }
//         }
//       }

//       // find weakest
//       targets = Object.keys(priority.enemy);
//       // targets.length && this.engage(priority.enemy[targets.sort(ascending)[0]]);
//       if(!targets.length){
//       };
//   };
// };

Enforcer.prototype.plot = function(){
  //blank
  var rnd = this.game.rnd,
      ship = this.ship,
      ships = this.manager.ships,
      p1 = ship.movement.position,
      sensor = this.sensor,
      settings = this.settings,
      offset = this.offset,
      position, size;

  sensor.setTo(p1.x, p1.y, settings.sensor.range);
      
    // console.log('in plot')
  // plot destination
  if(!this.retreat && this.target) {

    size = this.target.data.size * 4;
    offset.copyFrom(this.target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);

  } 
  else if(!this.target && this.master){
    // this.scanner();

    master = ships[this.master];
    position = master.movement.position
    // if(this.attacking){return}

    // if(master.ai.target){
    //   this.target = master.ai.target;
    //   this.plot();
    //   return
    // }


    size = master.data.size / 3;
    // position.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    //^ why the fuck is this affecting the master ship's movement???
    ship.movement.plot({ x: position.x - ship.movement.position.x, y: position.y - ship.movement.position.y })
  } 
  else if(rnd.frac() < 0.07){
    //^ this is why newly spawned ships sometimes just sit there before moving
    p2 = this.getHomePosition();
    // console.log('ENFORCER2. coordinates are x : ', p2.x, ' y : ', p2.y)
    ship.movement.plot({ x: p2.x-p1.x, y: p2.y-p1.y });
  }
};

// Enforcer.prototype.engage = function(target, type){
//   var ships = this.manager.ships,
//   ship = this.ship,
//   health = ship.data.health / ship.config.stats.health;
//     if(!type){return}

//     if(this.target === null && type === 'repair'){
//       this.repairing = true;
//       this.target = target;
//       console.log('in engage', this.target)

//       this.repairer && this.game.clock.events.remove(this.repairer);
//       this.repairer = this.game.clock.events.loop(ship.data.rate, this.repair, this);
//     }

//     if(this.target === null && !this.friendly(target) && type === 'attack'){
//       this.attacking = true;
//       this.target = target;
//       // console.log('B.E. Engaging target ', this.target)
//       this.attacker && this.game.clock.events.remove(this.attacker);
//       this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

//       // this.disengager && this.game.clock.events.remove(this.disengager);
//       // this.disengager = this.game.clock.events.add(this.settings.disengage, this.disengage, this);
//     } else if(this.target){
//       this.target = target;
//       this.attacker && this.game.clock.events.remove(this.attacker);
//       this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);
//     }
    
//     if(this.game.rnd.frac() < 0.5) {
//       ship.activate('piercing');
//     }

//     // engage countermeasures
//     if(this.game.rnd.frac() < 0.10) {
//       // ship.activate('booster');

//       if(health < 0.5) {
//         ship.activate('shield');
//       }
//       // if(health < 0.5) {
//       //   ship.activate('heal');
//       // }
//     };
//   // };
// };

Enforcer.prototype.update = function() {
  var ship = this.ship,
      ships = this.manager.ships,
      settings = this.settings,
      rnd = this.game.rnd,
      master, distance, p1, p2, 
      size, health, masterHealth;

  if(ship.master && !this.attacking){
    master = this.manager.ships[ship.master];
    if(!master.disabled && master.ai.target){
      this.engage(master.ai.target) 
    }
  } else if(ship.master && this.attacking){
    master = this.manager.ships[ship.master];
    distance = master.movement.position.distance(ship.movement.position);
    if(distance > 2000){
      // console.log('enforcers returning')
      this.disengage();
      this.plot();
    }
  }

  // health = ship.data.health / ship.config.stats.health;
  // console.log('master is ', master)
  // console.log(this.manager.ships[ship.master])
  // console.log('masterHealth is ', masterHealth)
  // debugger
  // debugger
  // masterHealth = master.data.health / master.config.stats.health;

  // retreat due to damage
  if(health < settings.escape.health) {
    this.retreat = true;
  } else {
    this.retreat = false;
  }

  // target ships
  if(!this.master && rnd.frac() < 0.8) {
    this.scanner();
  };

  this.plot();
};

Enforcer.prototype.attack = function() {
  var ship = this.ship,
      settings = this.settings,
      offset = this.offset,
      rnd = this.game.rnd,
      target, size,
      point = {};

  // attack sequence
  if(this.target && !this.target.disabled && !this.friendly(this.target)) {
    target = this.target;
    this.attacking = true;
    size = target.data.size * settings.sensor.aim;
    offset.copyFrom(target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));

    // attack
    ship.attack({
      uuid: ship.uuid,
      target: target.uuid,
      targ: {
        x: offset.x,
        y: offset.y
      }
    });
  }
  if(this.target.disabled){
    this.disengage();
  };
};

Enforcer.prototype.disengage = function() {
  this.target = null;
  this.attacking = false;
  this.repairing = false;
  this.attacker && this.game.clock.events.remove(this.attacker);
};

Enforcer.prototype.regroup = function() {
  var ships = this.manager.ships,
      ship = this.ship,
      master = ships[this.master],
      position = master.movement.position,
      distance = engine.Point.distance(ship, master);

  this.disengage();
  console.log(distance)
  if(distance > 400) {
      ship.activate('booster');
  }
  ship.movement.plot({ x: position.x - ship.movement.position.x, y: position.y - ship.movement.position.y })
};

Enforcer.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor,
      ships = this.manager.ships,
      master = ships[this.master], position;
      // position = master.movement.position;\

      return this.manager.generateRandomPosition(30048);

  //     if(master){
  //       position = master.movement.position;
  //     } else {
  //       position = {x: 2048, y: -2048}
  //     }

  //     sensor.setTo(position.x, position.y, 1000);
  // return this.sensor.random();
};

module.exports = Enforcer;
