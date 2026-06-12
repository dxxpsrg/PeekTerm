import { describe, it, expect } from 'vitest';
import { mergeSettings } from './settings-merge';
import { DEFAULT_SETTINGS } from './types';

describe('mergeSettings', () => {
  it('null/undefined이면 기본 설정을 반환한다', () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(mergeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
  });

  it('일부 키만 주어지면 나머지는 기본값으로 채운다', () => {
    const merged = mergeSettings({ fontSize: 18 });
    expect(merged.fontSize).toBe(18);
    expect(merged.hotkey).toBe(DEFAULT_SETTINGS.hotkey);
    expect(merged.themeMode).toBe(DEFAULT_SETTINGS.themeMode);
  });

  it('themeMode가 light면 그대로 반영한다', () => {
    expect(mergeSettings({ themeMode: 'light' }).themeMode).toBe('light');
  });

  it('themeMode가 유효하지 않으면 기본값으로 보정한다', () => {
    const merged = mergeSettings({ themeMode: 'solarized' as never });
    expect(merged.themeMode).toBe(DEFAULT_SETTINGS.themeMode);
  });

  it('전체 설정이 주어지면 그대로 반영한다', () => {
    const full = {
      hotkey: 'Option+Space',
      fontSize: 15,
      themeMode: 'light' as const,
    };
    expect(mergeSettings(full)).toEqual(full);
  });
});
