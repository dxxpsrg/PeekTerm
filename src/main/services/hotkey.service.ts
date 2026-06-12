// 전역 단축키 서비스 — 어떤 앱을 쓰고 있든 터미널을 호출할 수 있게 한다.
import { globalShortcut } from 'electron';

// 현재 등록된 accelerator를 추적해 재등록 시 깔끔히 해제한다.
let current: string | null = null;

// 단축키를 (재)등록한다. 기존 등록은 먼저 해제한다.
// 반환값: 등록 성공 여부(다른 앱이 선점한 단축키면 false).
export function registerHotkey(accelerator: string, handler: () => void): boolean {
  unregisterHotkey();
  if (!accelerator) return false;

  try {
    const ok = globalShortcut.register(accelerator, handler);
    if (ok) current = accelerator;
    else console.warn('[hotkey] 등록 실패(다른 앱이 사용 중일 수 있음):', accelerator);
    return ok;
  } catch (err) {
    // 잘못된 accelerator 문자열이면 throw될 수 있어 안전하게 처리한다.
    console.error('[hotkey] 잘못된 단축키:', accelerator, err);
    return false;
  }
}

// 현재 등록된 단축키 해제.
export function unregisterHotkey(): void {
  if (current) {
    try {
      globalShortcut.unregister(current);
    } catch {
      // 이미 해제된 경우 무시.
    }
    current = null;
  }
}
