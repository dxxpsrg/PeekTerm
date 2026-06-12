// 사이드패널 창의 위치/크기를 계산하는 순수 함수.
// electron에 의존하지 않으므로 단위 테스트가 가능하다.

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 주어진 작업영역(workArea)의 우측 절반(너비 50%, 높이 100%) 영역을 반환한다.
// 메뉴바/Dock을 제외한 workArea 기준이라 창이 시스템 UI와 겹치지 않는다.
export function computeSidePanelBounds(workArea: Rect): Rect {
  const width = Math.floor(workArea.width / 2);
  return {
    x: workArea.x + workArea.width - width, // 우측에 붙임
    y: workArea.y,
    width,
    height: workArea.height, // 세로 전체
  };
}
