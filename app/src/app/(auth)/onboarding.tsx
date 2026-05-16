import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";

const FEATURES = [
  {
    icon: "🎧",
    title: "Discover New Music",
    subtitle: "Explore trending tracks and fresh releases",
  },
  {
    icon: "🎤",
    title: "Artist Profiles",
    subtitle: "Deep-dive into your favourite artists",
  },
  {
    icon: "📻",
    title: "Curated Playlists",
    subtitle: "Hand-picked playlists for every mood",
  },
];

export default function Onboarding() {
  return (
    // No SafeAreaView — pt-safe / pb-safe-offset-* Tailwind classes handle
    // insets via Uniwind.updateInsets wired up in the root layout.
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <View className="flex-1 px-6 pt-safe">
        {/* ── Hero ─────────────────────────────────────────── */}
        <View className="flex-[1.5] items-center justify-end pb-8">
          <View className="w-28 h-28 rounded-full bg-accent items-center justify-center mb-6">
            <Text style={{ fontSize: 54 }}>🎵</Text>
          </View>

          <Text className="text-foreground text-5xl text-center font-extraBold">
            Mini Music
          </Text>
          <Text className="text-muted text-base text-center mt-3 font-regular">
            Your pocket-sized music companion
          </Text>
        </View>

        {/* ── Feature Cards ────────────────────────────────── */}
        <View className="flex-1 justify-center gap-3">
          {FEATURES.map((feat, i) => (
            <View
              key={i}
              className="bg-surface flex-row items-center rounded-2xl px-5 py-4"
            >
              <View className="w-11 h-11 rounded-xl bg-field-background items-center justify-center">
                <Text style={{ fontSize: 22 }}>{feat.icon}</Text>
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-foreground text-sm font-semibold">
                  {feat.title}
                </Text>
                <Text className="text-muted text-xs mt-0.5 font-regular">
                  {feat.subtitle}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── CTA — pb-safe-offset-6 keeps button above home indicator ── */}
        <View className="pt-8 pb-safe-offset-6">
          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
            activeOpacity={0.85}
            className="bg-accent rounded-2xl py-4 items-center"
          >
            <Text className="text-accent-foreground text-base font-bold">
              Sign In to Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
