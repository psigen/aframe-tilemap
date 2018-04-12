export const SHADERLIB_MATERIALS = {
  MeshBasicMaterial: THREE.ShaderLib.basic,
  MeshStandardMaterial: THREE.ShaderLib.standard,
};
export const M_TAU_SCALED = 2.0 * Math.PI / 256.0;
export const Z_AXIS = new THREE.Vector3(0, 0, 1);
export const SHADERLIB_DEFAULT_MATERIAL =
  SHADERLIB_MATERIALS['MeshStandardMaterial'];
