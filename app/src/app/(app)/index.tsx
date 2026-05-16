import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useActiveMediaItem, useIsPlaying } from "@rntp/player";

import { useAuthStore } from "@/store/auth";
import { usePlayerStore } from "@/store/player";
import { api } from "@/lib/api";
import type { FeedResponse, Track } from "@/types/track";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Large card shown in the horizontal "Featured" scroll */
function FeaturedCard({
  track,
  onPress,
}: {
  track: Track;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.88}
      style={{ width: 180, height: 220, borderRadius: 20, overflow: "hidden" }}
    >
      {/* Album art */}
      <Image
        source={{ uri: track.cover_image }}
        style={{ width: "100%", height: "100%" }}
        contentFit="cover"
        transition={200}
      />
      {/* Dark gradient overlay */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 90,
          backgroundColor: "rgba(0,0,0,0.62)",
          padding: 12,
          justifyContent: "flex-end",
        }}
      >
        <Text
          numberOfLines={1}
          style={{
            color: "#fff",
            fontFamily: "OpenSans-Bold",
            fontSize: 13,
          }}
        >
          {track.title}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            color: "#9CA3AF",
            fontFamily: "OpenSans-Regular",
            fontSize: 11,
            marginTop: 2,
          }}
        >
          {track.artists[0]?.name ?? "Unknown"}
        </Text>
        <Text
          style={{
            color: "#6B7280",
            fontFamily: "OpenSans-Regular",
            fontSize: 10,
            marginTop: 4,
          }}
        >
          {track.duration_formatted}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

/** Compact row shown in the "Recently Added" list */
function TrackRow({
  track,
  isActive,
  onPress,
}: {
  track: Track;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="flex-row items-center bg-surface rounded-2xl px-4 py-3 mb-3"
    >
      {/* Thumbnail */}
      <View
        style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden" }}
      >
        <Image
          source={{ uri: track.cover_image }}
          style={{ width: 52, height: 52 }}
          contentFit="cover"
          transition={200}
        />
      </View>

      {/* Info */}
      <View className="flex-1 ml-3">
        <Text
          numberOfLines={1}
          className={`text-sm font-semibold ${isActive ? "text-accent" : "text-foreground"}`}
        >
          {track.title}
        </Text>
        <Text
          numberOfLines={1}
          className="text-muted text-xs mt-0.5 font-regular"
        >
          {track.artists.map((a) => a.name).join(", ")}
        </Text>
        <Text
          className="text-muted text-xs mt-1 font-regular"
          style={{ opacity: 0.6 }}
        >
          {track.genre[0]} · {track.duration_formatted}
        </Text>
      </View>

      {/* Active indicator */}
      {isActive && <View className="w-2 h-2 rounded-full bg-accent ml-2" />}
    </TouchableOpacity>
  );
}

