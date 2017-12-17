function refreshUniformsCommon(uniforms, material) {
  uniforms.opacity.value = material.opacity;

  if (material.color) {
    uniforms.diffuse.value = material.color;
  }

  if (material.emissive) {
    uniforms.emissive.value
      .copy(material.emissive)
      .multiplyScalar(material.emissiveIntensity);
  }

  if (material.map) {
    uniforms.map.value = material.map;
  }

  if (material.alphaMap) {
    uniforms.alphaMap.value = material.alphaMap;
  }

  if (material.specularMap) {
    uniforms.specularMap.value = material.specularMap;
  }

  if (material.envMap) {
    uniforms.envMap.value = material.envMap;

    // don't flip CubeTexture envMaps, flip everything else:
    //  WebGLRenderTargetCube will be flipped for backwards compatibility
    //  WebGLRenderTargetCube.texture will be flipped because it's a Texture and NOT a CubeTexture
    // this check must be handled differently, or removed entirely, if WebGLRenderTargetCube uses a CubeTexture in the future
    uniforms.flipEnvMap.value = !(
      material.envMap && material.envMap.isCubeTexture
    )
      ? 1
      : -1;

    uniforms.reflectivity.value = material.reflectivity;
    uniforms.refractionRatio.value = material.refractionRatio;
  }

  if (material.lightMap) {
    uniforms.lightMap.value = material.lightMap;
    uniforms.lightMapIntensity.value = material.lightMapIntensity;
  }

  if (material.aoMap) {
    uniforms.aoMap.value = material.aoMap;
    uniforms.aoMapIntensity.value = material.aoMapIntensity;
  }

  // uv repeat and offset setting priorities
  // 1. color map
  // 2. specular map
  // 3. normal map
  // 4. bump map
  // 5. alpha map
  // 6. emissive map

  var uvScaleMap;

  if (material.map) {
    uvScaleMap = material.map;
  } else if (material.specularMap) {
    uvScaleMap = material.specularMap;
  } else if (material.displacementMap) {
    uvScaleMap = material.displacementMap;
  } else if (material.normalMap) {
    uvScaleMap = material.normalMap;
  } else if (material.bumpMap) {
    uvScaleMap = material.bumpMap;
  } else if (material.roughnessMap) {
    uvScaleMap = material.roughnessMap;
  } else if (material.metalnessMap) {
    uvScaleMap = material.metalnessMap;
  } else if (material.alphaMap) {
    uvScaleMap = material.alphaMap;
  } else if (material.emissiveMap) {
    uvScaleMap = material.emissiveMap;
  }

  if (uvScaleMap !== undefined) {
    // backwards compatibility
    if (uvScaleMap.isWebGLRenderTarget) {
      uvScaleMap = uvScaleMap.texture;
    }

    if (uvScaleMap.matrixAutoUpdate === true) {
      var offset = uvScaleMap.offset;
      var repeat = uvScaleMap.repeat;
      var rotation = uvScaleMap.rotation;
      var center = uvScaleMap.center;

      uvScaleMap.matrix.setUvTransform(
        offset.x,
        offset.y,
        repeat.x,
        repeat.y,
        rotation,
        center.x,
        center.y,
      );
    }

    uniforms.uvTransform.value.copy(uvScaleMap.matrix);
  }
}

function refreshUniformsLine(uniforms, material) {
  uniforms.diffuse.value = material.color;
  uniforms.opacity.value = material.opacity;
}

function refreshUniformsDash(uniforms, material) {
  uniforms.dashSize.value = material.dashSize;
  uniforms.totalSize.value = material.dashSize + material.gapSize;
  uniforms.scale.value = material.scale;
}

function refreshUniformsPoints(uniforms, material) {
  uniforms.diffuse.value = material.color;
  uniforms.opacity.value = material.opacity;
  uniforms.size.value = material.size * _pixelRatio;
  uniforms.scale.value = _height * 0.5;

  uniforms.map.value = material.map;

  if (material.map !== null) {
    if (material.map.matrixAutoUpdate === true) {
      var offset = material.map.offset;
      var repeat = material.map.repeat;
      var rotation = material.map.rotation;
      var center = material.map.center;

      material.map.matrix.setUvTransform(
        offset.x,
        offset.y,
        repeat.x,
        repeat.y,
        rotation,
        center.x,
        center.y,
      );
    }

    uniforms.uvTransform.value.copy(material.map.matrix);
  }
}

