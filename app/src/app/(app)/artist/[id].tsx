import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
  RefreshControl,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { useActiveMediaItem } from "@rntp/player";
import { Ionicons } from "@expo/vector-icons";
import { Button, Card, Spinner, useThemeColor } from "heroui-native";

import { api } from "@/lib/api";
import { formatTotalDuration } from "@/lib/artist";
import { usePlayerStore } from "@/store/player";
import type { ArtistProfile } from "@/types/artist";
import type { Track } from "@/types/track";

function TrackRow({
  track,
  index,
  isActive,
  onPress,
}: {
  track: Track;
  index: number;
  isActive: boolean;
  onPress: () => void;
}) {
  const accentColor = useThemeColor("accent");

  return (
    <Pressable onPress={onPress} className="mb-2.5">
      <Card variant="secondary" className="flex-row items-center px-3.5 py-3">
        <View className="w-8 items-center justify-center">
          {isActive ? (
            <Ionicons name="musical-note" size={16} color={accentColor} />
          ) : (
            <Text className="text-muted text-sm font-semibold">
              {index + 1}
            </Text>
          )}
        </View>

        <View className="w-12 h-12 rounded-[10px] overflow-hidden ml-1">
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
            <Text numberOfLines={1} className="text-muted text-xs font-regular">
              {track.album}
            </Text>
            <Text className="text-muted text-xs font-regular opacity-50 mx-1">
              ·
            </Text>
            <Text className="text-muted text-xs font-regular opacity-50">
              {track.duration_formatted}
            </Text>
          </View>
        </View>

        {isActive && <View className="w-2 h-2 rounded-full bg-accent ml-2" />}
      </Card>
    </Pressable>
  );
}

function SocialButton({
  icon,
  label,
  url,
  color,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  label: string;
  url: string | null;
  color: string;
}) {
  if (!url) return null;

  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(url)}
      activeOpacity={0.75}
      className="flex-row items-center gap-2.5 rounded-2xl bg-field-background px-4 py-3"
    >
      <Ionicons name={icon} size={18} color={color} />
      <Text className="text-foreground text-xs font-semibold">{label}</Text>
    </TouchableOpacity>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  value: string | number;
  label: string;
}) {
  const accentColor = useThemeColor("accent");
  return (
    <View className="flex-1 rounded-2xl bg-field-background px-4 py-3.5">
      <View className="flex-row items-center gap-2 mb-1.5">
        <Ionicons name={icon} size={16} color={accentColor} />
        <Text className="text-foreground text-lg font-bold">{value}</Text>
      </View>
      <Text className="text-muted text-xs font-regular">{label}</Text>
    </View>
  );
}

function ArtistAvatarFallback({ iconSize = 40 }: { iconSize?: number }) {
  return (
    <View className="flex-1 items-center justify-center bg-accent/15">
      <Ionicons name="person" size={iconSize} color="#ffffff" />
    </View>
  );
}

