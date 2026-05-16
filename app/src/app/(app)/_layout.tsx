import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Home feed */}
      <Stack.Screen name="index" />
      {/* Full-screen player slides up as a modal */}
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
