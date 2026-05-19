import { Stack } from "expo-router";
import "../global.css";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { HeroUINativeProvider } from "heroui-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaListener } from "react-native-safe-area-context";
import { Uniwind } from "uniwind";
import { useEffect, useRef } from "react";
import TrackPlayer, { Event, PlayerCommand } from "@rntp/player";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const playerSetupDoneRef = useRef(false);

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

  useEffect(() => {
    if (playerSetupDoneRef.current) return;

    try {
      TrackPlayer.setupPlayer({ contentType: "music" });
      console.log("[RNTP] setupPlayer success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      // Expected on Fast Refresh / remount when already initialized.
      if (!message.toLowerCase().includes("already set up")) {
        console.error("[RNTP] setupPlayer failed:", message);
      }
    }

    try {
      TrackPlayer.setCommands({
        capabilities: [
          PlayerCommand.PlayPause,
          PlayerCommand.Next,
          PlayerCommand.Previous,
          PlayerCommand.Seek,
          PlayerCommand.Stop,
        ],
      });
      console.log("[RNTP] commands configured");
    } catch (err: unknown) {
      console.error(
        "[RNTP] setCommands failed:",
        err instanceof Error ? err.message : String(err),
      );
    }

    playerSetupDoneRef.current = true;

    const playbackErrorSub = TrackPlayer.addEventListener(
      Event.PlaybackError,
      (event) => {
        console.error("[RNTP] PlaybackError:", event.code, event.message);
      },
    );

    const playbackStateSub = TrackPlayer.addEventListener(
      Event.PlaybackStateChanged,
      (event) => {
        console.log("[RNTP] PlaybackState:", event.state);
      },
    );

    return () => {
      playbackErrorSub.remove();
      playbackStateSub.remove();
    };
  }, []);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView className="flex-1">
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