/** Sticky mini-player fixed at the bottom of the screen */
function MiniPlayer({
  title,
  artist,
  artworkUrl,
  isPlaying,
  onToggle,
  onExpand,
}: {
  title: string;
  artist: string;
  artworkUrl: string;
  isPlaying: boolean;
  onToggle: () => void;
  onExpand: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onExpand}
      activeOpacity={0.95}
      className="mx-4 mb-safe-offset-3 bg-surface rounded-2xl overflow-hidden"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 10,
      }}
    >
      <View className="flex-row items-center px-4 py-3">
        {/* Artwork */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <Image
            source={{ uri: artworkUrl }}
            style={{ width: 44, height: 44 }}
            contentFit="cover"
          />
        </View>

        {/* Track info */}
        <View className="flex-1 ml-3">
          <Text
            numberOfLines={1}
            className="text-foreground text-sm font-semibold"
          >
            {title}
          </Text>
          <Text
            numberOfLines={1}
            className="text-muted text-xs mt-0.5 font-regular"
          >
            {artist}
          </Text>
        </View>

        {/* Play / Pause button */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          activeOpacity={0.8}
          className="bg-accent w-10 h-10 rounded-full items-center justify-center ml-2"
        >
          <Text
            style={{
              fontSize: 16,
              color: "#000",
              marginLeft: isPlaying ? 0 : 2,
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Home() {
  const userEmail = useAuthStore((s) => s.userEmail);
  const logout = useAuthStore((s) => s.logout);
  const { playTrack, togglePlay, trackMap } = usePlayerStore();

  // RNTP hooks
  const activeItem = useActiveMediaItem();
  const isPlaying = useIsPlaying();

  // Resolve full Track from RNTP's active item
  const currentTrack = activeItem?.mediaId
    ? (trackMap[activeItem.mediaId] ?? null)
    : null;

  // Feed state
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const username = userEmail?.split("@")[0] ?? "there";

  // ── Load feed ──────────────────────────────────────────────────────────────

  const loadFeed = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getFeed(10);
      setFeed(data);
    } catch {
      setError(
        "Couldn't reach the server.\nMake sure the backend is running on port 3000.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadFeed();
  };

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handlePlayTrack = (track: Track, queue: Track[]) => {
    playTrack(track, queue);
    router.push("/(app)/player");
  };

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/onboarding");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        scrollIndicatorInsets={{ right: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#E5A020"
          />
        }
      >
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between px-6 pt-safe-offset-2 pb-5">
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

        {/* ── Loading / Error states ───────────────────────────────────── */}
        {loading && (
          <View className="items-center justify-center py-20">
            <ActivityIndicator size="large" color="#E5A020" />
            <Text className="text-muted text-sm mt-4 font-regular">
              Loading feed…
            </Text>
          </View>
        )}

        {!loading && error && (
          <View className="mx-6 bg-surface rounded-2xl p-6 items-center">
            <Text style={{ fontSize: 36 }}>⚠️</Text>
            <Text className="text-foreground text-base font-semibold mt-3 text-center">
              Backend offline
            </Text>
            <Text className="text-muted text-xs mt-2 text-center font-regular leading-5">
              {error}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setLoading(true);
                loadFeed();
              }}
              className="bg-accent rounded-xl px-6 py-3 mt-5"
            >
              <Text className="text-accent-foreground font-bold text-sm">
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Featured ────────────────────────────────────────────────── */}
        {!loading && feed && (
          <>
            <View className="mb-6">
              <View className="flex-row items-center justify-between px-6 mb-4">
                <Text className="text-foreground text-lg font-bold">
                  🔥 Featured
                </Text>
                <Text className="text-muted text-xs font-regular">
                  {feed.total} tracks total
                </Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
              >
                {feed.featured.map((track) => (
                  <FeaturedCard
                    key={track.id}
                    track={track}
                    onPress={() => handlePlayTrack(track, feed.featured)}
                  />
                ))}
              </ScrollView>
            </View>

            {/* ── Recently Added ─────────────────────────────────────── */}
            <View className="px-6 mb-4">
              <Text className="text-foreground text-lg font-bold mb-4">
                🕐 Recently Added
              </Text>

              {feed.recent.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  isActive={currentTrack?.id === track.id}
                  onPress={() => handlePlayTrack(track, feed.recent)}
                />
              ))}
            </View>
          </>
        )}

        {/* Space so last item isn't hidden behind the mini-player */}
        <View style={{ height: currentTrack ? 96 : 24 }} />
      </ScrollView>

      {/* ── Mini Player ──────────────────────────────────────────────────── */}
      {currentTrack && (
        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <MiniPlayer
            title={currentTrack.title}
            artist={currentTrack.artists.map((a) => a.name).join(", ")}
            artworkUrl={currentTrack.cover_image}
            isPlaying={isPlaying}
            onToggle={togglePlay}
            onExpand={() => router.push("/(app)/player")}
          />
        </View>
      )}
    </View>
  );
}