function refreshUniformsFog(uniforms, fog) {
  uniforms.fogColor.value = fog.color;

  if (fog.isFog) {
    uniforms.fogNear.value = fog.near;
    uniforms.fogFar.value = fog.far;
  } else if (fog.isFogExp2) {
    uniforms.fogDensity.value = fog.density;
  }
}

function refreshUniformsLambert(uniforms, material) {
  if (material.emissiveMap) {
    uniforms.emissiveMap.value = material.emissiveMap;
  }
}

function refreshUniformsPhong(uniforms, material) {
  uniforms.specular.value = material.specular;
  uniforms.shininess.value = Math.max(material.shininess, 1e-4); // to prevent pow( 0.0, 0.0 )

  if (material.emissiveMap) {
    uniforms.emissiveMap.value = material.emissiveMap;
  }

  if (material.bumpMap) {
    uniforms.bumpMap.value = material.bumpMap;
    uniforms.bumpScale.value = material.bumpScale;
  }

  if (material.normalMap) {
    uniforms.normalMap.value = material.normalMap;
    uniforms.normalScale.value.copy(material.normalScale);
  }

  if (material.displacementMap) {
    uniforms.displacementMap.value = material.displacementMap;
    uniforms.displacementScale.value = material.displacementScale;
    uniforms.displacementBias.value = material.displacementBias;
  }
}

function refreshUniformsToon(uniforms, material) {
  refreshUniformsPhong(uniforms, material);

  if (material.gradientMap) {
    uniforms.gradientMap.value = material.gradientMap;
  }
}

function refreshUniformsStandard(uniforms, material) {
  uniforms.roughness.value = material.roughness;
  uniforms.metalness.value = material.metalness;

  if (material.roughnessMap) {
    uniforms.roughnessMap.value = material.roughnessMap;
  }

  if (material.metalnessMap) {
    uniforms.metalnessMap.value = material.metalnessMap;
  }

  if (material.emissiveMap) {
    uniforms.emissiveMap.value = material.emissiveMap;
  }

  if (material.bumpMap) {
    uniforms.bumpMap.value = material.bumpMap;
    uniforms.bumpScale.value = material.bumpScale;
  }

  if (material.normalMap) {
    uniforms.normalMap.value = material.normalMap;
    uniforms.normalScale.value.copy(material.normalScale);
  }

  if (material.displacementMap) {
    uniforms.displacementMap.value = material.displacementMap;
    uniforms.displacementScale.value = material.displacementScale;
    uniforms.displacementBias.value = material.displacementBias;
  }

  if (material.envMap) {
    //uniforms.envMap.value = material.envMap; // part of uniforms common
    uniforms.envMapIntensity.value = material.envMapIntensity;
  }
}

function refreshUniformsPhysical(uniforms, material) {
  uniforms.clearCoat.value = material.clearCoat;
  uniforms.clearCoatRoughness.value = material.clearCoatRoughness;

  refreshUniformsStandard(uniforms, material);
}

function refreshUniformsDepth(uniforms, material) {
  if (material.displacementMap) {
    uniforms.displacementMap.value = material.displacementMap;
    uniforms.displacementScale.value = material.displacementScale;
    uniforms.displacementBias.value = material.displacementBias;
  }
}

function refreshUniformsDistance(uniforms, material) {
  if (material.displacementMap) {
    uniforms.displacementMap.value = material.displacementMap;
    uniforms.displacementScale.value = material.displacementScale;
    uniforms.displacementBias.value = material.displacementBias;
  }

  uniforms.referencePosition.value.copy(material.referencePosition);
  uniforms.nearDistance.value = material.nearDistance;
  uniforms.farDistance.value = material.farDistance;
}

