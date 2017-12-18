// This code is copied directly out of the THREE.WebGLRenderer, as this was the
// most consistent way I could think to replicate the functionality of the
// original prebuilt shaders in a ShaderMaterial.

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

    if (uniforms.uvTransform)
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

    if (uniforms.uvTransform)
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

export function updateUniforms(m_uniforms, material) {
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

  if (m_uniforms.ltcMat !== undefined)
    m_uniforms.ltcMat.value = THREE.UniformsLib.LTC_MAT_TEXTURE;
  if (m_uniforms.ltcMag !== undefined)
    m_uniforms.ltcMag.value = THREE.UniformsLib.LTC_MAG_TEXTURE;
}
