var engine = require('engine');

function TutorialManager(game, sectorState) {
	this.game = game;
	this.socket = game.net.socket;
	this.paused = false;
	this.objectManager = sectorState.objManager;
	this.stationManager = sectorState.stationManager;
	this.objectives = [];
	this.counter = 0;
	this.advanceReady = true;
	this.activeMarker = null;
	this.startingPosition = null;
	this.prox = null;
	this.spawned = false;

	this.markerPositions = {
		botRight: [{x: 15971, y: 15332},{x: 16410, y: 15745}, {x: 15541, y: 15745}, {x: 15526, y: 16297}, {x: 16422, y: 16308}],
		topRight : []
	}

	this.messages = [
		{
			msg: 'Welcome to the Mobius Dimension tutorial',
			autoAdvance: true,
			gameEvent: 'spawn_markers',
			duration: 3500
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
		},{
			msg: 'Good!',
			autoAdvance: true,
			duration: 1000
		},{
			msg: 'The object of the game is to defend the Ubadian outpost station',
			autoAdvance: false,
			gameEvent: 'show_bases'
		}			

	];

	

	this.game.clock.events.add(2000, this._start, this)



	this.game.on('ship/player', this._player, this);
	this.game.on('tutorial/advance', this.advance, this);
	this.game.on('tutorial/advance/check', this._advanceCheck, this);
	this.game.on('ship/secondary', this._rightClick, this)



	// this._start();
};

TutorialManager.prototype.constructor = TutorialManager;

TutorialManager.prototype._start = function(){
	this.game.emit('tutorial/show');
	this.looper = this.game.clock.events.loop(1000, this._statCheck, this);
};

TutorialManager.prototype._rightClick = function(){
	if(this.objectives[0] && this.objectives[0] === 'incomplete'){
		this.advanceReady = true;
		this._advanceCheck();
		this.objectives[0] = 'complete'
		this.game.removeListener('ship/secondary', this._rightClick);
	};
};

TutorialManager.prototype._statCheck = function(){
	var message = this.messages[this.counter];

	if(!message){console.log(this.counter, this.messages)}
	if(!this.paused){
		this.paused = true;
		if(!message.autoAdvance){
			this.advanceReady = false;
		};
		if(message.gameEvent){
			this.gameEvent(message.gameEvent)
		};
		this.game.emit('tutorial/message', message);
	};
};
TutorialManager.prototype.gameEvent = function(event){
	var objectManager = this.objectManager, num, marker;
	switch(event){
		case 'spawn_markers':
			this.game.emit('fade/tutorialDisplay');
			objectManager.createTutorialMarkers(this.startingPosition)
		break;
		case 'right_click':
			this.objectives[0] = 'incomplete';
		break;
		case 'yellow_circle':
			num = Math.floor(Math.random()*3);
			marker = objectManager.objects['marker-x0'+num];
			marker.selector.yellow.alpha = 1;
			this.objectives[1] = this.activeMarker = marker;
			this.objectiveLoop1 = this.game.clock.events.loop(500, this._proximityCheck, this);
		break;
		case 'spawn_pirate':
			num = Math.floor(Math.random()*3);
			marker = objectManager.objects['marker-x0'+num];
			this.objectives[2] = this.activeMarker = marker;
			if(!this.spawned){
				this.spawned = true;
				this.socket.emit('tutorial/createShip', {x: marker.x, y: marker.y, player_uuid: this.player.uuid});
			}
		break;
		case 'show_bases':
			this.zoomOut = this.game.tweens.create(this.game.world.scale);
			this.zoomOut.to({ x: 0.2, y: 0.2 }, 2900, engine.Easing.Quadratic.InOut);
			// this.zoomOut.delay(100);
			this.zoomOut.start();

			this.zoomIn = this.game.tweens.create(this.game.world.scale);
			this.zoomIn.to({ x: 0.6, y: 0.6 }, 3000, engine.Easing.Quadratic.InOut);
			
			this.fadeOut = this.game.tweens.create(this.game.world);
			this.fadeOut.to({ alpha: 0 }, 3000, engine.Easing.Quadratic.InOut);
			this.fadeOut.start();
			this.fadeOut.on('complete', function () {
			}, this);
			
			
			// this.game.camera.smooth = true;
			this.zoomOut.on('complete', function() {
				this.game.camera.unfollow();
				// this.game.camera.follow(this.stationManager.find('ubadian-station-x01')); 
				
				// this.socket.emit('tutorial/finished', {player_uuid: this.player.user})
				
				// this.game.emit('game/transition', 'transition')
				
				this.game.emit('game/transition', 'transition')
				
				


				// this.zoomIn.start();

				this.zoomIn.on('complete', function() {
				}, this);
			}, this);
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
	if(distance < 200 && !this.prox){
		this.prox = true;
		marker.selector.yellow.alpha = 0;
		marker.selector.green.alpha = 1;

		this.sequence1 = this.game.tweens.create(marker.selector.green);
	    this.sequence1.to({alpha : 0}, 800);
	    this.sequence1.start();
	    this.sequence1.on('complete', function() {
	      this.game.clock.events.remove(this.objectiveLoop1);
	      marker.selector.green.alpha = 0;
	      this.advance();
	    }, this);
	}
};


TutorialManager.prototype.advance = function(){
	this.advanceReady = true;
	this._advanceCheck();
};

TutorialManager.prototype._advanceCheck = function(){
	if(this.advanceReady){
		this.counter++;
		this.paused = false;
	};
};

TutorialManager.prototype.destroy = function() {
  if(!this.game){return}	
  this.looper && this.game.clock.events.remove(this.looper);

  this.game.removeListener('ship/player', this._player, this);
  this.game.removeListener('tutorial/advance', this.advance, this);
  this.game.removeListener('tutorial/advance/check', this._advanceCheck, this);
  this.game.removeListener('ship/secondary', this._rightClick, this);
  this.game = this.socket = this.paused = this.objectManager = this.stationManager = this.objectives = this.counter 
  = this.advanceReady = this.looper = this.activeMarker = this.startingPosition = this.prox = this.markerPositions = this.messages
  = undefined;
};

module.exports = TutorialManager;