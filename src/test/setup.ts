const store = new Map<string, string>()

const localStorageStub: Storage = {
  get length() { return store.size },
  clear: () => store.clear(),
  getItem: (key) => store.get(key) ?? null,
  key: (i) => Array.from(store.keys())[i] ?? null,
  removeItem: (key) => { store.delete(key) },
  setItem: (key, value) => { store.set(key, String(value)) },
}

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageStub,
  writable: true,
})
