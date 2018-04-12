const timeout = ms => new Promise(res => setTimeout(res, ms));

export function waitUntilLoaded(entity) {
  // Is this entity going to take time to load (is the readyEvent attribute
  // defined according to our spec)?
  const readyEvent = entity.data.readyEvent;
  if (!readyEvent) return Promise.resolve();

  // If the entity will take time to load, listen for the ready event and
  // resolve when it is called.
  return new Promise((resolve, reject) => {
    entity.el.addEventListener(readyEvent, e => {
      // For some reason, there is some additional time for the
      // transformations in the mesh.matrixWorld to update after the
      // 'model-loaded' event is emitted.
      setTimeout(() => {
        resolve();
      }, 100);
    });
  });
}

export function isBufferGeometry(geometry) {
  return geometry.type === 'BufferGeometry';
}
