import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
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
import { artistNameToId } from "../../lib/artist";
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

function openArtist(name: string) {
  router.push({
    pathname: "/(app)/artist/[id]",
    params: { id: artistNameToId(name) },
  });
}

/* ─── Featured Card ─────────────────────────────────────────────────────────── */

function FeaturedCard({
  track,
  onPress,
}: {
  track: Track;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="w-[155px]">
      <View className="w-[155px] h-[155px] rounded-[14px] overflow-hidden bg-field-background">
        <Image
          source={{ uri: track.cover_image }}
          style={{ width: 155, height: 155 }}
          contentFit="cover"
          transition={200}
        />
      </View>

      <View className="flex-row items-start mt-2 px-0.5">
        <View
          className="w-[3px] rounded-full bg-accent mr-1.5 mt-0.5"
          style={{ height: 28 }}
        />
        <View className="flex-1">
          <Text
            numberOfLines={1}
            className="text-foreground text-[13px] font-bold"
          >
            {track.title}
          </Text>
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              const name = track.artists[0]?.name;
              if (name) openArtist(name);
            }}
          >
            <Text
              numberOfLines={1}
              className="text-muted text-[11px] font-regular mt-0.5"
            >
              {track.artists[0]?.name ?? "Unknown"}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

/* ─── Track Row ─────────────────────────────────────────────────────────────── */

function TrackRow({
  track,
  isActive,
  isFavorite,
  onPress,
  onToggleFavorite,
}: {
  track: Track;
  isActive: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
}) {
  const mutedColor = useThemeColor("muted");

  return (
    <Pressable onPress={onPress} className="mb-2.5">
      <Card variant="secondary" className="flex-row items-center px-3.5 py-2.5">
        <View className="w-12 h-12 rounded-[10px] overflow-hidden">
          <Image
            source={{ uri: track.cover_image }}
            style={{ width: 48, height: 48 }}
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
          <View className="flex-row items-center mt-0.5">
            {track.artists.map((a, i) => (
              <Pressable
                key={`${track.id}-${a.name}`}
                onPress={(e) => {
                  e.stopPropagation?.();
                  openArtist(a.name);
                }}
              >
                <Text
                  numberOfLines={1}
                  className="text-muted text-xs font-regular"
                >
                  {a.name}
                  {i < track.artists.length - 1 ? ", " : ""}
                </Text>
              </Pressable>
            ))}
            <Text className="text-muted text-xs font-regular opacity-50 mx-1">
              ·
            </Text>
            <Text className="text-muted text-xs font-regular opacity-50">
              {track.duration_formatted}
            </Text>
          </View>
        </View>

        {/* Favorite toggle */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onToggleFavorite();
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          className="ml-2 w-8 h-8 items-center justify-center"
        >
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? "#EF4444" : mutedColor}
          />
        </TouchableOpacity>

        {isActive && <View className="w-2 h-2 rounded-full bg-accent ml-1" />}
      </Card>
    </Pressable>
  );
}

/* ─── Mini Player ───────────────────────────────────────────────────────────── */

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
          shadowOpacity: 0.12,
          shadowRadius: 10,
          elevation: 10,
        }}
      >
        <Card.Body className="flex-row items-center px-2.5">
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

/* ─── Section Header ────────────────────────────────────────────────────────── */

function SectionHeader({
  icon,
  title,
  subtitle,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle?: string;
}) {
  const accentColor = useThemeColor("accent");
  return (
    <View className="flex-row items-center justify-between px-6 mb-4">
      <View className="flex-row items-center gap-2">
        <Ionicons name={icon} size={20} color={accentColor} />
        <Text className="text-foreground text-lg font-bold">{title}</Text>
      </View>
      {subtitle && (
        <Text className="text-muted text-xs font-regular">{subtitle}</Text>
      )}
    </View>
  );
}

/* ─── Home Screen ───────────────────────────────────────────────────────────── */

export default function Home() {
  const userEmail = useAuthStore((s) => s.userEmail);
  const logout = useAuthStore((s) => s.logout);
  const { playTrack, togglePlay, trackMap } = usePlayerStore();
  const favoriteTracks = useFavoritesStore((s) => s.tracks);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const favoriteCount = Object.keys(favoriteTracks).length;
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
        {/* ── Header ── */}
        <View className="flex-row items-center justify-between px-6 pt-safe-offset-2 pb-5">
          <View>
            <Text className="text-muted text-sm font-regular">
              {getGreeting()},
            </Text>
            <View className="flex-row items-center gap-2">
              <Text className="text-foreground text-2xl font-extraBold">
                {username}
              </Text>
              <Ionicons name="hand-right" size={22} color={accentColor} />
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

        {/* ── Loading ── */}
        {loading && (
          <View className="items-center justify-center py-20 gap-4">
            <Spinner size="lg" color="default" />
            <Text className="text-muted text-sm font-regular">
              Loading feed…
            </Text>
          </View>
        )}

        {/* ── Error ── */}
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

        {/* ── Feed content ── */}
        {!loading && feed && (
          <>
            {/* Featured horizontal scroll */}
            <View className="mb-7">
              <SectionHeader
                icon="flame"
                title="Featured"
                subtitle={`${feed.total} tracks total`}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 24, gap: 14 }}
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

            {/* Recently added list */}
            <View className="px-6 mb-4">
              <SectionHeader icon="time-outline" title="Recently Added" />

              {feed.recent.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  isActive={currentTrack?.id === track.id}
                  isFavorite={Boolean(favoriteTracks[track.id])}
                  onPress={() => handlePlayTrack(track, feed.recent)}
                  onToggleFavorite={() => toggleFavorite(track)}
                />
              ))}
            </View>
          </>
        )}

        <View className={currentTrack ? "h-24" : "h-6"} />
      </ScrollView>

      {/* ── Mini Player ── */}
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
