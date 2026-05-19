import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { VolumeManager } from "react-native-volume-manager";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import TrackPlayer, {
  useActiveMediaItem,
  useIsPlaying,
  useProgress,
} from "@rntp/player";
import { Ionicons } from "@expo/vector-icons";
import { Slider, useThemeColor } from "heroui-native";

import { artistNameToId } from "../../lib/artist";
import { api } from "../../lib/api";
import { useFavoritesStore } from "../../store/favorites";
import { usePlayerStore } from "../../store/player";
import type { Track } from "../../types/track";

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

function volumeIcon(v: number): IoniconName {
  if (v === 0) return "volume-off";
  if (v < 0.35) return "volume-low";
  if (v < 0.7) return "volume-medium";
  return "volume-high";
}

function IconButton({
  icon,
  onPress,
  color,
  size = 22,
  disabled = false,
  className = "w-11 h-11 rounded-full bg-field-background items-center justify-center",
}: {
  icon: IoniconName;
  onPress: () => void;
  color: string;
  size?: number;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      className={className}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
}

function SeekBar({
  position,
  duration,
}: {
  position: number;
  duration: number;
}) {
  const [barWidth, setBarWidth] = useState(0);
  const progress = duration > 0 ? Math.min(position / duration, 1) : 0;

  const handlePress = (e: GestureResponderEvent) => {
    if (barWidth <= 0 || duration <= 0) return;
    const x = e.nativeEvent.locationX;
    const ratio = Math.max(0, Math.min(x / barWidth, 1));
    TrackPlayer.seekTo(ratio * duration);
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        activeOpacity={1}
        className="py-4"
      >
        <View className="h-1.25 rounded-full bg-muted/30 overflow-hidden">
          <View
            className="h-1.25 rounded-full bg-accent"
            style={{ width: `${progress * 100}%` }}
          />
        </View>

        {barWidth > 0 && (
          <View
            className="absolute w-4 h-4 rounded-full bg-accent top-2.5"
            style={{ left: progress * barWidth - 8 }}
          />
        )}
      </TouchableOpacity>

      <View className="flex-row justify-between">
        <Text className="text-muted text-xs font-regular">
          {formatTime(position)}
        </Text>
        <Text className="text-muted text-xs font-regular">
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

function DetailPill({ icon, label }: { icon: IoniconName; label: string }) {
  return (
    <View className="flex-row items-center gap-2 rounded-2xl bg-field-background px-3 py-2">
      <Ionicons name={icon} size={15} color="#E5A020" />
      <Text numberOfLines={1} className="text-foreground text-xs font-semibold">
        {label}
      </Text>
    </View>
  );
}

function ControlsPanel({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [volume, setVolumeState] = useState(1);
  const draggingRef = useRef(false);
  const foregroundColor = useThemeColor("foreground");
  const mutedColor = useThemeColor("muted");

  useEffect(() => {
    if (!visible) return;

    let mounted = true;

    const syncVolume = async () => {
      try {
        if (Platform.OS === "web") {
          setVolumeState(TrackPlayer.getVolume());
          return;
        }

        TrackPlayer.setVolume(1);
        await VolumeManager.showNativeVolumeUI({ enabled: false });
        const { volume } = await VolumeManager.getVolume();
        if (mounted) setVolumeState(volume);
      } catch {
        if (mounted) setVolumeState(1);
      }
    };

    void syncVolume();

    const subscription =
      Platform.OS !== "web"
        ? VolumeManager.addVolumeListener(({ volume }) => {
            if (mounted && !draggingRef.current) setVolumeState(volume);
          })
        : null;

    return () => {
      mounted = false;
      subscription?.remove();
      if (Platform.OS !== "web") {
        void VolumeManager.showNativeVolumeUI({ enabled: true });
      }
    };
  }, [visible]);

  if (!visible) return null;

  const applyVolume = (v: number) => {
    const clamped = Math.max(0, Math.min(v, 1));
    setVolumeState(clamped);
    if (Platform.OS === "web") {
      TrackPlayer.setVolume(clamped);
    } else {
      void VolumeManager.setVolume(clamped);
    }
  };

  const handleSliderChange = (value: number | number[]) => {
    draggingRef.current = true;
    applyVolume((value as number) / 100);
  };

  const handleSliderChangeEnd = (value: number | number[]) => {
    draggingRef.current = false;
    applyVolume((value as number) / 100);
  };

  return (
    <View className="absolute inset-0 justify-end">
      <Pressable onPress={onClose} className="absolute inset-0 bg-black/60" />

      <View className="max-h-[78%] rounded-t-[30px] bg-overlay px-6 pt-4 pb-safe-offset-5">
        <View className="items-center mb-5">
          <View className="w-10 h-1 rounded-full bg-field-background" />
        </View>

        <View className="flex-row items-center justify-between mb-5">
          <Text className="text-foreground text-lg font-bold">Controls</Text>
          <TouchableOpacity
            onPress={onClose}
            className="w-9 h-9 rounded-full bg-field-background items-center justify-center"
          >
            <Ionicons name="close" size={18} color={foregroundColor} />
          </TouchableOpacity>
        </View>

        <View className="rounded-3xl bg-background p-4 mb-4">
          <View className="flex-row items-center gap-3">
            <Ionicons name={volumeIcon(volume)} size={22} color={mutedColor} />
            <View className="flex-1 py-1">
              <Slider
                value={Math.round(volume * 100)}
                minValue={0}
                maxValue={100}
                step={1}
                onChange={handleSliderChange}
                onChangeEnd={handleSliderChangeEnd}
              >
                <Slider.Track className="h-1.5 rounded-full bg-muted/30">
                  <Slider.Fill className="rounded-full bg-accent" />
                  <Slider.Thumb
                    classNames={{
                      thumbContainer: "size-4 rounded-full bg-accent",
                      thumbKnob: "size-2 rounded-full bg-accent",
                    }}
                  />
                </Slider.Track>
              </Slider>
            </View>
            <TouchableOpacity
              onPress={() => applyVolume(volume === 0 ? 1 : 0)}
              className="w-10 h-10 rounded-full bg-field-background items-center justify-center"
            >
              <Ionicons
                name={volume === 0 ? "volume-off" : "volume-high"}
                size={19}
                color={volume === 0 ? "#E5A020" : mutedColor}
              />
            </TouchableOpacity>
          </View>
          <View className="flex-row justify-between px-1">
            <Text className="text-muted text-xs font-regular">Sound</Text>
            <Text className="text-muted text-xs font-semibold">
              {Math.round(volume * 100)}%
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function PlayerScreen() {
  const { trackMap, queue, currentTrack } = usePlayerStore();
  const favoriteTracks = useFavoritesStore((s) => s.tracks);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const [showControls, setShowControls] = useState(false);
  const [backendTrack, setBackendTrack] = useState<Track | null>(null);

  const activeItem = useActiveMediaItem();
  const isPlaying = useIsPlaying();
  const { position, duration } = useProgress(0.5);
  const accentColor = useThemeColor("accent");
  const mutedColor = useThemeColor("muted");

  // Use RNTP's activeItem if available, otherwise fall back to currentTrack from store
  const storeTrack = activeItem?.mediaId
    ? (trackMap[activeItem.mediaId] ??
      favoriteTracks[activeItem.mediaId] ??
      null)
    : (currentTrack ?? null);
  const track = backendTrack ?? storeTrack;

  console.log("[PlayerScreen]", {
    activeItem: activeItem?.mediaId,
    isPlaying,
    storeTrack: storeTrack?.id,
    track: track?.id,
  });

  useEffect(() => {
    let mounted = true;
    setBackendTrack(null);

    if (!activeItem?.mediaId) return;

    api
      .getTrack(activeItem.mediaId)
      .then(({ track }) => {
        if (mounted) setBackendTrack(track);
      })
      .catch(() => {
        if (mounted) setBackendTrack(null);
      });

    return () => {
      mounted = false;
    };
  }, [activeItem?.mediaId]);

  if (!track) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-8">
        <StatusBar style="auto" />
        <View className="w-20 h-20 rounded-full bg-field-background items-center justify-center">
          <Ionicons name="musical-notes" size={36} color={accentColor} />
        </View>
        <Text className="text-foreground text-xl font-bold mt-5">
          Nothing playing
        </Text>
        <Text className="text-muted text-sm mt-2 font-regular text-center">
          Pick a track from the home screen to start listening.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 bg-accent px-6 py-3 rounded-2xl flex-row items-center gap-2"
        >
          <Ionicons name="chevron-back" size={18} color="#000" />
          <Text className="text-accent-foreground text-sm font-bold">Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentIndex = queue.findIndex((t) => t.id === track.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < queue.length - 1;
  const isFavorite = Boolean(favoriteTracks[track.id]);

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      <View className="flex-row items-center px-6 pt-safe-offset-2 pb-3">
        <View className="w-24 items-start">
          <IconButton
            icon="chevron-down"
            onPress={() => router.back()}
            color={accentColor}
            size={26}
          />
        </View>

        <View className="flex-1 items-center">
          <Text className="text-muted text-[11px] font-semibold text-center">
            Now Playing
          </Text>
          <Text
            numberOfLines={1}
            className="text-foreground text-xs font-semibold mt-0.5 max-w-42.5 text-center"
          >
            {track.album}
          </Text>
        </View>

        <View className="w-24 items-end">
          <IconButton
            icon="ellipsis-horizontal"
            onPress={() => setShowControls(true)}
            color={mutedColor}
            size={22}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-safe-offset-5"
      >
        <View className="px-8 mt-2 mb-7">
          <View className="aspect-square rounded-[28px] overflow-hidden bg-field-background shadow-2xl">
            <Image
              source={{ uri: track.cover_image }}
              style={{ width: "100%", height: "100%" }}
              contentFit="cover"
              transition={300}
            />
          </View>
        </View>

        <View className="px-8 mb-5">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1">
              <Text
                numberOfLines={2}
                className="text-foreground text-3xl font-extraBold leading-9"
              >
                {track.title}
              </Text>
              <View className="flex-row flex-wrap mt-2">
                {track.artists.map((a, i) => (
                  <Pressable
                    key={`${track.id}-${a.name}`}
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/artist/[id]",
                        params: { id: artistNameToId(a.name) },
                      })
                    }
                  >
                    <Text
                      numberOfLines={1}
                      className="text-muted text-base font-regular"
                    >
                      {a.name}
                      {i < track.artists.length - 1 ? ", " : ""}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => toggleFavorite(track)}
              activeOpacity={0.75}
              className="w-12 h-12 rounded-full bg-field-background items-center justify-center"
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={24}
                color={isFavorite ? "#EF4444" : mutedColor}
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-2 mt-4">
            <DetailPill icon="disc" label={track.genre[0] ?? "Music"} />
            <DetailPill icon="language" label={track.language} />
            {track.explicit && (
              <DetailPill icon="alert-circle" label="Explicit" />
            )}
          </View>
        </View>

        <View className="px-8 mb-7">
          <SeekBar position={position} duration={duration || track.duration} />
        </View>

        <View className="flex-row items-center justify-center px-8 gap-9 mb-7">
          <TouchableOpacity
            onPress={() => {
              const { skipToPrevious } = usePlayerStore.getState();
              void skipToPrevious();
            }}
            disabled={!hasPrev}
            activeOpacity={0.7}
            className="w-14 h-14 items-center justify-center"
          >
            <Ionicons
              name="play-skip-back"
              size={34}
              color={hasPrev ? accentColor : mutedColor}
              style={{ opacity: hasPrev ? 1 : 0.35 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const { togglePlay } = usePlayerStore.getState();
              void togglePlay();
            }}
            activeOpacity={0.85}
            className="bg-accent rounded-full items-center justify-center shadow-xl"
            style={{ width: 78, height: 78 }}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={34}
              color="#000"
              style={{ marginLeft: isPlaying ? 0 : 4 }}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              const { skipToNext } = usePlayerStore.getState();
              void skipToNext();
            }}
            disabled={!hasNext}
            activeOpacity={0.7}
            className="w-14 h-14 items-center justify-center"
          >
            <Ionicons
              name="play-skip-forward"
              size={34}
              color={hasNext ? accentColor : mutedColor}
              style={{ opacity: hasNext ? 1 : 0.35 }}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ControlsPanel
        visible={showControls}
        onClose={() => setShowControls(false)}
      />
    </View>
  );
}
