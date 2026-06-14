// 메뉴바 트레이 아이콘.
// 좌클릭 → 터미널 호출(숨김은 blur가 담당), 우클릭 → 설정/종료 메뉴.
import { Tray, Menu, nativeImage, app, NativeImage } from 'electron';
import path from 'path';
import { showTerminalWindow } from './windows/terminal-window';
import { openSettingsWindow } from './windows/settings-window';
import { registerTrayForAttention } from './services/attention.service';

let tray: Tray | null = null;

// 메뉴바 아이콘 로드. 파일이 없으면 빈 이미지로 폴백(앱이 죽지 않도록).
// template=true: macOS가 다크/라이트 메뉴바에 맞춰 자동 채색(기본 단색 아이콘).
// template=false: 이미지 색 그대로 표시(완료 알림용 코랄 아이콘처럼 색을 살려야 할 때).
function loadIcon(file: string, template: boolean): NativeImage {
  try {
    // 패키징 시엔 resources/assets, dev에선 프로젝트 루트/assets.
    const base = app.isPackaged ? process.resourcesPath : app.getAppPath();
    let img = nativeImage.createFromPath(path.join(base, 'assets', file));
    if (!img.isEmpty()) {
      img = img.resize({ width: 18, height: 18 }); // 메뉴바 표준 크기.
      img.setTemplateImage(template);
      return img;
    }
  } catch {
    // 무시하고 폴백.
  }
  return nativeImage.createEmpty();
}

export function createTray(): Tray {
  // 작업 상태별 아이콘: 평상시/깜빡임 켜짐(기본 템플릿), 깜빡임 꺼짐(흐린 템플릿),
  // 완료(코랄). 깜빡임은 normal↔dim 점멸, 완료는 attention 고정으로 쓰인다.
  const normalIcon = loadIcon('tray-icon.png', true);
  const dimIcon = loadIcon('tray-icon-dim.png', true);
  const attentionIcon = loadIcon('tray-icon-attention.png', false);

  tray = new Tray(normalIcon);
  tray.setToolTip('peekterm');

  // 완료 알림 서비스에 트레이 인스턴스와 아이콘 묶음을 등록한다.
  registerTrayForAttention(tray, { normal: normalIcon, dim: dimIcon, attention: attentionIcon });

  // 좌클릭 → 터미널 표시.
  tray.on('click', () => showTerminalWindow());

  // 우클릭 → 컨텍스트 메뉴.
  const menu = Menu.buildFromTemplate([
    { label: '설정…', click: () => openSettingsWindow() },
    { type: 'separator' },
    { label: 'peekterm 종료', click: () => app.quit() },
  ]);
  tray.on('right-click', () => tray?.popUpContextMenu(menu));

  return tray;
}
