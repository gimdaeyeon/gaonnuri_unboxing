import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// 포트폴리오 임베드용 — 1080p에서 텍스트가 또렷하게 남도록 품질을 올려 잡는다.
Config.setCrf(18);
