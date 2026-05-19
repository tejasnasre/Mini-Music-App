import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="favorites" />
      <Stack.Screen
        name="artist/[id]"
        options={{
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="player"
        options={{
          presentation: "modal",
          animation: "slide_from_bottom",
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
