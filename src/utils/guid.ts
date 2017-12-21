
/**
 * Returns an RFC4122 version 4 compliant GUID.
 * See http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
 * for source and related discussion. d
 */
export default function guid() {
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
