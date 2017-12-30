import * as THREE from 'three';
import AFRAME from 'aframe';

import { updateUniforms } from './conversions';
import { waitUntilLoaded } from './utils';
import { SHADERLIB_MATERIALS, M_TAU_SCALED, Z_AXIS } from './constants';

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

function randomizeCanvas(canvas) {
  const x = 0;
  const y = 0;
  const width = canvas.width;
  const height = canvas.height;
  const g = canvas.getContext('2d');
  const imageData = g.getImageData(x, y, width, height);
  const pixels = imageData.data;
  const n = pixels.length;
  const random = Math.random;

  for (let i = 0; i < n; ) {
    pixels[i] = pixels[i++];
    pixels[i++] = (Math.random() * 4) | 0;
    pixels[i++] = (Math.random() * 255) | 0;
    pixels[i] = pixels[i++];
  }
  g.putImageData(imageData, x, y);

  return canvas;
}

AFRAME.registerComponent('tilemap-instanced', {
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
    const canvas = (this.canvas = document.createElement('canvas'));
    const context = (this.context = canvas.getContext('2d'));

    // Draw original tilemap as background.
    const img = this.data.src;
    const width = (canvas.width = img.naturalWidth);
    const height = (canvas.height = img.naturalHeight);
    context.drawImage(img, 0, 0);

    // Compute tilemap offset constants.
    this.tileOffsetX = -this.data.tileWidth * width * this.data.origin.x;
    this.tileOffsetY = -this.data.tileHeight * height * this.data.origin.y;

    // Record all current tile children of this component.
    for (const child of el.children) {
      const tile = child.components.tile;
      if (tile) {
        // Create a single buffer attribute for this tile.
        const buffer = new Float32Array(width * height * 3).fill(Infinity);
        const attribute = new THREE.InstancedBufferAttribute(
          buffer,
          3,
          1,
          true,
        );

        // Create a placeholder tile structure that will be populated.
        tiles[tile.data.id] = {
          entity: tile,
          references: {},
          instances: {},
          offsets: {
            attribute,
            buffer,
            count: 0,
          },
        };
      }
    }

    // TODO: remove this.
    document.addEventListener(
      'keydown',
      event => {
        var keyCode = event.which;
        if (keyCode == 32) {
          // space
          randomizeCanvas(this.canvas);
        }
        this.constructInstances();
      },
      false,
    );

    // TODO: add event handler for new children.
    // Construct tilemap after a number of pre-processing steps.
    this.constructTiles()
      .then(() => {
        this.constructMeshes();
        this.constructInstances();
      })
      .then(() => {
        this.el.emit('model-loaded');
      });
  },

  // Take all map geometry and add it as meshes to the scene.
  constructMeshes() {
    const t0 = performance.now();
    const tiles = this.tiles;
    const { width, height } = this.canvas;

    for (const tileId in tiles) {
      const tile = tiles[tileId];
      const { instances, references, offsets } = tile;

      // Iterate over each reference mesh in this tile.
      for (const uuid in references) {
        const reference = references[uuid];
        const referenceGeometry = reference.geometry;
        const referenceMaterial = reference.mesh.material;

        const shader = SHADERLIB_MATERIALS[referenceMaterial.type];
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        updateUniforms(uniforms, referenceMaterial);

        const instanceMaterial = new THREE.ShaderMaterial({
          uniforms,
          vertexShader: INSTANCED_VERTEX_SHADER,
          fragmentShader: shader.fragmentShader,
          lights: referenceMaterial.lights,
          defines: {
            USE_MAP: !!referenceMaterial.map,
            USE_ENVMAP: !!referenceMaterial.envMap,
            USE_AOMAP: !!referenceMaterial.aoMap,
            USE_EMISSIVEMAP: !!referenceMaterial.emissiveMap,
            USE_BUMPMAP: !!referenceMaterial.bumpMap,
            USE_NORMALMAP: !!referenceMaterial.normalMap,
            USE_SPECULARMAP: !!referenceMaterial.specularMap,
            USE_ROUGHNESSMAP: !!referenceMaterial.roughnessMap,
            USE_METALNESSMAP: !!referenceMaterial.metalnessMap,
            USE_ALPHAMAP: !!referenceMaterial.alphaMap,
            USE_COLOR: !!referenceMaterial.vertexColors,
            FLAT_SHADED: !!referenceMaterial.flatShading,
            DOUBLE_SIDED: !!referenceMaterial.doubleSided,
            FLIP_SIDED: !!referenceMaterial.flipSided,
          },
        });

        const instanceGeometry = new THREE.InstancedBufferGeometry();
        instanceGeometry.addAttribute('tilemapOffset', offsets.attribute);
        instanceGeometry.index = referenceGeometry.index;
        for (const attribute in referenceGeometry.attributes) {
          instanceGeometry.addAttribute(
            attribute,
            referenceGeometry.getAttribute(attribute),
          );
        }

        const instanceMesh = new THREE.Mesh(instanceGeometry, instanceMaterial);
        this.el.object3D.add(instanceMesh);
        instances[uuid] = { mesh: instanceMesh, geometry: instanceGeometry };
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
    const { canvas, tiles, tileOffsetX, tileOffsetY } = this;
    const { width, height } = canvas;
    const { tileWidth, tileHeight } = this.data;

    // Get tilemap pixel data from canvas.
    const context = this.canvas.getContext('2d');
    const data = context.getImageData(0, 0, width, height).data;

    // Clear the existing instances of the tile.
    for (const tileId in tiles) {
      const { offsets } = tiles[tileId];
      offsets.buffer.fill(Infinity, 0, offsets.count);
      offsets.attribute.needsUpdate = true;
      offsets.count = 0;
    }

    // Iterate through canvas and update the offsets of each tile.
    let index = 0;
    for (let row = 0; row < height; ++row) {
      for (let col = 0; col < width; ++col) {
        // Extract the pixel components used for the tile rasterization.
        const r = data[index++];
        const g = data[index++];
        const b = data[index++];
        index++; // Skip array access on 'a', it is unused.

        // Compute the tileId and rotation associated with this tile.
        const tileId = 256 * r + g;

        // Retrieve the appropriate tile geometry and merge it into place.
        if (tileId in tiles) {
          const { offsets } = tiles[tileId];
          const { buffer, count } = offsets;

          // Determine instance and tile position.
          const x = tileWidth * col + tileOffsetX;
          const y = -tileHeight * row - tileOffsetY;
          const theta = M_TAU_SCALED * b;

          // Add this instance's position to the instanced attributes.
          buffer[3 * count + 0] = x;
          buffer[3 * count + 1] = y;
          buffer[3 * count + 2] = theta;
          offsets.count++;
        }
      }
    }

    // Update the number of instances that are actually being rendered.
    for (const tileId in tiles) {
      const { offsets, instances } = tiles[tileId];
      const { count } = offsets;

      // TODO: disable mesh visibility on all unused tiles.
      for (const uuid in instances) {
        const instance = instances[uuid];
        instance.geometry.maxInstancedCount = count;
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
      const { entity, references } = tiles[tileId];

      const tileLoadingPromise = waitUntilLoaded(entity).then(() => {
        entity.el.object3D.traverse(mesh => {
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

          references[mesh.uuid] = { mesh, geometry };
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

  tick() {
    // TODO: remove this?
    this.constructInstances();
  },

  update(oldData) {
    // TODO: Regenerate mesh if these properties change.
  },

  remove() {
    // Do nothing.
  },
});
