const { withAppBuildGradle } = require("@expo/config-plugins");

/**
 * Adds media3-exoplayer-hls to android/app/build.gradle.
 * Required for ExoPlayer to parse .m3u8 HLS playlists on Android.
 * Without this, ExoPlayer falls back to ProgressiveMediaSource,
 * which causes buffering → ended immediately when an HLS URL is loaded.
 */
const withHlsSupport = (config) => {
  return withAppBuildGradle(config, (config) => {
    const dep = 'implementation "androidx.media3:media3-exoplayer-hls:1.9.2"';

    if (config.modResults.contents.includes("media3-exoplayer-hls")) {
      // Already added — skip
      return config;
    }

    // Inject right after the dependencies { opening brace
    config.modResults.contents = config.modResults.contents.replace(
      /dependencies\s*\{/,
      `dependencies {\n    ${dep}`,
    );

    return config;
  });
};

module.exports = withHlsSupport;