function refreshUniformsNormal(uniforms, material) {
  if (material.bumpMap) {
    uniforms.bumpMap.value = material.bumpMap;
    uniforms.bumpScale.value = material.bumpScale;
  }

  if (material.normalMap) {
    uniforms.normalMap.value = material.normalMap;
    uniforms.normalScale.value.copy(material.normalScale);
  }

  if (material.displacementMap) {
    uniforms.displacementMap.value = material.displacementMap;
    uniforms.displacementScale.value = material.displacementScale;
    uniforms.displacementBias.value = material.displacementBias;
  }
}

function updateUniforms(uniforms, material) {
  if (fog && material.fog) {
    refreshUniformsFog(m_uniforms, fog);
  }

  if (material.isMeshBasicMaterial) {
    refreshUniformsCommon(m_uniforms, material);
  } else if (material.isMeshLambertMaterial) {
    refreshUniformsCommon(m_uniforms, material);
    refreshUniformsLambert(m_uniforms, material);
  } else if (material.isMeshPhongMaterial) {
    refreshUniformsCommon(m_uniforms, material);

    if (material.isMeshToonMaterial) {
      refreshUniformsToon(m_uniforms, material);
    } else {
      refreshUniformsPhong(m_uniforms, material);
    }
  } else if (material.isMeshStandardMaterial) {
    refreshUniformsCommon(m_uniforms, material);

    if (material.isMeshPhysicalMaterial) {
      refreshUniformsPhysical(m_uniforms, material);
    } else {
      refreshUniformsStandard(m_uniforms, material);
    }
  } else if (material.isMeshDepthMaterial) {
    refreshUniformsCommon(m_uniforms, material);
    refreshUniformsDepth(m_uniforms, material);
  } else if (material.isMeshDistanceMaterial) {
    refreshUniformsCommon(m_uniforms, material);
    refreshUniformsDistance(m_uniforms, material);
  } else if (material.isMeshNormalMaterial) {
    refreshUniformsCommon(m_uniforms, material);
    refreshUniformsNormal(m_uniforms, material);
  } else if (material.isLineBasicMaterial) {
    refreshUniformsLine(m_uniforms, material);

    if (material.isLineDashedMaterial) {
      refreshUniformsDash(m_uniforms, material);
    }
  } else if (material.isPointsMaterial) {
    refreshUniformsPoints(m_uniforms, material);
  } else if (material.isShadowMaterial) {
    m_uniforms.color.value = material.color;
    m_uniforms.opacity.value = material.opacity;
  }

  if (m_uniforms.ltcMat !== undefined)
    m_uniforms.ltcMat.value = THREE.UniformsLib.LTC_MAT_TEXTURE;
  if (m_uniforms.ltcMag !== undefined)
    m_uniforms.ltcMag.value = THREE.UniformsLib.LTC_MAG_TEXTURE;
}

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
          instances: { offsets: [], orientations: [] },
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
      const orientationAttribute = new THREE.InstancedBufferAttribute(
        new Float32Array(instances.orientations),
        4,
      );

      // Iterate over each mesh in this tile.
      for (const uuid in tile.meshes) {
        const mesh = tile.meshes[uuid];
        const meshGeometry = mesh.geometry;
        const meshMaterial = mesh.mesh.material;

        //const shader = THREE.ShaderLib.basic;
        const shader = SHADERLIB_MATERIALS[meshMaterial.type];
        const uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        for (const uniform in shader.uniforms) {
          if (meshMaterial[uniform] !== undefined) {
            uniforms[uniform].value = meshMaterial[uniform];
          }
        }
        uniforms['diffuse'].value = meshMaterial.color;

        console.log(uuid);
        if (meshMaterial.type == 'MeshStandardMaterial') {
          console.log(meshMaterial);
          console.log(uniforms);
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
        instanceGeometry.addAttribute(
          'tilemapOrientation',
          orientationAttribute,
        );

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
          const orientation = new THREE.Quaternion().setFromAxisAngle(
            Z_AXIS,
            M_TAU_SCALED * b,
          );

          // Add this instance's position to the instanced attributes.
          instances.offsets.push(x, y, 0);
          instances.orientations.push(
            orientation.x,
            orientation.y,
            orientation.z,
            orientation.w,
          );
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
