
export function extractFileName(src: string) {
  if (src.lastIndexOf('/') !== -1) {
    return src.substr(src.lastIndexOf('/') + 1);
  }

  return src;
}
