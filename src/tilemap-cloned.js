import * as THREE from 'three';
import AFRAME from 'aframe';

import { M_TAU_SCALED } from './constants';

AFRAME.registerComponent('tilemap-cloned', {
  schema: {
    src: { type: 'asset' },
    tileWidth: { type: 'number', default: 10 },
    tileHeight: { type: 'number', default: 10 },
    origin: { type: 'vec2', default: { x: 0.5, y: 0.5 } },
    debug: { type: 'boolean', default: true },
  },

  init: function() {
    const el = this.el;
    const tiles = (this.tiles = {});

    // Record all current tile children of this component.
    for (const child of el.children) {
      const tile = child.components.tile;
      if (tile) {
        tiles[tile.data] = tile;
      }
    }

    // TODO: add event handler for new children.
    this.constructClones();
  },

  constructClones: function() {
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
        const rotation = M_TAU_SCALED * b;

        // Retrieve the appropriate tile geometry and merge it into place.
        if (tileId in tiles) {
          const tile = tiles[tileId];
          const tileO3D = tile.el.object3D;
          const instanceO3D = tileO3D.clone();

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
      const t1 = performance.now();
      console.log(`Tile cloning took ${t1 - t0} milliseconds.`);
    }
  },
});
