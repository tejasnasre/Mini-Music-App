import { Stack } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import { useEffect } from "react";
import TrackPlayer, { PlayerCommand } from "@rntp/player";

SplashScreen.preventAutoHideAsync();

// ─── RNTP bootstrap ────────────────────────────────────────────────────────────
// setupPlayer() is synchronous in v5. Called at module level so it runs once
// before any component mounts. Background events are handled natively by default.
try {
  TrackPlayer.setupPlayer({ contentType: "music" });

  // Expose play/pause, prev/next, seek on the lock screen & notification.
  // PlayerCommand values: PlayPause | Next | Previous | Seek | Stop | SkipForward | SkipBackward
  TrackPlayer.setCommands({
    capabilities: [
      PlayerCommand.PlayPause,
      PlayerCommand.Next,
      PlayerCommand.Previous,
      PlayerCommand.Seek,
      PlayerCommand.Stop,
    ],
  });
} catch {
  // Player already set up (fast-refresh / hot-reload) — safe to ignore
}

// ─── Root layout ───────────────────────────────────────────────────────────────

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "OpenSans-Light": require("../../assets/fonts/Open_Sans/OpenSans-Light.ttf"),
    "OpenSans-Regular": require("../../assets/fonts/Open_Sans/OpenSans-Regular.ttf"),
    "OpenSans-Medium": require("../../assets/fonts/Open_Sans/OpenSans-Medium.ttf"),
    "OpenSans-SemiBold": require("../../assets/fonts/Open_Sans/OpenSans-SemiBold.ttf"),
    "OpenSans-Bold": require("../../assets/fonts/Open_Sans/OpenSans-Bold.ttf"),
    "OpenSans-ExtraBold": require("../../assets/fonts/Open_Sans/OpenSans-ExtraBold.ttf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView className="flex-1">
      {/*
       * SafeAreaListener acts as the SafeAreaProvider AND fires onChange
       * whenever insets change (rotation, keyboard, multi-window, etc.).
       * Calling Uniwind.updateInsets keeps all pt-safe / pb-safe-offset-*
       * Tailwind classes in sync with the real device insets.
       */}
      <SafeAreaListener onChange={({ insets }) => Uniwind.updateInsets(insets)}>
        <HeroUINativeProvider
          config={{ devInfo: { stylingPrinciples: false } }}
        >
          <Stack screenOptions={{ headerShown: false }} />
        </HeroUINativeProvider>
      </SafeAreaListener>
    </GestureHandlerRootView>
  );
}
