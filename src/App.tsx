import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { GamePage } from './routes/GamePage'
import { CreateCustomGamePage } from './routes/CreateCustomGamePage'
import AdminPage from './routes/AdminPage'
import { ThemeEditorPage } from './routes/ThemeEditorPage'
import { useGameStore, useHistoryStore } from './store'
import './styles/index.css'

function App() {
  const { loadItems } = useGameStore()
  const { loadGameHistory } = useHistoryStore()

  useEffect(() => {
    // Load initial data
    loadItems()
    loadGameHistory()
  }, [loadItems, loadGameHistory])

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
          <Route path="/create-custom-game" element={<CreateCustomGamePage />} />
          {import.meta.env.DEV && (
            <>
              <Route path="/admin/edit-challenges" element={<AdminPage />} />
              <Route path="/dev/theme-editor" element={<ThemeEditorPage />} />
            </>
          )}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
