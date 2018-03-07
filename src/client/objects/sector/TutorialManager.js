var engine = require('engine');

function TutorialManager(game, objManager) {
	this.game = game;
	this.paused = false;
	this.objectManager = objManager;
	this.objectives = [];
	// for(var i = 0; i<5; i++;){
	// 	this.objectives.push(false)
	// };
	console.log('this.objectives is ', this.objectives)
	this.counter = 0;
	this.condition = null;
	this.activeMarker = null;

	this.startingPosition = null;

	this.markerPositions = {
		botRight : [{x: 16410, y: 15745}, {x: 15541, y: 15745}, {x: 15526, y: 16297}, {x: 16422, y: 16308}],
		topRight : []
	}

	this.messages = [
		{
			msg: 'Welcome to the Mobius Dimension tutorial',
			autoAdvance: true,
			gameEvent: 'spawn_markers'
		},{
			msg: 'To move your ship, right click anywhere',
			autoAdvance: true
		},{
			msg: 'Move your ship into the yellow circle',
			autoAdvance: false,
			gameEvent: 'yellow_circle'
		},{
			msg: 'Good!',
			autoAdvance: true,
			duration: 1000
		},{
			msg: 'Left click fires your weapon.',
			autoAdvance: true
		},{
			msg: 'Destroy this pirate ship',
			autoAdvance: false
		}	

	];

	

	this.game.clock.events.add(3000, this._start, this)

	this.game.on('ship/player', this._player, this);
	this.game.on('tutorial/advance', this._advance, this);
	this.game.on('tutorial/advance/check', this._advanceCheck, this);

	// this._start();
};

TutorialManager.prototype.constructor = TutorialManager;

TutorialManager.prototype._statCheck = function(){
	var message = this.messages[this.counter];

	if(!this.paused){
		this.paused = true;
		// if(!message.autoAdvance){
		// 	packet.auto = false;
		// }
		// if(!message.satisfied){
		// 	packet.satisfied = false;
		// };

		if(!message.autoAdvance){
		this.condition = true;
		}

		if(message.gameEvent){
			this.gameEvent(message.gameEvent)
		};
		
		this.game.emit('tutorial/message', message)

		// if(!message.autoAdvance && !message.satisfied){
		// 	this.paused = true;	
		// 	console.log('paused')
		// }
	}
};

TutorialManager.prototype._advance = function(){
	console.log('advancing')

	this.counter++;

	this.paused = false;
};

TutorialManager.prototype.createObject = function(){
};

TutorialManager.prototype.gameEvent = function(event){
	var objectManager = this.objectManager
	console.log('in game event')
	switch(event){
		case 'spawn_markers':
		this.game.emit('create/markers', this.startingPosition);
		break;
		case 'yellow_circle':
		var num = Math.floor(Math.random()*4),
			marker = objectManager.objects['marker-x0'+num];
		marker.selector.yellow.alpha = 1;
		this.objectives[0] = this.activeMarker = marker;
		this.objectiveLoop1 = this.game.clock.events.loop(500, this._proximityCheck, this);
		console.log('eventz are ', this.game.clock.events)
		break;
	}
};

TutorialManager.prototype._player = function(ship){
	this.player = ship;

	switch(this.player.x){
		case -17000:
			this.startingPosition = 'topLeft'
		break
		case 20000:
			this.startingPosition = 'topRight'
		break
		case -18000:
			this.startingPosition = 'botLeft'
		break
		case 16000:
			this.startingPosition = 'botRight'
		break
	}
};

TutorialManager.prototype._proximityCheck = function(){
	var player = this.player,
		marker = this.activeMarker,
		distance = engine.Point.distance(player, marker);
	// console.log('in prox check, marker is ', marker, 'distance is ', distance)
	if(distance < 200){
		marker.selector.yellow.alpha = 0;
		marker.selector.green.alpha = 1;

		this.sequence1 = this.game.tweens.create(marker.selector.green);
	    this.sequence1.to({alpha : 0}, 800);
	    this.sequence1.start();
	    this.sequence1.on('complete', function() {
	      this.game.clock.events.remove(this.objectiveLoop1);
	      console.log('eventz are ', this.game.clock.events)
	      this.condition = false;
	      this._advance();
	      marker.selector.green.alpha = 0;
	    }, this);
	}
};

TutorialManager.prototype._advanceCheck = function(){
	// this.counter++;
	// this.paused = false;
	if(!this.condition){
		this.counter++;
		console.log('counter is ', this.counter)
		this.paused = false;
	} else {
	console.log('MUST MEET CONDITION')
	}
};

TutorialManager.prototype._start = function(){
	this.game.emit('tutorial/show');
	this.game.clock.events.loop(1000, this._statCheck, this);
};

module.exports = TutorialManager;