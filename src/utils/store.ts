let registeredStore = null;

export function registerStore(store) {
  registeredStore = store;
}

export function accessStore() {
  return registeredStore;
}
