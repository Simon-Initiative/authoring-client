
export function getKey(item) {
  return Object.keys(item).filter(k => !k.startsWith('@'))[0];
}
