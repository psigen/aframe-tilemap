import * as THREE from 'three';
import AFRAME from 'aframe';
import { updateUniforms } from './conversions';

const SHADERLIB_MATERIALS = {
  MeshBasicMaterial: THREE.ShaderLib.basic,
  MeshStandardMaterial: THREE.ShaderLib.standard,
};
const M_TAU_SCALED = 2.0 * Math.PI / 256.0;
const Z_AXIS = new THREE.Vector3(0, 0, 1);

AFRAME.registerComponent('instanced-tilemap', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 2 },
    tileHeight: { type: 'number', default: 2 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
    debug: { type: 'boolean', default: true },
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
          instances: { offsets: [] },
        };
      }
    }

    // TODO: add event handler for new children.
    // Construct tilemap after a number of pre-processing steps.
    this.constructTiles().then(() => {
      this.constructGeometry();
      this.constructMeshes();
    });
  },

  // Take all map geometry and add it as meshes to the scene.
  constructMeshes() {
    const t0 = performance.now();
    const tiles = this.tiles;

    for (const tileId in tiles) {
      const tile = tiles[tileId];
      const instances = tile.instances;
      if (instances.offsets.length <= 0) continue;

      // Create instance attributes for all meshes in this tile.
      const offsetAttribute = new THREE.InstancedBufferAttribute(
        new Float32Array(instances.offsets),
        3,
      );

      // Iterate over each mesh in this tile.
      for (const uuid in tile.meshes) {
        const mesh = tile.meshes[uuid];
        const meshGeometry = mesh.geometry;
        const meshMaterial = mesh.mesh.material;

        //const shader = THREE.ShaderLib.basic;
        const shader = SHADERLIB_MATERIALS[meshMaterial.type];
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        updateUniforms(uniforms, meshMaterial);

        //console.log(uuid);
        if (meshMaterial.type == 'MeshStandardMaterial') {
          //console.log(meshMaterial);
          //console.log(uniforms);
        }

        // Model Matrix
        // Model View Matrix
        // Normal Matrix
        // twiddle

        const instanceMaterial = new THREE.ShaderMaterial({
          uniforms,
          //vertexShader: shader.vertexShader, // document.getElementById('vertexShader').textContent,
          vertexShader: document.getElementById('vertexShader').textContent,
          fragmentShader: shader.fragmentShader,
          lights: meshMaterial.lights,
          defines: {
            USE_MAP: !!meshMaterial.map,
            USE_ENVMAP: !!meshMaterial.envMap,
            USE_AOMAP: !!meshMaterial.aoMap,
            USE_EMISSIVEMAP: !!meshMaterial.emissiveMap,
            USE_BUMPMAP: !!meshMaterial.bumpMap,
            USE_NORMALMAP: !!meshMaterial.normalMap,
            USE_SPECULARMAP: !!meshMaterial.specularMap,
            USE_ROUGHNESSMAP: !!meshMaterial.roughnessMap,
            USE_METALNESSMAP: !!meshMaterial.metalnessMap,
            USE_ALPHAMAP: !!meshMaterial.alphaMap,
            USE_COLOR: !!meshMaterial.vertexColors,
            FLAT_SHADED: !!meshMaterial.flatShading,
            DOUBLE_SIDED: !!meshMaterial.doubleSided,
            FLIP_SIDED: !meshMaterial.flipSided,
          },
        });

        const instanceGeometry = new THREE.InstancedBufferGeometry();
        instanceGeometry.index = meshGeometry.index;
        for (const attribute in meshGeometry.attributes) {
          instanceGeometry.addAttribute(
            attribute,
            meshGeometry.getAttribute(attribute),
          );
        }
        instanceGeometry.addAttribute('tilemapOffset', offsetAttribute);

        const instance = new THREE.Mesh(instanceGeometry, instanceMaterial);
        this.el.object3D.add(instance);
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile map baking took ${(t1 - t0).toFixed(2)} ms.`);
    }
  },

  // 1. Get image from this.data.
  // 2. For each pixel in image.
  // 3. If the pixel value is in this.tiles.
  // 4. Add that tile at the corresponding position and rotation.
  // We will create a map of tileId => array of meshes
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

    let index = 0;
    for (let row = 0; row < imgHeight; ++row) {
      for (let col = 0; col < imgWidth; ++col) {
        // Extract the pixel components used for the tile rasterization.
        const [r, g, b, a] = data.slice(index, index + 4);
        index += 4;

        // Compute the tileId and rotation associated with this tile.
        const tileId = 256 * r + g;

        // Retrieve the appropriate tile geometry and merge it into place.
        if (tileId in tiles) {
          // Determine instance and tile position.
          const instances = tiles[tileId].instances;
          const x = tileWidth * col + tileOffsetX;
          const y = tileHeight * row + tileOffsetY;
          const theta = M_TAU_SCALED * b;

          // Add this instance's position to the instanced attributes.
          instances.offsets.push(x, y, theta);
        }
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      const t1 = performance.now();
      console.log(`Tile map parsing took ${(t1 - t0).toFixed(2)} ms.`);
    }
  },

  constructTiles() {
    const t0 = performance.now();
    const tiles = this.tiles;
    const tileLoadingPromises = [];

    this.el.object3D.updateMatrixWorld();
    const invMatrixWorld = new THREE.Matrix4().getInverse(
      this.el.object3D.matrixWorld,
    );

    for (const tileId in tiles) {
      const tile = tiles[tileId];
      const meshes = tile.meshes;

      const tileLoadingPromise = new Promise((resolve, reject) => {
        const defineTile = () => {
          tile.entity.el.object3D.traverse(mesh => {
            if (mesh.type !== 'Mesh') return;

            const geometry =
              mesh.geometry instanceof THREE.BufferGeometry
                ? new THREE.BufferGeometry().copy(mesh.geometry)
                : new THREE.BufferGeometry().fromGeometry(mesh.geometry);

            mesh.updateMatrixWorld();
            const matrix = new THREE.Matrix4()
              .copy(invMatrixWorld)
              .multiply(mesh.matrixWorld);
            geometry.applyMatrix(matrix);

            meshes[mesh.uuid] = { mesh, geometry };
          });

          resolve();
        };

        if (tile.entity.data.isLoaded) {
          tile.entity.el.addEventListener('model-loaded', e => {
            // For some reason, there is some additional time for the
            // transformations in the mesh.matrixWorld to update after the
            // 'model-loaded' event is emitted.
            setTimeout(() => {
              defineTile();
            }, 100);
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
      console.log(`Tile definition took ${(t1 - t0).toFixed(2)} ms.`);
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

AFRAME.registerComponent('tilemap', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 2 },
    tileHeight: { type: 'number', default: 2 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
    debug: { type: 'boolean', default: true },
  },

  init() {
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
    // Construct tilemap after a number of pre-processing steps.
    this.constructTiles().then(() => {
      this.constructGeometry();
      this.constructMeshes();
    });
  },

  // Take all map geometry and add it as meshes to the scene.
  constructMeshes() {
    const t0 = performance.now();

    const tileMeshes = this.tileMeshes;
    const mapMeshes = (this.mapMeshes = {});
    const mapGeometries = this.mapGeometries;

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
      console.log(`Tile map baking took ${(t1 - t0).toFixed(2)} ms.`);
    }
  },

  // 1. Get image from this.data.
  // 2. For each pixel in image.
  // 3. If the pixel value is in this.tiles.
  // 4. Add that tile at the corresponding position and rotation.
  // We will create a map of tileId => array of meshes
  constructGeometry() {
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
      console.log(`Tile mesh creation took ${(t1 - t0).toFixed(2)} ms.`);
    }
  },

  addTileGeometry(tileId, x, y, theta, invRootMatrixWorld) {
    const mapGeometriesEntry = this.mapGeometries[tileId];
    const tileMeshesEntry = this.tileMeshes[tileId];

    // TODO: what is the performance of this?
    for (const uuid in tileMeshesEntry) {
      const tileMesh = tileMeshesEntry[uuid];
      const mapGeometry = mapGeometriesEntry[uuid];

      const matrix = new THREE.Matrix4().makeTranslation(x, y, 0.0);
      matrix.multiply(new THREE.Matrix4().makeRotationZ(theta));
      matrix.multiply(invRootMatrixWorld);
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

    const mapGeometries = (this.mapGeometries = {});
    const tileMeshes = (this.tileMeshes = {});

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

          mapGeometries[tileId] = mapGeometriesEntry;
          tileMeshes[tileId] = tileMeshesEntry;
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

// The tile component is a placeholder used to identify which <a-entity>
// will be merged to construct the tile element of the given value.
// Generally, these entity should also have the component visible="false".
AFRAME.registerComponent('tile', {
  schema: {
    id: { type: 'int' },
    isLoaded: { type: 'boolean', default: false },
  },
});