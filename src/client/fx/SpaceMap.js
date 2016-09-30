
var pixi = require('pixi'),
    engine = require('engine'),
    glslify = require('glslify'),
    Shader = require('pixi-gl-core').GLShader;


function SpaceMap(game) {
    this.spaceTexture = new pixi.Texture(this.getRepeatTexture('space'));

    engine.Shader.call(this, game, this.spaceTexture);

    var size = game.width < game.height ? game.width/1.3 : game.height/1.3;
    this._width = this._height = size;

    this.tileScale = new pixi.Point(0.5, 0.5);
    this.tilePosition = new pixi.Point(0, 0);

    this._glDatas = [];
};

SpaceMap.prototype = Object.create(engine.Shader.prototype);
SpaceMap.prototype.constructor = SpaceMap;

SpaceMap.prototype._renderShaderWebGL = function(renderer) {
    var gl, glData, vertices, textureUvs, textureWidth, textureHeight,
        textureBaseWidth, textureBaseHeight, uTransform,
        texture = this._texture;

    renderer.flush();

    gl = renderer.gl;
    glData = this._glDatas[renderer.CONTEXT_UID];

    if(!glData) {
        glData = {
            shader: this.getShader(gl),
            quad: new pixi.Quad(gl)
        };

        this._glDatas[renderer.CONTEXT_UID] = glData;
        glData.quad.initVao(glData.shader);
    }

    vertices = glData.quad.vertices;
    vertices[0] = vertices[6] = (this._width) * -this.anchor.x;
    vertices[1] = vertices[3] = this._height * -this.anchor.y;
    vertices[2] = vertices[4] = (this._width) * (1-this.anchor.x);
    vertices[5] = vertices[7] = this._height * (1-this.anchor.y);
    glData.quad.upload();
    renderer.bindShader(glData.shader);


    // apply uniforms
    this.apply(renderer, glData.shader);

    renderer.state.setBlendMode(this.blendMode);
    glData.quad.draw();
};

SpaceMap.prototype.getShader = function(gl) {
    return new Shader(gl,
        glslify(__dirname + '/shaders/spacemap.vert', 'utf8'),
        glslify(__dirname + '/shaders/spacemap.frag', 'utf8')
    );
};

module.exports = SpaceMap;