var engine = require('engine');

function TutorialManager(game, objManager) {
	this.game = game;
	this.socket = game.net.socket;
	this.paused = false;
	this.objectManager = objManager;
	this.objectives = [];
	// for(var i = 0; i<5; i++;){
	// 	this.objectives.push(false)
	// };
	console.log('this.game is ', this.game)
	this.counter = 0;
	this.advance = true;
	this.activeMarker = null;
	this.startingPosition = null;
	this.prox = null;

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
			autoAdvance: false,
			gameEvent: 'right_click'
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
			autoAdvance: false,
			gameEvent: 'spawn_pirate'
		}	

	];

	

	this.game.clock.events.add(3000, this._start, this)

	this.game.on('ship/player', this._player, this);
	this.game.on('tutorial/advance', this._advance, this);
	this.game.on('tutorial/advance/check', this._advanceCheck, this);
	this.game.on('ship/secondary', this._rightClick, this)

	// this._start();
};

TutorialManager.prototype.constructor = TutorialManager;

TutorialManager.prototype._rightClick = function(){
	console.log('in test 1')
	if(this.objectives[0] && this.objectives[0] === 'incomplete'){
		this.advance = true;
		this._advanceCheck();
		this.objectives[0] = 'complete'
		this.game.removeListener('ship/secondary', this._rightClick);
	}
};

TutorialManager.prototype._statCheck = function(){
	var message = this.messages[this.counter];

	if(!this.paused){
		this.paused = true;
		if(!message.autoAdvance){
		this.advance = false;
		};
		if(message.gameEvent){
		this.gameEvent(message.gameEvent)
		};
		this.game.emit('tutorial/message', message);
	};
};
TutorialManager.prototype.gameEvent = function(event){
	var objectManager = this.objectManager, num, marker;
	console.log('in game event')
	switch(event){
		case 'spawn_markers':
			objectManager.createMarkers(this.startingPosition)
		break;
		case 'right_click':
			this.objectives[0] = 'incomplete';
		break;
		case 'yellow_circle':
			num = Math.floor(Math.random()*4);
			marker = objectManager.objects['marker-x0'+num];
			marker.selector.yellow.alpha = 1;
			this.objectives[1] = this.activeMarker = marker;
			this.objectiveLoop1 = this.game.clock.events.loop(500, this._proximityCheck, this);
		break;
		case 'spawn_pirate':
			num = Math.floor(Math.random()*4);
			marker = objectManager.objects['marker-x0'+num];
			// marker.selector.yellow.alpha = 1;
			console.log('gonna spawn tutorial pirate, marker is ', num, 'coordinates are ', marker.x, marker.y)
			this.objectives[2] = this.activeMarker = marker;
		
			this.socket.emit('tutorial/createShip', {x: marker.x, y: marker.y, player_uuid: this.player.uuid})


			// this.game.socket.emit('ship/create', {
			//     chassis: args[1],
			//     x : startingPosition.x,
			//     y : startingPosition.y,
			//     squadron : {},
			//     tutorial: tutorial
			//   }, user);
			// this.objectiveLoop2 = this.game.clock.events.loop(500, this._proximityCheck, this);
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
	if(distance < 200 && !this.prox){
		this.prox = true;
		marker.selector.yellow.alpha = 0;
		marker.selector.green.alpha = 1;

		this.sequence1 = this.game.tweens.create(marker.selector.green);
	    this.sequence1.to({alpha : 0}, 800);
	    this.sequence1.start();
	    this.sequence1.on('complete', function() {
	      this.game.clock.events.remove(this.objectiveLoop1);
	      console.log('event complete ')
	      marker.selector.green.alpha = 0;
	      this.advance = true;
	      this._advanceCheck();
	    }, this);
	}
};

TutorialManager.prototype._advanceCheck = function(){
	// this.counter++;
	// this.paused = false;
	if(this.advance){
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