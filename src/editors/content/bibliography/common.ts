export function toFriendlyLabel(key: string) {
  if (key === '') return '';
  const words = key.replace(/([A-Z])/g, ' $1');
  return words.charAt(0).toUpperCase() + words.slice(1);
}


export const ignoredAttributes = {
  id: true,
  guid: true,
  key: true,
  contentType: true,
  elementType: true,
};
