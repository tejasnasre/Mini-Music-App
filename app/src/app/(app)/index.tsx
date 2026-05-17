import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useActiveMediaItem, useIsPlaying } from "@rntp/player";

import { useAuthStore } from "../../store/auth";
import { useFavoritesStore } from "../../store/favorites";
import { usePlayerStore } from "../../store/player";
import { api } from "../../lib/api";
import type { FeedResponse, Track } from "../../types/track";
import { Button, Card, Spinner, useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function FeaturedCard({
  track,
  onPress,
}: {
  track: Track;
  onPress: () => void;
}) {
  const accentColor = useThemeColor("accent");

  return (
    <Pressable onPress={onPress} style={{ width: 160 }}>
      <View
        style={{
          width: 160,
          height: 160,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: track.cover_image }}
          style={{ width: 160, height: 160 }}
          contentFit="cover"
          transition={200}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          marginTop: 8,
          paddingHorizontal: 2,
        }}
      >
        <View
          style={{
            width: 3,
            height: 30,
            borderRadius: 2,
            backgroundColor: accentColor,
            marginRight: 6,
            marginTop: 1,
          }}
        />
        <View style={{ flex: 1 }}>
          <Text
            numberOfLines={1}
            className="text-foreground text-[13px] font-bold tracking-[0.1px]"
          >
            {track.title}
          </Text>
          <Text
            numberOfLines={1}
            className="text-muted text-[11px] font-regular mt-0.5"
          >
            {track.artists[0]?.name ?? "Unknown"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

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
    <Pressable onPress={onPress} className="mb-3">
      <Card variant="secondary" className="flex-row items-center px-4 py-3">
        <View className="w-13 h-13 rounded-[10px] overflow-hidden">
          <Image
            source={{ uri: track.cover_image }}
            style={{ width: 52, height: 52 }}
            contentFit="cover"
            transition={200}
          />
        </View>

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
          <Text className="text-muted text-xs mt-1 font-regular opacity-60">
            {track.genre[0]} · {track.duration_formatted}
          </Text>
        </View>

        {isActive && <View className="w-2 h-2 rounded-full bg-accent ml-2" />}
      </Card>
    </Pressable>
  );
}

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
    <Pressable onPress={onExpand} className="mx-4 mb-safe-offset-3">
      <Card
        className="overflow-hidden"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 10,
        }}
      >
        <Card.Body className="flex-row items-center px-2">
          <View className="w-11 h-11 rounded-[10px] overflow-hidden">
            <Image
              source={{ uri: artworkUrl }}
              style={{ width: 44, height: 44 }}
              contentFit="cover"
            />
          </View>

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

          <Button
            isIconOnly
            size="sm"
            variant="primary"
            onPress={(e) => {
              e.stopPropagation?.();
              onToggle();
            }}
            className="ml-2"
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={16}
              color="#fff"
            />
          </Button>
        </Card.Body>
      </Card>
    </Pressable>
  );
}

export default function Home() {
  const userEmail = useAuthStore((s) => s.userEmail);
  const logout = useAuthStore((s) => s.logout);
  const { playTrack, togglePlay, trackMap } = usePlayerStore();
  const favoriteCount = Object.keys(useFavoritesStore((s) => s.tracks)).length;
  const accentColor = useThemeColor("accent");

  const activeItem = useActiveMediaItem();
  const isPlaying = useIsPlaying();

  const currentTrack = activeItem?.mediaId
    ? (trackMap[activeItem.mediaId] ?? null)
    : null;

  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const username = userEmail?.split("@")[0] ?? "there";

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

  const handlePlayTrack = (track: Track, queue: Track[]) => {
    playTrack(track, queue);
    router.push("/(app)/player");
  };

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/onboarding");
  };

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
            tintColor={accentColor}
          />
        }
      >
        <View className="flex-row items-center justify-between px-6 pt-safe-offset-2 pb-5">
          <View>
            <Text className="text-muted text-sm font-regular">
              {getGreeting()},
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-foreground text-2xl font-extraBold">
                {username}
              </Text>
              <Ionicons name="hand-right" size={24} color={accentColor} />
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            <View>
              <Button
                isIconOnly
                variant="secondary"
                size="sm"
                onPress={() => router.push("/(app)/favorites")}
              >
                <Ionicons
                  name="bookmark-outline"
                  size={19}
                  color={accentColor}
                />
              </Button>
              {favoriteCount > 0 && (
                <View className="absolute -top-1 -right-1 min-w-5 h-5 rounded-full bg-accent items-center justify-center px-1">
                  <Text className="text-accent-foreground text-[10px] font-bold">
                    {favoriteCount}
                  </Text>
                </View>
              )}
            </View>

            <Button isIconOnly variant="ghost" size="sm" onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={18} color={accentColor} />
            </Button>
          </View>
        </View>

        {loading && (
          <View className="items-center justify-center py-20 gap-4">
            <Spinner size="lg" color="default" />
            <Text className="text-muted text-sm font-regular">
              Loading feed…
            </Text>
          </View>
        )}

        {!loading && error && (
          <View className="mx-6">
            <Card className="items-center p-6">
              <Card.Body className="items-center">
                <Ionicons
                  name="cloud-offline-outline"
                  size={48}
                  color={accentColor}
                />
                <Card.Title className="mt-3 text-center">
                  Backend offline
                </Card.Title>
                <Card.Description className="mt-2 text-center leading-5">
                  {error}
                </Card.Description>
              </Card.Body>
              <Card.Footer className="justify-center">
                <Button
                  variant="primary"
                  onPress={() => {
                    setLoading(true);
                    loadFeed();
                  }}
                >
                  <Button.Label>Retry</Button.Label>
                </Button>
              </Card.Footer>
            </Card>
          </View>
        )}

        {!loading && feed && (
          <>
            <View className="mb-6">
              <View className="flex-row items-center justify-between px-6 mb-4">
                <View className="flex-row items-center gap-2">
                  <Ionicons name="flame" size={20} color={accentColor} />
                  <Text className="text-foreground text-lg font-bold">
                    Featured
                  </Text>
                </View>
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

            <View className="px-6 mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <Ionicons name="time-outline" size={20} color={accentColor} />
                <Text className="text-foreground text-lg font-bold">
                  Recently Added
                </Text>
              </View>

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

        <View className={currentTrack ? "h-24" : "h-6"} />
      </ScrollView>

      {currentTrack && (
        <View className="absolute bottom-0 left-0 right-0">
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
