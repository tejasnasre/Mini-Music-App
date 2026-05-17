import {
  View,
  Text,
  ScrollView,
  Pressable,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";

import { useFavoritesStore } from "../../store/favorites";
import { usePlayerStore } from "../../store/player";
import type { Track } from "../../types/track";

function FavoriteRow({
  track,
  onPlay,
  onRemove,
}: {
  track: Track;
  onPlay: () => void;
  onRemove: () => void;
}) {
  const mutedColor = useThemeColor("muted");

  return (
    <Pressable
      onPress={onPlay}
      className="mb-3 rounded-3xl bg-field-background p-3"
    >
      <View className="flex-row items-center">
        <View className="w-16 h-16 rounded-2xl overflow-hidden bg-background">
          <Image
            source={{ uri: track.cover_image }}
            style={{ width: 64, height: 64 }}
            contentFit="cover"
            transition={200}
          />
        </View>

        <View className="flex-1 ml-4">
          <Text
            numberOfLines={1}
            className="text-foreground text-base font-bold"
          >
            {track.title}
          </Text>
          <Text
            numberOfLines={1}
            className="text-muted text-xs mt-1 font-regular"
          >
            {track.artists.map((a) => a.name).join(", ")}
          </Text>
          <View className="flex-row items-center gap-2 mt-2">
            <Text className="text-muted text-[11px] font-semibold">
              {track.genre[0] ?? "Music"}
            </Text>
            <View className="w-1 h-1 rounded-full bg-muted opacity-50" />
            <Text className="text-muted text-[11px] font-semibold">
              {track.duration_formatted}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation?.();
            onRemove();
          }}
          className="w-11 h-11 rounded-full bg-background items-center justify-center ml-2"
          activeOpacity={0.75}
        >
          <Ionicons name="heart" size={22} color="#EF4444" />
        </TouchableOpacity>

        <Ionicons name="chevron-forward" size={18} color={mutedColor} />
      </View>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const tracksMap = useFavoritesStore((s) => s.tracks);
  const removeFavorite = useFavoritesStore((s) => s.removeFavorite);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");
  const favorites = Object.values(tracksMap);

  const playFavorite = (track: Track) => {
    playTrack(track, favorites.length > 0 ? favorites : [track]);
    router.push("/(app)/player");
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <View className="flex-row items-center justify-between px-6 pt-safe-offset-2 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-11 h-11 rounded-full bg-field-background items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color={accentColor} />
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-foreground text-lg font-bold">Favorites</Text>
          <Text className="text-muted text-xs font-regular mt-0.5">
            {favorites.length} saved{" "}
            {favorites.length === 1 ? "track" : "tracks"}
          </Text>
        </View>

        <View className="w-11 h-11 rounded-full bg-field-background items-center justify-center">
          <Ionicons name="heart" size={21} color="#EF4444" />
        </View>
      </View>

      {favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pb-safe-offset-8">
          <View className="w-24 h-24 rounded-full bg-field-background items-center justify-center mb-5">
            <Ionicons name="heart-outline" size={42} color={mutedColor} />
          </View>
          <Text className="text-foreground text-xl font-bold">
            No favorites yet
          </Text>
          <Text className="text-muted text-sm font-regular text-center mt-2 leading-5">
            Tap the heart icon on the player to save songs here for quick
            access.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-8 bg-accent px-6 py-3 rounded-2xl"
          >
            <Text className="text-accent-foreground text-sm font-bold">
              Discover music
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerClassName="px-6 pb-safe-offset-6"
        >
          {favorites.map((track) => (
            <FavoriteRow
              key={track.id}
              track={track}
              onPlay={() => playFavorite(track)}
              onRemove={() => removeFavorite(track.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
