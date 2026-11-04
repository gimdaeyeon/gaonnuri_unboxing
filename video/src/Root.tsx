import { Composition } from 'remotion';
import { TOTAL_FRAMES, UnboxingVideo } from './Video';
import { PREVIEW_FRAMES, PREVIEW_H, PREVIEW_W, UnboxingPreview } from './Preview';
import { FPS, HEIGHT, WIDTH } from './tokens';

export function Root() {
  return (
    <>
      {/* 본편 - 프로젝트 상세 페이지에 임베드하는 소개 영상 */}
      <Composition
        id="Unboxing"
        component={UnboxingVideo}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      {/* 카드 hover 미리보기 - 16:10, 무음 루프. 썸네일과 같은 비율이어야 합니다. */}
      <Composition
        id="UnboxingPreview"
        component={UnboxingPreview}
        durationInFrames={PREVIEW_FRAMES}
        fps={FPS}
        width={PREVIEW_W}
        height={PREVIEW_H}
      />
    </>
  );
}
