import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth";

// ── Mock data ────────────────────────────────────────────────────────────────

const FEATURED = [
  {
    id: "1",
    title: "Top Hits 2025",
    artist: "Various Artists",
    emoji: "🔥",
    bg: "#1e1b4b",
  },
  {
    id: "2",
    title: "Chill Vibes",
    artist: "Lofi Collection",
    emoji: "🌙",
    bg: "#0f2d3d",
  },
  {
    id: "3",
    title: "Energy Boost",
    artist: "Workout Mix",
    emoji: "⚡",
    bg: "#1a2e1a",
  },
  {
    id: "4",
    title: "Late Night",
    artist: "R&B Essentials",
    emoji: "🎷",
    bg: "#2d1a1a",
  },
];

const CATEGORIES = [
  { id: "1", name: "Pop", emoji: "🌟" },
  { id: "2", name: "Hip-Hop", emoji: "🎤" },
  { id: "3", name: "Rock", emoji: "🎸" },
  { id: "4", name: "Jazz", emoji: "🎷" },
  { id: "5", name: "Electronic", emoji: "🎛️" },
  { id: "6", name: "Classical", emoji: "🎻" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ── Screen ───────────────────────────────────────────────────────────────────

export default function Home() {
  const userEmail = useAuthStore((s) => s.userEmail);
  const logout = useAuthStore((s) => s.logout);

  const username = userEmail?.split("@")[0] ?? "there";

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/onboarding");
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        // scrollIndicatorInsets keeps the scrollbar inside the safe area
        scrollIndicatorInsets={{ right: 1 }}
      >
        {/* ── Header — pt-safe-offset-2 clears status bar + a little breath ── */}
        <View className="flex-row items-center justify-between px-6 pt-safe-offset-2 pb-6">
          <View>
            <Text className="text-muted text-sm font-regular">
              {getGreeting()},
            </Text>
            <Text className="text-foreground text-2xl font-extraBold">
              {username} 👋
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.75}
            className="bg-field-background px-4 py-2 rounded-xl"
          >
            <Text className="text-muted text-sm font-semibold">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* ── Featured ─────────────────────────────────── */}
        <View className="mb-8">
          <Text className="text-foreground text-lg px-6 mb-4 font-bold">
            Featured
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
          >
            {FEATURED.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.85}
                style={{
                  width: 160,
                  height: 180,
                  borderRadius: 20,
                  backgroundColor: item.bg,
                  padding: 16,
                  justifyContent: "flex-end",
                }}
              >
                <Text style={{ fontSize: 36, marginBottom: 8 }}>
                  {item.emoji}
                </Text>
                <Text className="text-white text-sm font-bold">
                  {item.title}
                </Text>
                <Text
                  className="text-xs mt-0.5 font-regular"
                  style={{ color: "#9CA3AF" }}
                >
                  {item.artist}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Browse Categories ─────────────────────────── */}
        <View className="px-6 mb-8">
          <Text className="text-foreground text-lg mb-4 font-bold">Browse</Text>

          <View className="flex-row flex-wrap gap-3">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.8}
                className="bg-surface rounded-2xl px-4 py-4 flex-row items-center"
                style={{ width: "47%" }}
              >
                <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                <Text className="text-foreground text-sm ml-3 font-semibold">
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Mini Player — mb-safe-offset-4 lifts it above home indicator ── */}
        <View className="mx-6 mb-safe-offset-4 bg-surface rounded-2xl p-4 flex-row items-center">
          <View className="w-12 h-12 bg-accent rounded-2xl items-center justify-center mr-4">
            <Text style={{ fontSize: 22 }}>🎵</Text>
          </View>
          <View className="flex-1">
            <Text className="text-foreground text-sm font-semibold">
              Nothing playing
            </Text>
            <Text className="text-muted text-xs mt-0.5 font-regular">
              Tap a track to start listening
            </Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            className="bg-accent w-10 h-10 rounded-full items-center justify-center"
          >
            <Text style={{ fontSize: 16, marginLeft: 2 }}>▶</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
