// 설정 병합 순수 함수 — electron/파일시스템에 의존하지 않아 테스트 가능.
import { AppSettings, DEFAULT_SETTINGS } from './types';

// 부분 설정을 기본값과 병합한다.
// 저장 파일에 일부 키가 빠져 있어도(구버전 호환 등) 항상 완전한 설정을 보장한다(방어적 처리).
export function mergeSettings(partial: Partial<AppSettings> | null | undefined): AppSettings {
  const merged = { ...DEFAULT_SETTINGS, ...(partial ?? {}) };
  // themeMode 유효성 보정 — 'dark'/'light' 외의 값이면 기본값으로 되돌린다.
  if (merged.themeMode !== 'dark' && merged.themeMode !== 'light') {
    merged.themeMode = DEFAULT_SETTINGS.themeMode;
  }
  return merged;
}
