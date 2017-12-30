import * as THREE from 'three';
import AFRAME from 'aframe';

import { waitUntilLoaded } from './utils';
import { M_TAU_SCALED } from './constants';

AFRAME.registerComponent('tilemap-merged', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 1 },
    tileHeight: { type: 'number', default: 1 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
    debug: { type: 'boolean', default: false },
  },

  init() {
    const el = this.el;
    const tiles = (this.tiles = {});

    // Record all current tile children of this component.
    for (const child of el.children) {
      const tile = child.components.tile;
      if (tile) {
        tiles[tile.data.id] = {
          entity: tile,
          meshes: {},
          geometries: {},
        };
      }
    }

    // TODO: add event handler for new children.
    // Construct tilemap after a number of pre-processing steps.
    this.constructTiles()
      .then(() => {
        this.constructGeometry();
        this.constructMeshes();
      })
      .then(() => {
        this.el.emit('model-loaded');
      });
  },

  // Take all map geometry and add it as meshes to the scene.
  constructMeshes() {
    const t0 = performance.now();
    const tiles = this.tiles;

    for (const tileId in tiles) {
      const tile = tiles[tileId];
      const meshes = tile.meshes;

      for (const uuid in meshes) {
        const { mesh, mergedGeometry } = meshes[uuid];
        const mergedMesh = new THREE.Mesh(mergedGeometry, mesh.material);
        this.el.object3D.add(mergedMesh);
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile mesh creation took ${(t1 - t0).toFixed(2)} ms.`);
    }
  },

  // 1. Get image from this.data.
  // 2. For each pixel in image.
  // 3. If the pixel value is in this.tiles.
  // 4. Add that tile at the corresponding position and rotation.
  constructGeometry() {
    const t0 = performance.now();
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
    const invRootMatrixWorld = new THREE.Matrix4().getInverse(
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
          this.addTileGeometry(tileId, x, y, rotation, invRootMatrixWorld);
        }
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile geometry merging took ${(t1 - t0).toFixed(2)} ms.`);
    }
  },

  addTileGeometry(tileId, x, y, theta, invRootMatrixWorld) {
    const meshes = this.tiles[tileId].meshes;

    // TODO: what is the performance of this?
    for (const uuid in meshes) {
      const { mesh, mergedGeometry } = meshes[uuid];

      const matrix = new THREE.Matrix4().makeTranslation(x, y, 0.0);
      matrix.multiply(new THREE.Matrix4().makeRotationZ(theta));
      matrix.multiply(invRootMatrixWorld);
      matrix.multiply(mesh.matrixWorld);

      let geometry = mesh.geometry;
      if (geometry instanceof THREE.BufferGeometry) {
        geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
      }
      mergedGeometry.merge(geometry, matrix);
    }
  },

  constructTiles() {
    const t0 = performance.now();
    const tiles = this.tiles;
    const tileLoadingPromises = [];

    for (const tileId in tiles) {
      const tile = tiles[tileId];
      const entity = tile.entity;
      const meshes = tile.meshes;

      const tileLoadingPromise = waitUntilLoaded(entity).then(() => {
        entity.el.object3D.traverse(mesh => {
          if (mesh.type !== 'Mesh') return;

          mesh.updateMatrixWorld();
          const mergedGeometry = new THREE.Geometry();
          meshes[mesh.uuid] = { mesh, mergedGeometry };
        });
      });

      tileLoadingPromises.push(tileLoadingPromise);
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile cache creation took ${(t1 - t0).toFixed(2)} ms.`);
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
