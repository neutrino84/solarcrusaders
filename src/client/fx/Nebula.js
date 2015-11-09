define('fx/nebulaimage', ['phaser', 'fx/filters/nebula'],
  function(Phaser, Nebula) {
    var NebulaImage =
      function(game, x, y, width, height, key) {
        Phaser.Image.call(this, game, x, y, key);

        this.width = width;
        this.height = height;

        this.fixedToCamera = true;

        this.renderTexture = new Phaser.RenderTexture(game, this.width, this.height);

        this.filter = new Nebula(game);
        this.filter.init(this.width, this.height);

        this.filters = [this.filter];
      };

    NebulaImage.prototype = Object.create(
      Phaser.Image.prototype
    );

    NebulaImage.prototype.update =
      function() {
        this.filter.update();
        this.renderTexture.renderXY(this, 0, 0, true);
      };

    return NebulaImage;
  }
);
