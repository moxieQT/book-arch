import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useBookStore } from './store/useBookStore'
import { ErrorBoundary } from './components/ErrorBoundary'

declare global {
  interface Window {
    __bookStore?: typeof useBookStore
    __bookScene?: unknown
  }
}

if (typeof window !== 'undefined') {
  window.__bookStore = useBookStore

  if ('serviceWorker' in navigator && import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister()
      }
    })
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
