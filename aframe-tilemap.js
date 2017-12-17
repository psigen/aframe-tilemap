AFRAME.registerComponent('tilemap', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 2 },
    tileHeight: { type: 'number', default: 2 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
    debug: { type: 'boolean', default: true },
  },

  init() {
    const data = this.data;
    const el = this.el;
    const tiles = (this.tiles = {});

    // Record all current tile children of this component.
    for (const child of el.children) {
      const tile = child.components.tile;
      if (tile) {
        tiles[tile.data] = tile;
      }
    }

    // TODO: add event handler for new children.
    this.constructTiles(tiles);
    this.bake();
  },

  // 1. Take all the meshes in the tile

  // 1. Get image from this.data.
  // 2. For each pixel in image.
  // 3. If the pixel value is in this.tiles.
  // 4. Add that tile at the corresponding position and rotation.
  // We will create a map of tileId => array of meshes
  bake() {
    const t0 = performance.now();

    const M_TAU_SCALED = 2.0 * Math.PI / 256.0;
    const tiles = this.tiles;

    const img = this.data.src;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const tileWidth = this.data.tileWidth;
    const tileHeight = this.data.tileHeight;
    const tileOffsetX = -tileWidth * imgWidth * this.data.origin.x;
    const tileOffsetY = -tileHeight * imgHeight * this.data.origin.y;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    const data = context.getImageData(0, 0, imgWidth, imgHeight).data;

    let index = 0;
    for (let row = 0; row < imgHeight; ++row) {
      console.log(row);
      for (let col = 0; col < imgWidth; ++col) {
        // Extract the pixel components used for the tile rasterization.
        const [r, g, b, a] = data.slice(index, index + 4);
        index += 4;

        // Compute the tileId and rotation associated with this tile.
        const tileId = 256 * r + g;
        const rotation = M_TAU_SCALED * b;

        // Retrieve the appropriate tile geometry and merge it into place.
        if (tileId in tiles) {
          const x = tileWidth * col + tileOffsetX;
          const y = tileHeight * row + tileOffsetY;
          this.addTile(tileId, x, y, rotation);
          //console.log((row, col));
        }
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile mesh creation took ${t1 - t0} milliseconds.`);
    }
  },

  addTile(tileId, x, y, theta) {
    const mapMeshesEntry = this.mapMeshes[tileId];
    const tileMeshesEntry = this.tileMeshes[tileId];

    // TODO: what is the performance of this?
    for (const uuid in tileMeshesEntry) {
      const tileMesh = tileMeshesEntry[uuid];
      const mapMesh = mapMeshesEntry[uuid];

      const matrix = new THREE.Matrix4().copy(tileMesh.matrix);
      matrix.multiply(new THREE.Matrix4().makeTranslation(x, y, 0.0));
      matrix.multiply(new THREE.Matrix4().makeRotationZ(theta));

      mapMesh.geometry.merge(tileMesh.geometry, matrix);
    }
  },

  constructTiles(tiles) {
    const t0 = performance.now();

    const tileMeshes = {};
    this.tileMeshes = tileMeshes;

    const mapMeshes = {};
    this.mapMeshes = mapMeshes;

    for (const tileId in tiles) {
      const tile = tiles[tileId];
      const tileMeshesEntry = {};
      const mapMeshesEntry = {};

      tile.el.object3D.traverse(tileMesh => {
        if (tileMesh.type !== 'Mesh') return;

        const uuid = tileMesh.parent.uuid;
        tileMesh.updateMatrix();
        tileMeshesEntry[uuid] = tileMesh;

        const mapMesh = new THREE.Mesh(new THREE.Geometry(), tileMesh.material);
        this.el.object3D.add(mapMesh);
        mapMeshesEntry[uuid] = mapMesh;
      });

      this.tileMeshes[tileId] = tileMeshesEntry;
      this.mapMeshes[tileId] = mapMeshesEntry;
    }

    console.log(tileMeshes);
    console.log(mapMeshes);

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile cache creation took ${t1 - t0} milliseconds.`);
    }
  },

  update(oldData) {
    // TODO: Regenerate mesh if these properties change.
  },

  remove() {
    // Do nothing.
  },
});

// The tile component is a placeholder used to identify which <a-entity>
// will be merged to construct the tile element of the given value.
// Generally, these entity should also have the component visible="false".
AFRAME.registerComponent('tile', {
  schema: { type: 'int' },
});
