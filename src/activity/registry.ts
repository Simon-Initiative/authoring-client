
export const ActivityRegistry = {};

export interface Activity {
  viewer: Object;
  editor: Object;
}

export function register(name: string, viewer: Object, editor: Object) {
  ActivityRegistry[name] = { viewer, editor}; 
}

export function getActivityByName(name: string) : Activity {
  return ActivityRegistry[name];
}



