// 설정 창 React 진입점.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SettingsApp } from './components/SettingsApp';
import './styles/settings.css';

const container = document.getElementById('root');
if (!container) throw new Error('root 엘리먼트를 찾을 수 없습니다.');

createRoot(container).render(
  <StrictMode>
    <SettingsApp />
  </StrictMode>,
);
