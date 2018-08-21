export function saveToLocalStorage(key: string, value: string): void {
  (window as any).localStorage.setItem(key, value);
}

export function loadFromLocalStorage(key: string) {
  return JSON.parse((window as any).localStorage.getItem(key));
}

export function removeFromLocalStorage(key: string): void {
  (window as any).localStorage.removeItem(key);
}
