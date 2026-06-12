// xterm.js를 React 컴포넌트로 감싼 터미널 뷰.
// 명령형 xterm 인스턴스의 생명주기를 useEffect로 관리하고, PTY와 양방향 연결한다.
import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { AppSettings, DEFAULT_SETTINGS, TERMINAL_FONT_FAMILY, TERMINAL_THEMES } from '@shared/types';

export function TerminalView() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1) 기본 설정으로 xterm 인스턴스 생성.
    const term = new Terminal({
      fontFamily: TERMINAL_FONT_FAMILY, // 고정 웹폰트(JetBrains Mono)
      fontSize: DEFAULT_SETTINGS.fontSize,
      cursorBlink: true,
      theme: { ...TERMINAL_THEMES[DEFAULT_SETTINGS.themeMode] },
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(container);
    fit.fit();

    // 2) PTY ↔ 터미널 연결.
    window.api.onPtyData((data) => term.write(data)); // 셸 출력 → 화면.
    window.api.onPtyExit(() => term.write('\r\n\x1b[31m[셸 프로세스가 종료되었습니다]\x1b[0m\r\n'));
    const inputDisposable = term.onData((data) => window.api.ptyWrite(data)); // 키 입력 → 셸.

    // 3) 크기 동기화 — 컨테이너 크기에 맞춰 fit 후 PTY에도 cols/rows 통지.
    const syncSize = () => {
      try {
        fit.fit();
        window.api.ptyResize(term.cols, term.rows);
      } catch {
        // 레이아웃이 아직 0 크기일 때 fit이 throw할 수 있어 무시.
      }
    };
    syncSize();
    const resizeObserver = new ResizeObserver(() => syncSize());
    resizeObserver.observe(container);
    window.addEventListener('resize', syncSize);

    // 웹폰트(JetBrains Mono) 로드 완료 시 글자 메트릭이 바뀌므로 재측정해 정렬을 맞춘다.
    document.fonts?.ready.then(syncSize).catch(() => {});

    // 4) 설정 적용 함수 — 초기 로드와 실시간 변경에 공통 사용.
    //    폰트 종류는 고정이므로 크기/테마만 반영한다.
    const applySettings = (s: AppSettings) => {
      term.options.fontSize = s.fontSize;
      const theme = TERMINAL_THEMES[s.themeMode];
      term.options.theme = { ...theme };
      // xterm 바깥의 패딩 영역도 테마 배경색으로 맞춰 경계가 튀지 않게 한다.
      container.style.background = theme.background;
      syncSize(); // 폰트 크기 변경 시 cols/rows가 달라지므로 재동기화.
    };
    window.api.onSettingsApply(applySettings);
    window.api.getSettings().then(applySettings).catch(() => {
      // 설정 조회 실패 시 기본값 유지.
    });

    term.focus();

    // 5) 정리 — 언마운트 시 옵저버/리스너 해제 및 xterm 폐기.
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncSize);
      inputDisposable.dispose();
      term.dispose();
    };
  }, []);

  return <div className="terminal-container" ref={containerRef} />;
}
