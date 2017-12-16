AFRAME.registerComponent('tilemap', {
  schema: {
    src: { type: 'asset' },
    width: { type: 'number', default: 10 },
    height: { type: 'number', default: 10 },
  },

  init: function() {
    const data = this.data;
    const el = this.el;

    this.tiles = {};
    for (const child of el.children) {
      const tile = child.components.tile;
      if (tile) {
        this.tiles[tile.data] = tile;
        tile.setTilemap(this);
      }
    }
    // TODO: add event handler for new children.
  },

  bake: function() {
    // Get image from this.data.
    // For each pixel in image.
    // If the pixel value is in this.tiles.
    // Add that tile at the corresponding position and rotation.
  },

  update: function(oldData) {
    const data = this.data;
    const el = this.el;
  },

  remove: function() {
    const data = this.data;
    const el = this.el;
  },
});

AFRAME.registerComponent('tile', {
  schema: { type: 'int' },

  init: function() {
    const data = this.data;
    const el = this.el;
  },

  update: function(oldData) {
    const data = this.data;
    const el = this.el;
  },

  remove: function() {
    const data = this.data;
    const el = this.el;
  },

  setTilemap: function(tilemap) {
    this.tilemap = tilemap;
  },
});
