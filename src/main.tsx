import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

// StrictMode 비활성화: 개발 환경에서 useEffect 이중 실행으로 Gemini API가
// 중복 호출되어 Rate Limit(429)이 발생하므로 의도적으로 제거합니다.
createRoot(rootElement).render(<App />)
