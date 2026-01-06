import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { GamePage } from './routes/GamePage'
import { CreateCustomGamePage } from './routes/CreateCustomGamePage'
import AdminPage from './routes/AdminPage'
import { ThemeEditor } from './components/dev'
import { Toast } from './components/ui'
import { useHistoryStore, useUIStore } from './store'
import './styles/index.css'

function AppContent() {
  const { loadGameHistory } = useHistoryStore()
  const { toast, setToast } = useUIStore()

  useEffect(() => {
    // Load initial data (challenges are now fetched on-demand during gameplay)
    loadGameHistory()
  }, [loadGameHistory])

  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/create-custom-game" element={<CreateCustomGamePage />} />
          {import.meta.env.DEV && (
            <Route path="/admin/edit-challenges" element={<AdminPage />} />
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toast message={toast} onClose={() => setToast(null)} />
      {/* Theme Editor: Change false to true to enable */}
      {false && <ThemeEditor />}
    </>
  )
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <AppContent />
    </Router>
  )
}

export default App
