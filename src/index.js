import './tilemap-cloned';
import './tilemap-instanced';
import './tilemap-merged';

// The tile component is a placeholder used to identify which <a-entity>
// will be merged to construct the tile element of the given value.
// Generally, these entities will also have the component visible="false".
AFRAME.registerComponent('tile', {
  schema: {
    id: { type: 'int' },
    readyEvent: { type: 'string', default: '' },
  },
});
