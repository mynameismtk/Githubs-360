import {Config} from "@remotion/cli/config";

// this workspace has 4 cores: render 4 frames at a time (Remotion's default is half)
Config.setConcurrency(4);
Config.setCrf(23);
Config.setOffthreadVideoCacheSizeInBytes(256 * 1024 * 1024);
