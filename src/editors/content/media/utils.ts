
export function extractFileName(src: string) {
  if (src.lastIndexOf('/') !== -1) {
    return src.substr(src.lastIndexOf('/') + 1);
  }

  return src;
}


export function adjustPath(path, resourcePath) {
  const dirCount = resourcePath.split('\/').length;
  let updated = path;
  for (let i = 0; i < dirCount; i += 1) {
    updated = '../' + updated;
  }
  return updated;
}
