import { useCallback, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'
import { ToastContainer } from './components/Toast'
import { CreateEntryPage } from './pages/CreateEntryPage'
import { StoresPage } from './pages/StoresPage'
import { SubmissionsPage } from './pages/SubmissionsPage'
import type { ToastMessage } from './types'

export function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  // Toast notification helper
  const addToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = { id, type, title, message }
    setToasts((prev) => [...prev, newToast])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4500)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50/70 text-slate-800 antialiased font-sans flex flex-col">
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        
        {/* Persistent Top Navigation Bar */}
        <Navbar />

        {/* Multi-Page Routes (Loaded On Demand Per Page) */}
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/entry" replace />} />
            <Route path="/order" element={<Navigate to="/entry" replace />} />
            <Route
              path="/entry"
              element={<CreateEntryPage onNotify={addToast} />}
            />
            <Route
              path="/stores"
              element={<StoresPage onNotify={addToast} />}
            />
            <Route
              path="/submissions"
              element={<SubmissionsPage onNotify={addToast} />}
            />
            <Route path="*" element={<Navigate to="/entry" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App