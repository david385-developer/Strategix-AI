import { useSyncExternalStore } from "react";

type Listener = () => void;

type Store<T> = {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: Listener) => () => void;
};

function createStore<T extends object>(
  initializer: (set: Store<T>["setState"], get: () => T) => T
): Store<T> {
  let state: T;
  const listeners = new Set<Listener>();

  const setState: Store<T>["setState"] = (partial) => {
    const next =
      typeof partial === "function"
        ? (partial as (s: T) => Partial<T>)(state)
        : partial;
    state = { ...state, ...next };
    listeners.forEach((l) => l());
  };

  const getState = () => state;
  const subscribe = (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  state = initializer(setState, getState);
  return { getState, setState, subscribe };
}

export function create<T extends object>(
  initializer: (set: Store<T>["setState"], get: () => T) => T
) {
  const store = createStore(initializer);
  function useStore<U = T>(selector?: (state: T) => U): U {
    return useSyncExternalStore(
      store.subscribe,
      () => (selector ? selector(store.getState()) : (store.getState() as unknown as U)),
      () => (selector ? selector(store.getState()) : (store.getState() as unknown as U))
    );
  }
  useStore.getState = store.getState;
  useStore.setState = store.setState;
  return useStore;
}
