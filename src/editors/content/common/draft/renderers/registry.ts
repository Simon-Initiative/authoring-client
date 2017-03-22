
export const RendererRegistry = {};

export interface BlockRenderer {
  viewer: Object;
  editor: Object;
}

export function register(name: string, viewer: Object, editor: Object) {
  RendererRegistry[name] = { viewer, editor}; 
}

export function getActivityByName(name: string) : BlockRenderer {
  return RendererRegistry[name];
}



