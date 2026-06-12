// 터미널 창 React 진입점.
// 주의: xterm은 명령형 DOM 인스턴스라 StrictMode의 이중 마운트와 충돌한다.
// 따라서 터미널 창은 StrictMode 없이 렌더한다.
import { createRoot } from 'react-dom/client';
import { TerminalView } from './components/TerminalView';
import './styles/terminal.css';

const container = document.getElementById('root');
if (!container) throw new Error('root 엘리먼트를 찾을 수 없습니다.');

createRoot(container).render(<TerminalView />);
