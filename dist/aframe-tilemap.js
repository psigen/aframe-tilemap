(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("three"), require("aframe"));
	else if(typeof define === 'function' && define.amd)
		define("aframeTilemap", ["three", "aframe"], factory);
	else if(typeof exports === 'object')
		exports["aframeTilemap"] = factory(require("three"), require("aframe"));
	else
		root["aframeTilemap"] = factory(root["THREE"], root["AFRAME"]);
})(typeof self !== 'undefined' ? self : this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.waitUntilLoaded = waitUntilLoaded;
var timeout = function timeout(ms) {
  return new Promise(function (res) {
    return setTimeout(res, ms);
  });
};

function waitUntilLoaded(entity) {
  // Is this entity going to take time to load (is the readyEvent attribute
  // defined according to our spec)?
  var readyEvent = entity.data.readyEvent;
  if (!readyEvent) return Promise.resolve();

  // If the entity will take time to load, listen for the ready event and
  // resolve when it is called.
  return new Promise(function (resolve, reject) {
    entity.el.addEventListener(readyEvent, function (e) {
      // For some reason, there is some additional time for the
      // transformations in the mesh.matrixWorld to update after the
      // 'model-loaded' event is emitted.
      setTimeout(function () {
        resolve();
      }, 100);
    });
  });
}

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
var SHADERLIB_MATERIALS = exports.SHADERLIB_MATERIALS = {
  MeshBasicMaterial: THREE.ShaderLib.basic,
  MeshStandardMaterial: THREE.ShaderLib.standard
};
var M_TAU_SCALED = exports.M_TAU_SCALED = 2.0 * Math.PI / 256.0;
var Z_AXIS = exports.Z_AXIS = new THREE.Vector3(0, 0, 1);
var SHADERLIB_DEFAULT_MATERIAL = exports.SHADERLIB_DEFAULT_MATERIAL = SHADERLIB_MATERIALS['MeshStandardMaterial'];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(5);

__webpack_require__(6);

__webpack_require__(8);

// The tile component is a placeholder used to identify which <a-entity>
// will be merged to construct the tile element of the given value.
// Generally, these entities will also have the component visible="false".
AFRAME.registerComponent('tile', {
  schema: {
    id: { type: 'int' },
    readyEvent: { type: 'string', default: '' }
  }
});

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _three = __webpack_require__(0);

var THREE = _interopRequireWildcard(_three);

var _aframe = __webpack_require__(1);

var _aframe2 = _interopRequireDefault(_aframe);

var _utils = __webpack_require__(2);

var _constants = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

_aframe2.default.registerComponent('tilemap-cloned', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 1 },
    tileHeight: { type: 'number', default: 1 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
    debug: { type: 'boolean', default: true }
  },

  init: function init() {
    var _this = this;

    var el = this.el;
    var tiles = this.tiles = {};
    var tileLoadingPromises = [];

    // Record all current tile children of this component.
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = el.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var child = _step.value;

        var tile = child.components.tile;
        if (tile) {
          tiles[tile.data.id] = tile;
          tileLoadingPromises.push((0, _utils.waitUntilLoaded)(tile));
        }
      }

      // TODO: add event handler for new children.
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    Promise.all(tileLoadingPromises).then(function () {
      _this.constructClones();
      _this.el.emit('model-loaded');
    });
  },

  constructClones: function constructClones() {
    var t0 = performance.now();
    var tiles = this.tiles;

    var img = this.data.src;
    var imgWidth = img.naturalWidth;
    var imgHeight = img.naturalHeight;

    var tileWidth = this.data.tileWidth;
    var tileHeight = -this.data.tileHeight;
    var tileOffsetX = -tileWidth * imgWidth * this.data.origin.x;
    var tileOffsetY = -tileHeight * imgHeight * this.data.origin.y;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    var data = context.getImageData(0, 0, imgWidth, imgHeight).data;

    var index = 0;
    for (var row = 0; row < imgHeight; ++row) {
      for (var col = 0; col < imgWidth; ++col) {
        // Extract the pixel components used for the tile rasterization.
        var _data$slice = data.slice(index, index + 4),
            _data$slice2 = _slicedToArray(_data$slice, 4),
            r = _data$slice2[0],
            g = _data$slice2[1],
            b = _data$slice2[2],
            a = _data$slice2[3];

        index += 4;

        // Compute the tileId and rotation associated with this tile.
        var tileId = 256 * r + g;
        var rotation = _constants.M_TAU_SCALED * b;

        // Retrieve the appropriate tile geometry and merge it into place.
        if (tileId in tiles) {
          var tile = tiles[tileId];
          var tileO3D = tile.el.object3D;
          var instanceO3D = tileO3D.clone();

          instanceO3D.translateX(tileWidth * col + tileOffsetX);
          instanceO3D.translateY(tileHeight * row + tileOffsetY);
          instanceO3D.rotateZ(rotation);
          instanceO3D.visible = true;

          this.el.object3D.add(instanceO3D);
        }
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      var t1 = performance.now();
      console.log('Tile cloning took ' + (t1 - t0) + ' milliseconds.');
    }
  }
});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _three = __webpack_require__(0);

