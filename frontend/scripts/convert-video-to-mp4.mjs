import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffmpeg from "fluent-ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const input = process.argv[2] || "demo-videos/workflow-demo-video.webm";
const output = process.argv[3] || "demo-videos/workflow-demo-video.mp4";

ffmpeg(input)
  .outputOptions(["-c:v libx264", "-preset fast", "-crf 23", "-pix_fmt yuv420p", "-movflags +faststart"])
  .on("start", (command) => {
    console.log("FFmpeg command:", command);
  })
  .on("error", (err) => {
    console.error("Conversion failed:", err.message);
    process.exit(1);
  })
  .on("end", () => {
    console.log(`MP4 created: ${output}`);
  })
  .save(output);
