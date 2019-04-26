import { logger, LogTag } from './logger';

const pool = [];
const POOL_SIZE = 10000;

let hits = 0;
let misses = 0;

function fillPool() {
  for (let i = 0; i < POOL_SIZE - pool.length; i += 1) {
    pool.push(guid());
  }
}

const schedule = () => setTimeout(() => { fillPool(); schedule(); }, 1000);

schedule();

setInterval(() => logger.debug(LogTag.DEFAULT, 'Hit rate: ' + (hits / (hits + misses))), 5000);


/**
 * Returns an RFC4122 version 4 compliant GUID.
 * See http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * for source and related discussion. d
 */
export default function guid() {
  if (pool.length > 0) {
    hits = hits + 1;
    // pop() is the fastest way to do get an item.
    // It is O(1) relative to the size of the array
    return pool.pop();
  }
  misses = misses + 1;
  return createOne();
}

function createOne() {
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); // use high-precision timer if available
  }
  return 'dxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[dxy]/g, (c) => {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);

    if (c === 'x') {
      return r.toString(16);
    }
    if (c === 'y') {
      return (r & 0x3 | 0x8).toString(16);
    }

    return (((d + Math.random() * 6) % 6 | 0) + 10).toString(16);
  });
}


(window as any).guid = guid;
