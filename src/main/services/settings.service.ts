// 설정 영속화 서비스 — userData/settings.json 에 JSON으로 저장한다.
// (better-sqlite3 같은 네이티브 의존성 없이 단순하게 처리)
import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { AppSettings } from '@shared/types';
import { mergeSettings } from '@shared/settings-merge';

// 설정 파일 경로. app.getPath('userData')는 ready 이후에만 유효하므로 함수로 지연 평가한다.
function settingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json');
}

// 설정을 읽어온다. 파일이 없거나 JSON 파싱에 실패하면 기본값으로 폴백(방어적 처리).
export function loadSettings(): AppSettings {
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf-8');
    return mergeSettings(JSON.parse(raw) as Partial<AppSettings>);
  } catch {
    return mergeSettings(null);
  }
}

// 설정을 병합 후 디스크에 기록하고, 병합된 최종 설정을 반환한다.
export function saveSettings(settings: AppSettings): AppSettings {
  const merged = mergeSettings(settings);
  try {
    fs.writeFileSync(settingsPath(), JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    // 디스크 기록 실패해도 앱이 죽지 않도록 로그만 남기고 메모리 값을 반환한다.
    console.error('[settings] 저장 실패:', err);
  }
  return merged;
}
