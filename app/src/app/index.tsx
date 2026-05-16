import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/auth";

/**
 * Entry point — immediately redirects based on persisted auth state.
 * Because MMKV is synchronous, Zustand hydrates before the first render
 * so there is no flash of the wrong screen.
 */
export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Redirect href={isAuthenticated ? "/(app)" : "/(auth)/onboarding"} />;
}
