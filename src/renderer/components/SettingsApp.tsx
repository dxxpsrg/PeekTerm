// 설정 화면 — 단축키 / 폰트 크기 / 색상 테마를 편집하고 저장한다.
// 저장 시 main이 디스크 기록 + 단축키 재등록 + 터미널 창에 즉시 반영한다.
import { useEffect, useState } from 'react';
import { AppSettings, DEFAULT_SETTINGS, ThemeMode } from '@shared/types';

export function SettingsApp() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [status, setStatus] = useState<'idle' | 'saved'>('idle');
  const [capturing, setCapturing] = useState(false); // 단축키 입력 대기 상태

  // 마운트 시 현재 설정을 불러와 폼을 초기화한다.
  useEffect(() => {
    window.api.getSettings().then(setSettings).catch(() => {
      // 실패 시 기본값 유지.
    });
  }, []);

  // 단축키 캡처 — "변경"을 누르면 다음 키 조합을 받아 accelerator로 저장한다.
  useEffect(() => {
    if (!capturing) return;

    const onKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        setCapturing(false);
        return;
      }

      const accelerator = eventToAccelerator(e);
      // 수정자만 눌렸거나(미완성) 수정자 없는 일반 키면 null → 계속 대기.
      if (accelerator) {
        setSettings((prev) => ({ ...prev, hotkey: accelerator }));
        setStatus('idle');
        setCapturing(false);
      }
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [capturing]);

  const toggleCapture = () => {
    if (capturing) {
      setCapturing(false);
    } else {
      setCapturing(true);
      setStatus('idle');
    }
  };

  const selectThemeMode = (mode: ThemeMode) => {
    setSettings((prev) => ({ ...prev, themeMode: mode }));
    setStatus('idle');
  };

  const setFontSize = (size: number) => {
    setSettings((prev) => ({ ...prev, fontSize: size }));
    setStatus('idle');
  };

  const handleSave = async () => {
    const saved = await window.api.saveSettings(settings);
    setSettings(saved); // 병합된 최종값으로 동기화.
    setStatus('saved');
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setCapturing(false);
    setStatus('idle');
  };

  return (
    <div className="app">
      {/* 상단바 — 타이틀바를 숨겼으므로 이 영역이 창 드래그 핸들 역할을 한다. */}
      <header className="topbar">
        <div className="brand">
          <span className="brand-badge">›_</span>
          <div className="brand-text">
            <span className="brand-name">peekterm</span>
            <span className="brand-sub">환경설정</span>
          </div>
        </div>
      </header>

      <main className="content">
        <div className="card">
          {/* 전역 단축키 */}
          <div className="row">
            <div className="row-info">
              <span className="row-title">전역 단축키</span>
              <span className="row-desc">어디서든 터미널을 부르는 키</span>
            </div>
            <div className="row-control">
              <kbd className={`kbd${capturing ? ' kbd-capturing' : ''}`}>
                {capturing ? '입력 대기…' : prettyAccelerator(settings.hotkey)}
              </kbd>
              <button className="btn-soft" onClick={toggleCapture}>
                {capturing ? '취소' : '변경'}
              </button>
            </div>
          </div>

          {/* 폰트 크기 */}
          <div className="row">
            <div className="row-info">
              <span className="row-title">폰트 크기</span>
              <span className="row-desc">JetBrains Mono · {settings.fontSize}px</span>
            </div>
            <div className="row-control">
              <input
                className="slider"
                type="range"
                min={9}
                max={24}
                value={settings.fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
          </div>

          {/* 색상 테마 */}
          <div className="row">
            <div className="row-info">
              <span className="row-title">색상 테마</span>
              <span className="row-desc">터미널 배경/글자색</span>
            </div>
            <div className="row-control">
              <div className="segmented">
                <button
                  className={`seg${settings.themeMode === 'dark' ? ' seg-active' : ''}`}
                  onClick={() => selectThemeMode('dark')}
                >
                  🌙 다크
                </button>
                <button
                  className={`seg${settings.themeMode === 'light' ? ' seg-active' : ''}`}
                  onClick={() => selectThemeMode('light')}
                >
                  ☀️ 라이트
                </button>
              </div>
            </div>
          </div>
        </div>

        {capturing && (
          <p className="hint">
            원하는 조합키를 누르세요 · 최소 한 개의 수정자(cmd/ctrl/alt) 필요 · <kbd className="hint-key">Esc</kbd> 취소
          </p>
        )}
      </main>

      <footer className="footer">
        <button className="btn-ghost" onClick={handleReset}>
          기본값
        </button>
        <button className={`btn-primary${status === 'saved' ? ' btn-saved' : ''}`} onClick={handleSave}>
          {status === 'saved' ? '저장됨 ✓' : '저장'}
        </button>
      </footer>
    </div>
  );
}

// ── 단축키 캡처 유틸 ──

// KeyboardEvent를 Electron accelerator 문자열로 변환한다.
// 전역 단축키 오작동을 막기 위해 최소 한 개의 수정자(⌘/⌃/⌥) 또는 F1~F24 키를 요구한다.
function eventToAccelerator(e: KeyboardEvent): string | null {
  const key = codeToAcceleratorKey(e.code, e.key);
  if (!key) return null; // 수정자 단독 입력 등은 무시.

  const modifiers: string[] = [];
  if (e.metaKey) modifiers.push('Command');
  if (e.ctrlKey) modifiers.push('Control');
  if (e.altKey) modifiers.push('Alt');
  if (e.shiftKey) modifiers.push('Shift');

  const isFunctionKey = /^F\d{1,2}$/.test(key);
  const hasModifier = e.metaKey || e.ctrlKey || e.altKey;
  if (!hasModifier && !isFunctionKey) return null; // 수정자 없는 일반 키는 거부.

  return [...modifiers, key].join('+');
}

// 물리 키 코드(e.code)를 accelerator 키 토큰으로 매핑한다.
function codeToAcceleratorKey(code: string, key: string): string | null {
  const modifierCodes = [
    'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
    'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight',
  ];
  if (modifierCodes.includes(code)) return null; // 수정자 단독 키는 무시.

  if (/^Key[A-Z]$/.test(code)) return code.slice(3); // KeyT → T
  if (/^Digit[0-9]$/.test(code)) return code.slice(5); // Digit1 → 1
  if (/^F\d{1,2}$/.test(code)) return code; // F1 ~ F12

  const map: Record<string, string> = {
    Backquote: '`', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']',
    Backslash: '\\', Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/',
    Space: 'Space', Enter: 'Return', Tab: 'Tab', Backspace: 'Backspace', Delete: 'Delete',
    Home: 'Home', End: 'End', PageUp: 'PageUp', PageDown: 'PageDown',
    ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
  };
  if (map[code]) return map[code];

  if (key.length === 1) return key.toUpperCase(); // 폴백: 단일 인쇄 가능 문자.
  return null;
}

// accelerator 문자열을 읽기 쉬운 텍스트로 변환한다. 예: "Alt+." → "alt + .", "Control+Shift+T" → "ctrl + shift + T"
function prettyAccelerator(accelerator: string): string {
  if (!accelerator) return '미설정';
  const labelMap: Record<string, string> = {
    CommandOrControl: 'cmd', Command: 'cmd', Cmd: 'cmd', Super: 'cmd', Meta: 'cmd',
    Control: 'ctrl', Ctrl: 'ctrl', Alt: 'alt', Option: 'alt', Shift: 'shift',
  };
  return accelerator
    .split('+')
    .map((token) => labelMap[token] ?? token)
    .join(' + ');
}
