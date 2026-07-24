export interface PrayerRequest {
  id: string;
  authorName: string;      // 이름 (검색·수정 식별 키, 필수)
  cohort: string;          // 또래 = 출생연도 뒤 2자리 (예: '99'). 검색·수정 식별 키, 필수
  isAnonymous: boolean;    // true면 공개 목록에서 이름만 '익명'으로 표시 (검색에는 영향 없음)
  content: string;
  prayCount: number;       // '함께 기도해요' 반응 수 (브라우저 기준 중복 방지, 인증 없음)
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
}

// 생성/수정 시 입력 타입 (id, timestamp, 반응 수 제외)
export type PrayerInput = Omit<PrayerRequest, 'id' | 'createdAt' | 'updatedAt' | 'prayCount'>;

// 공개 목록 표시용 이름 (익명 처리). 검색에는 영향 없음.
export function getDisplayName(prayer: Pick<PrayerRequest, 'authorName' | 'isAnonymous'>): string {
  return prayer.isAnonymous ? '익명' : prayer.authorName;
}