var THREE = _interopRequireWildcard(_three);

var _aframe = __webpack_require__(1);

var _aframe2 = _interopRequireDefault(_aframe);

var _conversions = __webpack_require__(7);

var _utils = __webpack_require__(2);

var _constants = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var INSTANCED_VERTEX_SHADER = '\nprecision highp float;\n\nattribute vec3 tilemapOffset;\n\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvarying vec3 vViewPosition;\n\nvoid main() {\n  vec4 tilemapOrientation = vec4(0, 0, cos(tilemapOffset.z), sin(tilemapOffset.z));\n  vec3 tilemapPosition = vec3(tilemapOffset.xy, 0.0);\n\n  vec3 vPosition = position;\n  vec3 vcV = cross( tilemapOrientation.xyz, vPosition );\n  vPosition = vcV * ( 2.0 * tilemapOrientation.w ) + ( cross( tilemapOrientation.xyz, vcV ) * 2.0 + vPosition );\n  vUv = uv;\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( tilemapPosition + vPosition, 1.0 );\n}\n';

_aframe2.default.registerComponent('tilemap-instanced', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 1 },
    tileHeight: { type: 'number', default: 1 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
    debug: { type: 'boolean', default: true }
  },

  init: function init() {
    var _this = this;

    var el = this.el;
    var tiles = this.tiles = {};

    // Record all current tile children of this component.
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = el.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var child = _step.value;

        var tile = child.components.tile;
        if (tile) {
          tiles[tile.data.id] = {
            entity: tile,
            meshes: {},
            instances: { offsets: [] }
          };
        }
      }

      // TODO: add event handler for new children.
      // Construct tilemap after a number of pre-processing steps.
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    this.constructTiles().then(function () {
      _this.constructInstances();
      _this.constructMeshes();
    }).then(function () {
      _this.el.emit('model-loaded');
    });
  },


  // Take all map geometry and add it as meshes to the scene.
  constructMeshes: function constructMeshes() {
    var t0 = performance.now();
    var tiles = this.tiles;

    for (var tileId in tiles) {
      var tile = tiles[tileId];
      var instances = tile.instances;
      if (instances.offsets.length <= 0) continue;

      // Create instance attributes for all meshes in this tile.
      var offsetAttribute = new THREE.InstancedBufferAttribute(new Float32Array(instances.offsets), 3);

      // Iterate over each mesh in this tile.
      for (var uuid in tile.meshes) {
        var mesh = tile.meshes[uuid];
        var meshGeometry = mesh.geometry;
        var meshMaterial = mesh.mesh.material;

        var shader = _constants.SHADERLIB_MATERIALS[meshMaterial.type] || _constants.SHADERLIB_DEFAULT_MATERIAL;
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
        (0, _conversions.updateUniforms)(uniforms, meshMaterial);

        var instanceMaterial = new THREE.ShaderMaterial({
          uniforms: uniforms,
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
            FLIP_SIDED: !meshMaterial.flipSided
          }
        });

        var instanceGeometry = new THREE.InstancedBufferGeometry();
        instanceGeometry.index = meshGeometry.index;
        for (var attribute in meshGeometry.attributes) {
          instanceGeometry.addAttribute(attribute, meshGeometry.getAttribute(attribute));
        }
        instanceGeometry.addAttribute('tilemapOffset', offsetAttribute);

        var instance = new THREE.Mesh(instanceGeometry, instanceMaterial);
        this.el.object3D.add(instance);
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      var t1 = performance.now();
      console.log('Tile mesh creation took ' + (t1 - t0).toFixed(2) + ' ms.');
    }
  },


  // 1. Get image from this.data.
  // 2. For each pixel in image.
  // 3. If the pixel value is in this.tiles.
  // 4. Add that tile at the corresponding position and rotation.
  constructInstances: function constructInstances() {
    var t0 = performance.now();
    var tiles = this.tiles;

    var img = this.data.src;
    var imgWidth = img.naturalWidth;
    var imgHeight = img.naturalHeight;

    var tileWidth = this.data.tileWidth;
    var tileHeight = -this.data.tileHeight;
    var tileOffsetX = -tileWidth * imgWidth * this.data.origin.x;
    var tileOffsetY = -tileHeight * imgHeight * this.data.origin.y;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    var data = context.getImageData(0, 0, imgWidth, imgHeight).data;

    var index = 0;
    for (var row = 0; row < imgHeight; ++row) {
      for (var col = 0; col < imgWidth; ++col) {
        // Extract the pixel components used for the tile rasterization.
        var _data$slice = data.slice(index, index + 4),
            _data$slice2 = _slicedToArray(_data$slice, 4),
            r = _data$slice2[0],
            g = _data$slice2[1],
            b = _data$slice2[2],
            a = _data$slice2[3];

        index += 4;

        // Compute the tileId and rotation associated with this tile.
        var tileId = 256 * r + g;

        // Retrieve the appropriate tile geometry and merge it into place.
        if (tileId in tiles) {
          // Determine instance and tile position.
          var instances = tiles[tileId].instances;
          var x = tileWidth * col + tileOffsetX;
          var y = tileHeight * row + tileOffsetY;
          var theta = _constants.M_TAU_SCALED * b;

          // Add this instance's position to the instanced attributes.
          instances.offsets.push(x, y, theta);
        }
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      var t1 = performance.now();
      console.log('Tile instancing took ' + (t1 - t0).toFixed(2) + ' ms.');
    }
  },
  constructTiles: function constructTiles() {
    var t0 = performance.now();
    var tiles = this.tiles;
    var tileLoadingPromises = [];

    this.el.object3D.updateMatrixWorld();
    var invMatrixWorld = new THREE.Matrix4().getInverse(this.el.object3D.matrixWorld);

    var _loop = function _loop(tileId) {
      var tile = tiles[tileId];
      var meshes = tile.meshes;

      var tileLoadingPromise = (0, _utils.waitUntilLoaded)(tile.entity).then(function () {
        tile.entity.el.object3D.traverse(function (mesh) {
          if (mesh.type !== 'Mesh') return;

          var geometry = mesh.geometry.type === 'BufferGeometry' ? new THREE.BufferGeometry().copy(mesh.geometry) : new THREE.BufferGeometry().fromGeometry(mesh.geometry);

          mesh.updateMatrixWorld();
          var matrix = new THREE.Matrix4().copy(invMatrixWorld).multiply(mesh.matrixWorld);
          geometry.applyMatrix(matrix);

          meshes[mesh.uuid] = { mesh: mesh, geometry: geometry };
        });
      });

      tileLoadingPromises.push(tileLoadingPromise);
    };

    for (var tileId in tiles) {
      _loop(tileId);
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      var t1 = performance.now();
      console.log('Tile definition took ' + (t1 - t0).toFixed(2) + ' ms.');
    }

    return Promise.all(tileLoadingPromises);
  },
  update: function update(oldData) {
    // TODO: Regenerate mesh if these properties change.
  },
  remove: function remove() {
    // Do nothing.
  }
});

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateUniforms = updateUniforms;
// This code is copied directly out of the THREE.WebGLRenderer, as this was the
// most consistent way I could think to replicate the functionality of the
// original prebuilt shaders in a ShaderMaterial.

