import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setCodec('h264');
Config.setCrf(17);
Config.setPixelFormat('yuv420p');

// Optional: point Remotion at an already-installed Chrome/Chromium instead of downloading one.
// e.g. REMOTION_BROWSER=/path/to/chrome npm run render:slot
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
