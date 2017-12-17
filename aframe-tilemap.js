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
        tiles[tile.data.id] = tile;
      }
    }

    // TODO: add event handler for new children.
    this.constructTiles().then(() => {
      this.constructMap();
      this.bake();
    });
  },

  // Take all map Geometry constructed so far and put them in BufferGeometry.
  bake() {
    const t0 = performance.now();

    const mapGeometries = this.mapGeometries;
    const tileMeshes = this.tileMeshes;

    const mapMeshes = (this.mapMeshes = {});

    for (const tileId in tileMeshes) {
      const tileMeshesEntry = tileMeshes[tileId];
      const mapGeometriesEntry = mapGeometries[tileId];
      const mapMeshesEntry = {};

      for (const uuid in mapGeometriesEntry) {
        const mapGeometry = mapGeometriesEntry[uuid];
        const tileMesh = tileMeshesEntry[uuid];

        const mapMesh = new THREE.Mesh(mapGeometry, tileMesh.material);
        this.el.object3D.add(mapMesh);
        mapMeshesEntry[uuid] = mapMesh;
      }

      mapMeshes[tileId] = mapMeshesEntry;
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile map baking took ${t1 - t0} milliseconds.`);
    }
  },

  // 1. Take all the meshes in the tile

  // 1. Get image from this.data.
  // 2. For each pixel in image.
  // 3. If the pixel value is in this.tiles.
  // 4. Add that tile at the corresponding position and rotation.
  // We will create a map of tileId => array of meshes
  constructMap() {
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

    this.el.object3D.parent.updateMatrixWorld();
    this.invMatrixWorld = new THREE.Matrix4().getInverse(
      this.el.object3D.matrixWorld,
    );

    let index = 0;
    for (let row = 0; row < imgHeight; ++row) {
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
    const mapGeometriesEntry = this.mapGeometries[tileId];
    const tileMeshesEntry = this.tileMeshes[tileId];

    // TODO: what is the performance of this?
    for (const uuid in tileMeshesEntry) {
      const tileMesh = tileMeshesEntry[uuid];
      const mapGeometry = mapGeometriesEntry[uuid];

      const matrix = new THREE.Matrix4().makeTranslation(x, y, 0.0);
      matrix.multiply(new THREE.Matrix4().makeRotationZ(theta));
      matrix.multiply(this.invMatrixWorld);
      matrix.multiply(tileMesh.matrixWorld);

      let geometry = tileMesh.geometry;
      if (geometry instanceof THREE.BufferGeometry) {
        geometry = new THREE.Geometry().fromBufferGeometry(tileMesh.geometry);
      }
      mapGeometry.merge(geometry, matrix);
    }
  },

  constructTiles() {
    const t0 = performance.now();
    const tiles = this.tiles;
    const tileLoadingPromises = [];

    this.mapGeometries = {};
    this.tileMeshes = {};

    for (const tileId in tiles) {
      const tile = tiles[tileId];

      const tileLoadingPromise = new Promise((resolve, reject) => {
        const defineTile = () => {
          const tileMeshesEntry = {};
          const mapGeometriesEntry = {};

          tile.el.object3D.traverse(tileMesh => {
            if (tileMesh.type !== 'Mesh') return;

            const uuid = tileMesh.parent.uuid;
            tileMesh.parent.updateMatrixWorld();
            tileMeshesEntry[uuid] = tileMesh;

            const mapGeometry = new THREE.Geometry();
            mapGeometriesEntry[uuid] = mapGeometry;
          });

          this.mapGeometries[tileId] = mapGeometriesEntry;
          this.tileMeshes[tileId] = tileMeshesEntry;
          resolve();
        };

        if (tile.data.isLoaded) {
          tile.el.addEventListener('model-loaded', e => {
            defineTile();
          });
        } else {
          defineTile();
        }
      });

      tileLoadingPromises.push(tileLoadingPromise);
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile cache creation took ${t1 - t0} milliseconds.`);
    }

    return Promise.all(tileLoadingPromises);
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
  schema: {
    id: { type: 'int' },
    isLoaded: { type: 'boolean', default: false },
  },
});