function refreshUniformsCommon(uniforms, material) {
  uniforms.opacity.value = material.opacity;

  if (material.color) {
    uniforms.diffuse.value = material.color;
  }

  if (material.emissive) {
    uniforms.emissive.value.copy(material.emissive).multiplyScalar(material.emissiveIntensity);
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
    uniforms.flipEnvMap.value = !(material.envMap && material.envMap.isCubeTexture) ? 1 : -1;

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

      uvScaleMap.matrix.setUvTransform(offset.x, offset.y, repeat.x, repeat.y, rotation, center.x, center.y);
    }

    if (uniforms.uvTransform) uniforms.uvTransform.value.copy(uvScaleMap.matrix);
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

      material.map.matrix.setUvTransform(offset.x, offset.y, repeat.x, repeat.y, rotation, center.x, center.y);
    }

    if (uniforms.uvTransform) uniforms.uvTransform.value.copy(material.map.matrix);
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

function updateUniforms(m_uniforms, material) {
  if (material.fog) {
    refreshUniformsFog(m_uniforms, material.fog);
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

  if (m_uniforms.ltcMat !== undefined) m_uniforms.ltcMat.value = THREE.UniformsLib.LTC_MAT_TEXTURE;
  if (m_uniforms.ltcMag !== undefined) m_uniforms.ltcMag.value = THREE.UniformsLib.LTC_MAG_TEXTURE;
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _three = __webpack_require__(0);

var THREE = _interopRequireWildcard(_three);

var _aframe = __webpack_require__(1);

var _aframe2 = _interopRequireDefault(_aframe);

var _utils = __webpack_require__(2);

var _constants = __webpack_require__(3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

_aframe2.default.registerComponent('tilemap-merged', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 1 },
    tileHeight: { type: 'number', default: 1 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
    debug: { type: 'boolean', default: true }
  },

  init: function init() {
    var _this = this;

    var el = this.el;
    var tiles = this.tiles = {};

    // Record all current tile children of this component.
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = el.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var child = _step.value;

        var tile = child.components.tile;
        if (tile) {
          tiles[tile.data.id] = {
            entity: tile,
            meshes: {},
            geometries: {}
          };
        }
      }

      // TODO: add event handler for new children.
      // Construct tilemap after a number of pre-processing steps.
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    this.constructTiles().then(function () {
      _this.constructGeometry();
      _this.constructMeshes();
    }).then(function () {
      _this.el.emit('model-loaded');
    });
  },


  // Take all map geometry and add it as meshes to the scene.
  constructMeshes: function constructMeshes() {
    var t0 = performance.now();
    var tiles = this.tiles;

    for (var tileId in tiles) {
      var tile = tiles[tileId];
      var meshes = tile.meshes;

      for (var uuid in meshes) {
        var _meshes$uuid = meshes[uuid],
            mesh = _meshes$uuid.mesh,
            mergedGeometry = _meshes$uuid.mergedGeometry;

        var mergedMesh = new THREE.Mesh(mergedGeometry, mesh.material);
        this.el.object3D.add(mergedMesh);
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      var t1 = performance.now();
      console.log('Tile mesh creation took ' + (t1 - t0).toFixed(2) + ' ms.');
    }
  },


  // 1. Get image from this.data.
  // 2. For each pixel in image.
  // 3. If the pixel value is in this.tiles.
  // 4. Add that tile at the corresponding position and rotation.
  constructGeometry: function constructGeometry() {
    var t0 = performance.now();
    var tiles = this.tiles;

    var img = this.data.src;
    var imgWidth = img.naturalWidth;
    var imgHeight = img.naturalHeight;

    var tileWidth = this.data.tileWidth;
    var tileHeight = -this.data.tileHeight;
    var tileOffsetX = -tileWidth * imgWidth * this.data.origin.x;
    var tileOffsetY = -tileHeight * imgHeight * this.data.origin.y;

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.drawImage(img, 0, 0);
    var data = context.getImageData(0, 0, imgWidth, imgHeight).data;

    this.el.object3D.parent.updateMatrixWorld();
    var invRootMatrixWorld = new THREE.Matrix4().getInverse(this.el.object3D.matrixWorld);

    var index = 0;
    for (var row = 0; row < imgHeight; ++row) {
      for (var col = 0; col < imgWidth; ++col) {
        // Extract the pixel components used for the tile rasterization.
        var _data$slice = data.slice(index, index + 4),
            _data$slice2 = _slicedToArray(_data$slice, 4),
            r = _data$slice2[0],
            g = _data$slice2[1],
            b = _data$slice2[2],
            a = _data$slice2[3];

        index += 4;

        // Compute the tileId and rotation associated with this tile.
        var tileId = 256 * r + g;
        var rotation = _constants.M_TAU_SCALED * b;

        // Retrieve the appropriate tile geometry and merge it into place.
        if (tileId in tiles) {
          var x = tileWidth * col + tileOffsetX;
          var y = tileHeight * row + tileOffsetY;
          this.addTileGeometry(tileId, x, y, rotation, invRootMatrixWorld);
        }
      }
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      var t1 = performance.now();
      console.log('Tile geometry merging took ' + (t1 - t0).toFixed(2) + ' ms.');
    }
  },
  addTileGeometry: function addTileGeometry(tileId, x, y, theta, invRootMatrixWorld) {
    var meshes = this.tiles[tileId].meshes;

    // TODO: what is the performance of this?
    for (var uuid in meshes) {
      var _meshes$uuid2 = meshes[uuid],
          mesh = _meshes$uuid2.mesh,
          mergedGeometry = _meshes$uuid2.mergedGeometry;


      var matrix = new THREE.Matrix4().makeTranslation(x, y, 0.0);
      matrix.multiply(new THREE.Matrix4().makeRotationZ(theta));
      matrix.multiply(invRootMatrixWorld);
      matrix.multiply(mesh.matrixWorld);

      var geometry = mesh.geometry;
      if (geometry instanceof THREE.BufferGeometry) {
        geometry = new THREE.Geometry().fromBufferGeometry(mesh.geometry);
      }
      mergedGeometry.merge(geometry, matrix);
    }
  },
  constructTiles: function constructTiles() {
    var t0 = performance.now();
    var tiles = this.tiles;
    var tileLoadingPromises = [];

    var _loop = function _loop(tileId) {
      var tile = tiles[tileId];
      var entity = tile.entity;
      var meshes = tile.meshes;

      var tileLoadingPromise = (0, _utils.waitUntilLoaded)(entity).then(function () {
        entity.el.object3D.traverse(function (mesh) {
          if (mesh.type !== 'Mesh') return;

          mesh.updateMatrixWorld();
          var mergedGeometry = new THREE.Geometry();
          meshes[mesh.uuid] = { mesh: mesh, mergedGeometry: mergedGeometry };
        });
      });

      tileLoadingPromises.push(tileLoadingPromise);
    };

    for (var tileId in tiles) {
      _loop(tileId);
    }

    // If the debug flag is set, print timing metrics.
    if (this.data.debug) {
      var t1 = performance.now();
      console.log('Tile cache creation took ' + (t1 - t0).toFixed(2) + ' ms.');
    }

    return Promise.all(tileLoadingPromises);
  },
  update: function update(oldData) {
    // TODO: Regenerate mesh if these properties change.
  },
  remove: function remove() {
    // Do nothing.
  }
});

/***/ })
/******/ ]);
});