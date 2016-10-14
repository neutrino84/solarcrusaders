
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader,
    MapShip = require('../objects/sector/spacemap/MapShip');


function SpaceMap(game) {
    this.spaceTexture = new pixi.Texture(this.getRepeatTexture('space'));

    engine.Shader.call(this, game, this.spaceTexture);

    var fieldSize = 4096;
    var divider = 2;
    var size = game.width < game.height ? game.width/divider : game.height/divider;
    this.settings = {
        colors: {
            pirate: 0xFF0000, neutral: 0xFFFF00, other: 0x8A8A8A
        },
        size: size,
        fieldSize: fieldSize,
        zoom: 10,
        margin: [8, 8],
        divider: divider,
        user: {
            ship: {
                x: 3100,
                y: 2000
            }
        }

    };

    this._width = this._height = this.settings.size;
    this.position.set(this.settings.margin[0], this.settings.margin[1]);


    this.others = [];
    this.neutrals = [];
    this.pirates = [];
    this._getUsers();


    this.shipGroup = new engine.Group( this.game, this);

    this._drawShips();

    game.clock.events.loop(2000, this._test, this);
};

SpaceMap.prototype = Object.create(engine.Shader.prototype);
SpaceMap.prototype.constructor = SpaceMap;

SpaceMap.prototype._drawShips = function(){

    var scope = this;
    draw(this.pirates);
    draw(this.neutrals);
    draw(this.others);

    function draw(group){
        for (var i = 0; i < group.length; i++){

            scope._drawShip(group[i]);

        }
    }

};

SpaceMap.prototype._drawShip = function(ship){

    this.shipGroup.add(new MapShip(this.game, ship, this.settings));
};


SpaceMap.prototype.getShader = function(gl) {
    return new Shader(gl,
        glslify(__dirname + '/shaders/spacemap.vert', 'utf8'),
        glslify(__dirname + '/shaders/spacemap.frag', 'utf8')
    );
};

SpaceMap.prototype._getUsers = function(){

    var scope = this;
    usersTest( this.others, 5, this.settings.colors.other);
    usersTest( this.neutrals, 4, this.settings.colors.neutral);
    usersTest( this.pirates, 6, this.settings.colors.pirate);

    function usersTest( group, count, color ){

        for (var i = 0; i < count; i++){
            group.push({
                ship: {
                    x: scope.settings.user.ship.x + engine.Math.getRandomInt(-300, 300),
                    y: scope.settings.user.ship.y + engine.Math.getRandomInt(-300, 300),
                },
                color: color
            });

        }
    }

};

SpaceMap.prototype.apply = function(renderer, shader) {

    shader.uniforms.translationMatrix = this.worldTransform.toArray(true);
    renderer.bindTexture(this._texture, 0);
};

SpaceMap.prototype._test = function(){

    if(this.shipGroup.children.length > 0){
        var index = engine.Math.getRandomInt(0, this.shipGroup.children.length - 1);

        this.removeShip( index );
    }

    if(engine.Math.getRandomInt(0, 10) > 6 || this.shipGroup.children.length < 8){
        var ship = {
            ship: {
                x: this.settings.user.ship.x + engine.Math.getRandomInt(-300, 300),
                y: this.settings.user.ship.y + engine.Math.getRandomInt(-300, 300)
            },
            color: this.settings.colors[Object.keys(this.settings.colors)[engine.Math.getRandomInt(0, 2)]]
        };
        this._drawShip(ship);
    }

};

SpaceMap.prototype.removeShip = function( index ){

    this.shipGroup.remove( this.shipGroup.children[index]);

};

SpaceMap.prototype.resize = function(width, height){
    this.settings.size = width < height ? width / this.settings.divider : height / this.settings.divider;
    this._width = this._height = this.settings.size;

    for(var i = 0; i < this.shipGroup.children.length; i++){
        this.shipGroup.children[i].update();
    }
}

module.exports = SpaceMap;