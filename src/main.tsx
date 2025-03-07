
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'

// Force dark theme on load
document.documentElement.classList.add('dark')

createRoot(document.getElementById("root")!).render(<App />);