export default function ArtistProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const artistId = Array.isArray(id) ? id[0] : id;

  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const { playTrack, trackMap } = usePlayerStore();
  const activeItem = useActiveMediaItem();

  const currentTrack = activeItem?.mediaId
    ? (trackMap[activeItem.mediaId] ?? null)
    : null;

  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [coverImageFailed, setCoverImageFailed] = useState(false);
  const [artistImageFailed, setArtistImageFailed] = useState(false);

  const loadArtist = useCallback(async () => {
    if (!artistId) {
      setError("Artist not found.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setCoverImageFailed(false);
      setArtistImageFailed(false);
      const data = await api.getArtist(artistId);
      setArtist(data.artist);
      setTracks(data.tracks);
    } catch {
      setError("Couldn't load this artist. Check that the backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [artistId]);

  useEffect(() => {
    setLoading(true);
    loadArtist();
  }, [loadArtist]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadArtist();
  };

  const handlePlayTrack = (track: Track) => {
    playTrack(track, tracks.length > 0 ? tracks : [track]);
    router.push("/(app)/player");
  };

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    playTrack(tracks[0], tracks);
    router.push("/(app)/player");
  };

  const handleShuffle = () => {
    if (tracks.length === 0) return;
    const shuffled = [...tracks].sort(() => Math.random() - 0.5);
    playTrack(shuffled[0], shuffled);
    router.push("/(app)/player");
  };

  useEffect(() => {
    setCoverImageFailed(false);
    setArtistImageFailed(false);
  }, [artist?.image, artist?.cover_image]);

  const stats = artist?.stats;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />

      <View className="absolute top-0 left-0 right-0 z-10 flex-row items-center justify-between px-5 pt-safe-offset-2">
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          className="w-10 h-10 rounded-full bg-black/40 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View className="flex-1 items-center justify-center gap-4">
          <Spinner size="lg" color="default" />
          <Text className="text-muted text-sm font-regular">
            Loading artist…
          </Text>
        </View>
      )}

      {!loading && error && (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-field-background items-center justify-center mb-5">
            <Ionicons name="person-outline" size={36} color={mutedColor} />
          </View>
          <Text className="text-foreground text-xl font-bold text-center">
            Artist unavailable
          </Text>
          <Text className="text-muted text-sm font-regular text-center mt-2 leading-5">
            {error}
          </Text>
          <Button
            variant="primary"
            className="mt-8"
            onPress={() => {
              setLoading(true);
              loadArtist();
            }}
          >
            <Button.Label>Retry</Button.Label>
          </Button>
        </View>
      )}

      {!loading && artist && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={accentColor}
            />
          }
        >
          <View className="h-56 bg-field-background">
            {artist.cover_image && !coverImageFailed ? (
              <Image
                source={{ uri: artist.cover_image }}
                style={{ width: "100%", height: "100%" }}
                contentFit="cover"
                transition={300}
                onError={() => setCoverImageFailed(true)}
              />
            ) : (
              <View className="flex-1 items-center justify-center bg-accent/15">
                <Ionicons name="musical-notes" size={48} color={accentColor} />
              </View>
            )}
          </View>

          <View className="px-6">
            <View className="-mt-14 mb-3">
              <View className="w-25 h-25 rounded-full overflow-hidden border-[3px] border-background bg-field-background">
                {artist.image && !artistImageFailed ? (
                  <Image
                    source={{ uri: artist.image }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                    transition={300}
                    onError={() => setArtistImageFailed(true)}
                  />
                ) : (
                  <ArtistAvatarFallback iconSize={36} />
                )}
              </View>
            </View>

            <View className="mb-1">
              <View className="flex-row items-center gap-1.5">
                <Text
                  numberOfLines={2}
                  className="text-foreground text-2xl font-extraBold shrink"
                >
                  {artist.name}
                </Text>
                {artist.verified && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={accentColor}
                  />
                )}
              </View>
              <Text className="text-muted text-sm font-regular mt-0.5">
                {artist.type}
                {artist.country ? ` · ${artist.country}` : ""}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2 mt-4">
              {artist.genres.map((genre) => (
                <View
                  key={genre}
                  className="rounded-full bg-accent/12 px-3.5 py-1.5"
                >
                  <Text className="text-accent text-xs font-semibold">
                    {genre}
                  </Text>
                </View>
              ))}
            </View>

            <Text className="text-muted text-sm font-regular leading-5.5 mt-4">
              {artist.bio}
            </Text>

            {tracks.length > 0 && (
              <View className="flex-row gap-3 mt-5">
                <Button
                  variant="primary"
                  className="flex-1"
                  onPress={handlePlayAll}
                >
                  <Ionicons name="play" size={16} color="#000" />
                  <Button.Label>Play All</Button.Label>
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onPress={handleShuffle}
                >
                  <Ionicons name="shuffle" size={16} color={accentColor} />
                  <Button.Label>Shuffle</Button.Label>
                </Button>
              </View>
            )}

            {stats && (
              <View className="flex-row gap-3 mt-5">
                <StatCard
                  icon="disc"
                  value={stats.track_count}
                  label={stats.track_count === 1 ? "Track" : "Tracks"}
                />
                <StatCard
                  icon="time-outline"
                  value={formatTotalDuration(stats.total_duration)}
                  label="Total playtime"
                />
              </View>
            )}

            {(artist.socials.youtube ||
              artist.socials.spotify ||
              artist.socials.instagram) && (
              <View className="flex-row flex-wrap gap-2.5 mt-5">
                <SocialButton
                  icon="logo-youtube"
                  label="YouTube"
                  url={artist.socials.youtube}
                  color="#FF0000"
                />
                <SocialButton
                  icon="musical-notes"
                  label="Spotify"
                  url={artist.socials.spotify}
                  color="#1DB954"
                />
                <SocialButton
                  icon="logo-instagram"
                  label="Instagram"
                  url={artist.socials.instagram}
                  color="#E4405F"
                />
              </View>
            )}

            <View className="flex-row items-center gap-2 mt-8 mb-4">
              <Ionicons name="musical-notes" size={20} color={accentColor} />
              <Text className="text-foreground text-lg font-bold">
                Popular tracks
              </Text>
              <Text className="text-muted text-xs font-regular ml-auto">
                {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
              </Text>
            </View>

            {tracks.length === 0 ? (
              <View className="items-center py-10 rounded-3xl bg-field-background">
                <Ionicons
                  name="musical-notes-outline"
                  size={36}
                  color={mutedColor}
                />
                <Text className="text-muted text-sm font-regular mt-3">
                  No tracks for this artist yet.
                </Text>
              </View>
            ) : (
              tracks.map((track, index) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={index}
                  isActive={currentTrack?.id === track.id}
                  onPress={() => handlePlayTrack(track)}
                />
              ))
            )}
          </View>

          <View className="h-safe-offset-8" />
        </ScrollView>
      )}
    </View>
  );
}
