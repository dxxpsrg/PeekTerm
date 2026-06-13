// 터미널 창(사이드패널) 관리.
// 핵심: 외부 클릭 시 close가 아닌 hide로 처리해, 렌더러의 xterm 상태와 작업 내용을 유지한다.
import { BrowserWindow, screen, app } from 'electron';
import path from 'path';
import { computeSidePanelBounds, Rect } from '@shared/bounds';

let win: BrowserWindow | null = null;

// 현재 주 디스플레이의 작업영역 기준으로 우측 사이드패널 영역을 계산한다.
// show할 때마다 다시 호출해 해상도/디스플레이 변경에 대응한다.
function getSidePanelBounds(): Rect {
  const { workArea } = screen.getPrimaryDisplay();
  return computeSidePanelBounds(workArea);
}

export function createTerminalWindow(): BrowserWindow {
  win = new BrowserWindow({
    ...getSidePanelBounds(),
    show: false, // 시작 시 숨김 — 트레이/단축키로 호출.
    frame: false, // 프레임 없는 패널.
    resizable: false,
    skipTaskbar: true,
    fullscreenable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true, // 보안: 렌더러와 노드 컨텍스트 격리.
      nodeIntegration: false,
    },
  });

  // macOS 스페이스 대응: 창을 "모든 스페이스 소속"으로 만들어, show 시 처음 생성된 스페이스로
  // 화면이 점프하지 않고 현재 활성 스페이스에 뜨게 한다.
  // 참고: 이 방식은 스페이스 이동 시 창이 잠깐 따라와 깜빡이는 부작용이 있다. 깜빡임을 없애려고
  //       transient on/off를 쓰면 show가 이전 스페이스로 점프하는 더 큰 문제가 생긴다
  //       (Electron이 moveToActiveSpace를 노출하지 않는 한계). 점프 없는 동작을 우선해 영구 설정을 유지한다.
  if (process.platform === 'darwin') {
    win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }

  // dev 서버 URL이 있으면 그쪽을, 빌드 후엔 로컬 파일을 로드한다.
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 외부 클릭(포커스 아웃) → 숨김. 단, 개발자도구에 포커스가 간 경우는 제외(개발 편의).
  win.on('blur', () => {
    if (win && !win.webContents.isDevToolsFocused()) win.hide();
  });
  win.on('closed', () => {
    win = null;
  });

  return win;
}

// 터미널 창을 우측 사이드패널 위치에 표시하고 포커스를 가져온다.
export function showTerminalWindow(): void {
  if (!win || win.isDestroyed()) return;
  win.setBounds(getSidePanelBounds()); // 매 호출마다 위치 재계산.
  // Dock 미표시(에이전트) 앱은 그냥 show만으로 키보드 포커스를 못 받을 수 있어 강제로 앞으로 가져온다.
  if (process.platform === 'darwin') app.focus({ steal: true });
  win.show();
  win.focus();
}

export function hideTerminalWindow(): void {
  win?.hide();
}

// 단축키 토글: 창이 보이면 숨기고, 숨겨져 있으면 현재 스페이스에 표시한다.
// 전역 단축키는 포커스를 이동시키지 않으므로, 호출 시점의 isVisible() 상태가 정확하다.
export function toggleTerminalWindow(): void {
  if (!win || win.isDestroyed()) return;
  if (win.isVisible()) {
    hideTerminalWindow();
  } else {
    showTerminalWindow();
  }
}

export function getTerminalWindow(): BrowserWindow | null {
  return win;
}
