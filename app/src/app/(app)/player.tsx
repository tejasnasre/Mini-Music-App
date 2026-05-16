import {
  View,
  Text,
  TouchableOpacity,
  GestureResponderEvent,
} from "react-native";
import { Image } from "expo-image";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useState } from "react";
import TrackPlayer, { useActiveMediaItem, useIsPlaying, useProgress } from "@rntp/player";

import { usePlayerStore } from "@/store/player";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

// ─── Seek Bar ─────────────────────────────────────────────────────────────────

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
      {/* Track — full-width hit area */}
      <TouchableOpacity
        onPress={handlePress}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width)}
        activeOpacity={1}
        style={{ paddingVertical: 14 }}
      >
        {/* Track background */}
        <View
          style={{
            height: 4,
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: 2,
          }}
        >
          {/* Filled portion */}
          <View
            style={{
              height: 4,
              width: `${progress * 100}%`,
              backgroundColor: "#E5A020",
              borderRadius: 2,
            }}
          />
        </View>

        {/* Thumb dot */}
        {barWidth > 0 && (
          <View
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              borderRadius: 7,
              backgroundColor: "#E5A020",
              top: 14 - 5, // paddingVertical(14) - (thumb_height/2 - track_height/2) = 14-5
              left: progress * barWidth - 7,
            }}
          />
        )}
      </TouchableOpacity>

      {/* Time labels */}
      <View className="flex-row justify-between mt-1">
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function PlayerScreen() {
  const { trackMap, queue } = usePlayerStore();

  // RNTP reactive state
  const activeItem = useActiveMediaItem();
  const isPlaying = useIsPlaying();
  const { position, duration } = useProgress(0.5);

  // Resolve full Track from our trackMap using RNTP's active mediaId
  const track = activeItem?.mediaId ? (trackMap[activeItem.mediaId] ?? null) : null;

  // ── Nothing playing ────────────────────────────────────────────────────────
  if (!track) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <StatusBar style="light" />
        <Text style={{ fontSize: 48 }}>🎵</Text>
        <Text className="text-foreground text-lg font-bold mt-4">
          Nothing playing
        </Text>
        <Text className="text-muted text-sm mt-2 font-regular">
          Go back and pick a track
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-8 bg-accent px-8 py-3 rounded-2xl"
        >
          <Text className="text-accent-foreground font-bold">← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const artistNames = track.artists.map((a) => a.name).join(", ");
  const currentIndex = queue.findIndex((t) => t.id === track.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < queue.length - 1;

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-6 pt-safe-offset-2 pb-2">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text className="text-accent text-base font-semibold">↓ Close</Text>
        </TouchableOpacity>

        <Text className="text-muted text-xs font-semibold uppercase" style={{ letterSpacing: 1.5 }}>
          Now Playing
        </Text>

        {/* Spacer to centre the title */}
        <View style={{ width: 60 }} />
      </View>

      {/* ── Album Art ───────────────────────────────────────────────────── */}
      <View className="px-8 mt-4 mb-6">
        <View
          style={{
            aspectRatio: 1,
            borderRadius: 24,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.5,
            shadowRadius: 24,
            elevation: 20,
          }}
        >
          <Image
            source={{ uri: track.cover_image }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
        </View>
      </View>

      {/* ── Track Info ──────────────────────────────────────────────────── */}
      <View className="px-8 mb-6">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-4">
            <Text
              numberOfLines={1}
              className="text-foreground text-2xl font-extraBold"
            >
              {track.title}
            </Text>
            <Text
              numberOfLines={1}
              className="text-muted text-base mt-1 font-regular"
            >
              {artistNames}
            </Text>
          </View>

          {/* Genre badge */}
          <View className="bg-field-background rounded-xl px-3 py-1.5 mt-1">
            <Text className="text-muted text-xs font-semibold">
              {track.genre[0]}
            </Text>
          </View>
        </View>

        {/* Quality + language */}
        <View className="flex-row mt-3 gap-2">
          <View className="bg-field-background rounded-lg px-2.5 py-1">
            <Text className="text-muted text-xs font-regular">
              {track.audio.quality}
            </Text>
          </View>
          <View className="bg-field-background rounded-lg px-2.5 py-1">
            <Text className="text-muted text-xs font-regular">
              {track.language}
            </Text>
          </View>
          {track.explicit && (
            <View className="bg-field-background rounded-lg px-2.5 py-1">
              <Text className="text-muted text-xs font-regular">E</Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Seek Bar ────────────────────────────────────────────────────── */}
      <View className="px-8 mb-6">
        <SeekBar position={position} duration={duration} />
      </View>

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-center px-8 gap-8">
        {/* Previous */}
        <TouchableOpacity
          onPress={() => TrackPlayer.skipToPrevious()}
          disabled={!hasPrev}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 32,
              color: hasPrev ? "#E5A020" : "rgba(255,255,255,0.2)",
            }}
          >
            ⏮
          </Text>
        </TouchableOpacity>

        {/* Play / Pause — main button */}
        <TouchableOpacity
          onPress={() =>
            isPlaying ? TrackPlayer.pause() : TrackPlayer.play()
          }
          activeOpacity={0.85}
          className="bg-accent rounded-full items-center justify-center"
          style={{ width: 72, height: 72 }}
        >
          <Text
            style={{
              fontSize: 28,
              color: "#000",
              marginLeft: isPlaying ? 0 : 4,
            }}
          >
            {isPlaying ? "⏸" : "▶"}
          </Text>
        </TouchableOpacity>

        {/* Next */}
        <TouchableOpacity
          onPress={() => TrackPlayer.skipToNext()}
          disabled={!hasNext}
          activeOpacity={0.7}
        >
          <Text
            style={{
              fontSize: 32,
              color: hasNext ? "#E5A020" : "rgba(255,255,255,0.2)",
            }}
          >
            ⏭
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Queue info ──────────────────────────────────────────────────── */}
      {queue.length > 1 && (
        <View className="px-8 mt-8 mb-safe-offset-4">
          <Text className="text-muted text-xs font-regular text-center">
            {currentIndex + 1} / {queue.length} in queue ·{" "}
            {track.bpm} BPM · {track.key}
          </Text>
        </View>
      )}
    </View>
  );
}
