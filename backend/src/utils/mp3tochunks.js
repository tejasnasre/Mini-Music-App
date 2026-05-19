const util = require("util");
const exec = util.promisify(require("child_process").exec);
const fs = require("fs");
const path = require("path");

const tracksFile = path.join(__dirname, "../data/tracks.json");
const dest = path.join(__dirname, "../temp/chunks");

// Ensure destination directory exists
if (!fs.existsSync(dest)) {
  fs.mkdirSync(dest, { recursive: true });
}

const startTime = new Date();
console.info("> Start generating HLS chunks from Supabase URLs...", startTime);

// Read tracks.json to get audio URLs
fs.readFile(tracksFile, "utf8", async (readError, data) => {
  if (readError) {
    console.error("Error reading tracks.json:", readError);
    return;
  }

  let tracksData;
  try {
    tracksData = JSON.parse(data);
  } catch (parseError) {
    console.error("Error parsing tracks.json:", parseError);
    return;
  }

  const tracks = tracksData.tracks || [];
  const validTracks = tracks.filter(
    (t) => t.audio?.stream_url && t.audio.stream_url.startsWith("http"),
  );
  const countTracks = validTracks.length;

  if (countTracks === 0) {
    console.warn("No valid tracks with stream URLs found");
    return;
  }

  console.log(`Found ${countTracks} tracks with Supabase audio URLs`);

  validTracks.forEach(async (track, index) => {
    const trackName = track.title.replace(/\s+/g, "_").toLowerCase();
    const outputDir = path.join(dest, trackName);

    // Create output directory for each track
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    try {
      // Use FFmpeg to fetch from URL and generate HLS chunks
      // -i pipe: reads from stdin, but we pipe the URL directly with curl-like behavior
      const { err, stdout, stderr } = await exec(
        `ffmpeg -i "${track.audio.stream_url}" -codec:a aac -b:a 128k -start_number 0 -hls_time 6 -hls_list_size 0 -f hls "${outputDir}/playlist.m3u8" 2>&1`,
      );

      if (err) {
        console.error(`Error processing ${track.title}:`, err);
        return;
      }

      console.log(`✓ Generated HLS chunks for "${track.title}" (${track.id})`);

      if (countTracks - 1 === index) {
        const endTime = new Date();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        console.info(
          `✓ Completed HLS generation for all ${countTracks} tracks in ${duration}s`,
          endTime,
        );
      }
    } catch (err) {
      console.error(`Error executing FFmpeg for ${track.title}:`, err);
    }
  });
});
