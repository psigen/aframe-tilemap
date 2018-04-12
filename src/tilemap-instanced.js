import * as THREE from 'three';
import AFRAME from 'aframe';

import { updateUniforms } from './conversions';
import { waitUntilLoaded } from './utils';
import {
  SHADERLIB_MATERIALS,
  SHADERLIB_DEFAULT_MATERIAL,
  M_TAU_SCALED,
  Z_AXIS,
} from './constants';

const INSTANCED_VERTEX_SHADER = `
precision highp float;

attribute vec3 tilemapOffset;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec4 tilemapOrientation = vec4(0, 0, cos(tilemapOffset.z), sin(tilemapOffset.z));
  vec3 tilemapPosition = vec3(tilemapOffset.xy, 0.0);

  vec3 vPosition = position;
  vec3 vcV = cross( tilemapOrientation.xyz, vPosition );
  vPosition = vcV * ( 2.0 * tilemapOrientation.w ) + ( cross( tilemapOrientation.xyz, vcV ) * 2.0 + vPosition );
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( tilemapPosition + vPosition, 1.0 );
}
`;

AFRAME.registerComponent('tilemap-instanced', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 1 },
    tileHeight: { type: 'number', default: 1 },
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
    this.constructTiles()
      .then(() => {
        this.constructInstances();
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

        const shader =
          SHADERLIB_MATERIALS[meshMaterial.type] || SHADERLIB_DEFAULT_MATERIAL;
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        updateUniforms(uniforms, meshMaterial);

        const instanceMaterial = new THREE.ShaderMaterial({
          uniforms,
          //vertexShader: shader.vertexShader, // document.getElementById('vertexShader').textContent,
          vertexShader: INSTANCED_VERTEX_SHADER,
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
      console.log(`Tile mesh creation took ${(t1 - t0).toFixed(2)} ms.`);
    }
  },

  // 1. Get image from this.data.
  // 2. For each pixel in image.
  // 3. If the pixel value is in this.tiles.
  // 4. Add that tile at the corresponding position and rotation.
  constructInstances() {
    const t0 = performance.now();
    const tiles = this.tiles;

    const img = this.data.src;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    const tileWidth = this.data.tileWidth;
    const tileHeight = -this.data.tileHeight;
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
      console.log(`Tile instancing took ${(t1 - t0).toFixed(2)} ms.`);
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

      const tileLoadingPromise = waitUntilLoaded(tile.entity).then(() => {
        tile.entity.el.object3D.traverse(mesh => {
          if (mesh.type !== 'Mesh') return;

          const geometry =
            mesh.geometry.type === 'BufferGeometry'
              ? new THREE.BufferGeometry().copy(mesh.geometry)
              : new THREE.BufferGeometry().fromGeometry(mesh.geometry);

          mesh.updateMatrixWorld();
          const matrix = new THREE.Matrix4()
            .copy(invMatrixWorld)
            .multiply(mesh.matrixWorld);
          geometry.applyMatrix(matrix);

          meshes[mesh.uuid] = { mesh, geometry };
        });
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
