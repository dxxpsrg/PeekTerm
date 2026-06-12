import { describe, it, expect } from 'vitest';
import { computeSidePanelBounds } from './bounds';

describe('computeSidePanelBounds', () => {
  it('원점 작업영역에서 우측 절반(너비 50%, 높이 100%)을 반환한다', () => {
    const result = computeSidePanelBounds({ x: 0, y: 0, width: 1920, height: 1080 });
    expect(result).toEqual({ x: 960, y: 0, width: 960, height: 1080 });
  });

  it('메뉴바 오프셋(y)이 있는 작업영역을 그대로 반영한다', () => {
    const result = computeSidePanelBounds({ x: 0, y: 25, width: 1440, height: 875 });
    expect(result).toEqual({ x: 720, y: 25, width: 720, height: 875 });
  });

  it('홀수 너비는 내림 처리해 정수 좌표를 보장한다', () => {
    const result = computeSidePanelBounds({ x: 0, y: 0, width: 1001, height: 800 });
    // floor(1001/2)=500 → x = 0 + 1001 - 500 = 501
    expect(result).toEqual({ x: 501, y: 0, width: 500, height: 800 });
  });

  it('보조 모니터처럼 x 오프셋이 있는 경우도 우측에 정렬한다', () => {
    const result = computeSidePanelBounds({ x: 1920, y: 0, width: 1920, height: 1080 });
    expect(result).toEqual({ x: 2880, y: 0, width: 960, height: 1080 });
  });
});
