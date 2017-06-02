var engine = require('engine'),
    client = require('client'),
    Basic = require('./Basic');

function Squadron(ship, home) {
  Basic.call(this, ship);

  this.ship = ship;
  this.type = 'squadron';
  this.master = ship.master;
  this.attacking = false;
  this.repairing = false;

  this.settings = client.AIConfiguration[this.type];

  this.friendlies = this.settings.friendly;

};

Squadron.prototype = Object.create(Basic.prototype);

Squadron.prototype.constructor = Squadron;

Squadron.prototype.scanner = function() {
  //.. scan for user/target
  var target, targets, scan, distance,
      sensor = this.sensor,
      settings = this.settings,
      ships = this.manager.ships,
      ship = this.ship,
      master = ships[this.master],
      position = master.movement.position;
  if(this.attacking){return}
  ship.movement.plot({ x: position.x - ship.movement.position.x, y: position.y - ship.movement.position.y })

};

Squadron.prototype.plot = function(){
  //blank
  var rnd = this.game.rnd,
      ship = this.ship,
      p1 = ship.movement.position,
      sensor = this.sensor,
      settings = this.settings,
      offset = this.offset,
      size;

  sensor.setTo(p1.x, p1.y, settings.sensor.range);
      
    // console.log('in plot')
  // plot destination
  if(!this.retreat && this.target) {
    size = this.target.data.size * 4;
    offset.copyFrom(this.target.movement.position);
    offset.add(rnd.realInRange(-size, size), rnd.realInRange(-size, size));
    ship.movement.plot({ x: this.offset.x-p1.x, y: this.offset.y-p1.y }, this.throttle);
  } else if(!this.target) {
    // console.log('BOOBOO')
    this.scanner();
  };
};

Squadron.prototype.engage = function(target, type){
  var ships = this.manager.ships,
  ship = this.ship,
  health = ship.data.health / ship.config.stats.health;
    if(!type){return}

    if(this.target === null && type === 'repair'){
      this.repairing = true;
      this.target = target;

      this.repairer && this.game.clock.events.remove(this.repairer);
      this.repairer = this.game.clock.events.loop(ship.data.rate, this.repair, this);
    }

    if(this.target === null && !this.friendly(target) && type === 'attack'){
      this.attacking = true;
      this.target = target;
      // console.log('B.E. Engaging target ', this.target)
      this.attacker && this.game.clock.events.remove(this.attacker);
      this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);

      // this.disengager && this.game.clock.events.remove(this.disengager);
      // this.disengager = this.game.clock.events.add(this.settings.disengage, this.disengage, this);
    } else if(this.target){
      this.target = target;
      this.attacker && this.game.clock.events.remove(this.attacker);
      this.attacker = this.game.clock.events.loop(ship.data.rate, this.attack, this);
    }
    
    if(this.game.rnd.frac() < 0.5) {
      ship.activate('piercing');
    }

    // engage countermeasures
    if(this.game.rnd.frac() < 0.10) {
      // ship.activate('booster');

      if(health < 0.5) {
        ship.activate('shield');
      }
      // if(health < 0.5) {
      //   ship.activate('heal');
      // }
    };
  // };
};

Squadron.prototype.update = function() {
  var ship = this.ship,
      settings = this.settings,
      rnd = this.game.rnd,
      master = this.manager.ships[ship.master],
      p1, p2, size, health, masterHealth;


  health = ship.data.health / ship.config.stats.health;
  masterHealth = master.data.health / master.config.stats.health;
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
  if(rnd.frac() < 0.8) {
    this.scanner();
  };

  // trying to make it so repair ship can target the squad ships
  // for(var s in master.squadron){
  //   var squadShip = master.squadron[s],
  //       squadShipHealth = squadShip.data.health / squadShip.config.stats.health;
  //   if(this.ship.chassis === 'squad-repair' && !this.target && squadShipHealth < 1){
  //     // console.log('squad taking damage')
  //     if(this.ship.chassis === 'squad-repair' && squadShipHealth < 0.9 && !this.repairing){
  //       console.log('engaging squadShip')
  //       this.engage(squadShip, 'repair')
  //     }
  //   }
  // };

  if(this.ship.chassis === 'squad-repair' && masterHealth < 0.75 && !this.repairing){
    // console.log(masterHealth, ' engage repair')
    this.engage(master, 'repair')
  }
  if(this.ship.chassis === 'squad-repair' && masterHealth > 0.95 && this.repairing){
    // console.log(masterHealth, ' DISENGAGE repair')
    this.disengage()
  }

  this.plot();
};

Squadron.prototype.attack = function() {
  var ship = this.ship,
      settings = this.settings,
      offset = this.offset,
      rnd = this.game.rnd,
      target, size,
      point = {};

  // attack sequence
  if(this.target) {
    target = this.target;

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
  // if(this.target.disabled){
  //   this.disengage();
  // };
};

Squadron.prototype.repair = function() {
  var ship = this.ship,
      settings = this.settings,
      offset = this.offset,
      rnd = this.game.rnd,
      target, size,
      point = {};

  // repair sequence
  if(this.target && !this.target.disabled) {
    target = this.target;
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
  if(this.target && this.target.disabled){
    this.disengage();
  };
};

Squadron.prototype.disengage = function() {
  this.target = null;
  this.attacking = false;
  this.repairing = false;
  this.attacker && this.game.clock.events.remove(this.attacker);
};

Squadron.prototype.regroup = function(distance) {
  var ships = this.manager.ships,
      ship = this.ship,
      master = ships[this.master],
      position = master.movement.position;

  this.disengage();
  console.log('distance is ', distance)
  if(distance > 2800) {
    ship.chassis === 'squad-repair' ? ship.activate('booster-advanced') : ship.activate('booster');
  }
  ship.movement.plot({ x: position.x - ship.movement.position.x, y: position.y - ship.movement.position.y })
};

Squadron.prototype.getHomePosition = function() {
  var position = this.settings.position,
      sensor = this.sensor,
      ships = this.manager.ships,
      master = ships[this.master],
      position = master.movement.position;
      sensor.setTo(position.x, position.y, 1000);
  return this.sensor.random();
};

module.exports = Squadron;
