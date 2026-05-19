import { createMMKV } from "react-native-mmkv";
import type { StateStorage } from "zustand/middleware";

/** Shared MMKV instance for the whole app */
export const storage = createMMKV({ id: "mini-music" });

/**
 * Zustand-compatible synchronous storage adapter backed by MMKV.
 * Wraps calls in try/catch so a corrupt value never crashes hydration.
 */
export const mmkvStorage: StateStorage = {
  getItem: (name) => {
    try {
      const value = storage.getString(name);
      return value !== undefined ? value : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      storage.set(name, value);
    } catch {
      // silently fail – better than crashing the app
    }
  },
  removeItem: (name) => {
    try {
      storage.remove(name);
    } catch {
      // silently fail
    }
  },
};
