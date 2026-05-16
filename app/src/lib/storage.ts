import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

/** Shared MMKV instance for the whole app */
export const storage = createMMKV({ id: "mini-music" });

/**
 * Zustand-compatible synchronous storage adapter backed by MMKV.
 * MMKV reads/writes are synchronous so no Promises needed.
 */
export const mmkvStorage: StateStorage = {
  getItem: (name) => storage.getString(name) ?? null,
  setItem: (name, value) => storage.set(name, value),
  removeItem: (name) => storage.remove(name),
};
