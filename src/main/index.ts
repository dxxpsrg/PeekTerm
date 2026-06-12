// 앱 엔트리포인트 — 라이프사이클과 초기화를 담당한다.
import { app } from 'electron';
import { createTerminalWindow, showTerminalWindow } from './windows/terminal-window';
import { createTray } from './tray';
import * as pty from './services/pty.service';
import { loadSettings } from './services/settings.service';
import { registerHotkey, unregisterHotkey } from './services/hotkey.service';
import { registerIpcHandlers } from './ipc/handlers';

app.name = 'peekterm';

// 단일 인스턴스 보장 — 중복 실행 시 두 번째 인스턴스는 종료하고 기존 창을 호출한다.
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => showTerminalWindow());

  app.whenReady().then(() => {
    // 요구사항: Dock에 아이콘을 표시하지 않는다(메뉴바 전용 에이전트 앱).
    app.dock?.hide();

    const settings = loadSettings();

    createTerminalWindow();
    createTray();

    pty.init(); // 단일 zsh 세션 시작(백그라운드 상주).
    registerIpcHandlers();

    // 저장된 단축키로 전역 호출 등록.
    registerHotkey(settings.hotkey, showTerminalWindow);
  });

  // 종료 직전 정리 — 단축키 해제 및 셸 프로세스 종료.
  app.on('will-quit', () => {
    unregisterHotkey();
    pty.destroy();
  });

  // 모든 창이 닫혀도(숨김 상태 포함) 앱은 트레이에 상주한다 — 자동 종료 방지.
  app.on('window-all-closed', () => {});
}
