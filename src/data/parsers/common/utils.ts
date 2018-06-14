// Convert HTMLCollection to pure JS Array
export function toArray(nodes) : Object[] {

  const arr = [];
  for (let i = 0; i < nodes.length; i = i + 1) {
    arr.push(nodes[i]);
  }
  return arr;
}
