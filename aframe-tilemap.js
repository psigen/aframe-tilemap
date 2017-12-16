AFRAME.registerComponent('tilemap', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 10 },
    tileHeight: { type: 'number', default: 10 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
  },

  init: function() {
    const data = this.data;
    const el = this.el;
    const tiles = (this.tiles = {});

    for (const child of el.children) {
      const tile = child.components.tile;
      if (tile) {
        tiles[tile.data] = tile;
      }
    }

    // TODO: add event handler for new children.
    this.bake();
  },

  bake: function() {
    const M_TAU = 2 * Math.PI;
    const tiles = this.tiles;
    const tileimg = this.data.src;

    // Get image from this.data.
    // For each pixel in image.
    // If the pixel value is in this.tiles.
    // Add that tile at the corresponding position and rotation.
    const width = tileimg.naturalWidth;
    const height = tileimg.naturalHeight;

    const canvas = document.createElement('canvas'); // TODO: do I need to clean this up somehow?
    const context = canvas.getContext('2d');
    context.drawImage(tileimg, 0, 0);
    const data = context.getImageData(0, 0, width, height).data;

    let index = 0;
    for (let row = 0; row < height; ++row) {
      for (let col = 0; col < width; ++col) {
        // Extract the pixel components used for the tile rasterization.
        const [r, g, b, a] = data.slice(index, index + 4);
        index += 4;

        // Compute the tileId and rotation associated with this tile.
        const tileId = 256 * r + g;
        const rotation = M_TAU * (b / 256.0);

        // Retrieve the appropriate tile geometry and merge it into place.
        console.log(tileId);
        if (tileId in tiles) {
          const tile = tiles[tileId];
          console.log(tile);
        }
      }
    }
  },

  update: function(oldData) {
    this.bake();
  },

  remove: function() {
    // Do nothing.
  },
});

AFRAME.registerComponent('tile', {
  schema: { type: 'int' },

  init: function() {
    this.el.object3D.visible = false;
  },
});
