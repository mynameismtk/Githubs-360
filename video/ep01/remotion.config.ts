import {Config} from '@remotion/cli/config';

Config.setConcurrency(4);
Config.setCrf(23);
Config.setOffthreadVideoCacheSizeInBytes(256 * 1024 * 1024);
// use the preinstalled Chromium (no headless-shell download needed)
if (process.env.REMOTION_CHROME) Config.setBrowserExecutable(process.env.REMOTION_CHROME);
