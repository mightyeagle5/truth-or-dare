import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { GamePage } from './routes/GamePage'
import { CreateCustomGamePage } from './routes/CreateCustomGamePage'
import AdminPage from './routes/AdminPage'
import { ThemeEditor } from './components/dev'
import { useGameStore, useHistoryStore } from './store'
import './styles/index.css'

function AppContent() {
  const { loadItems } = useGameStore()
  const { loadGameHistory } = useHistoryStore()

  useEffect(() => {
    // Load initial data
    loadItems()
    loadGameHistory()
  }, [loadItems, loadGameHistory])

  // Show theme editor only when explicitly enabled
  // To enable: localStorage.setItem('enableThemeEditor', 'true') in browser console
  // Or add ?themeEditor=true to URL
  const [showThemeEditor, setShowThemeEditor] = useState(() => {
    if (!import.meta.env.DEV) return false;
    
    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('themeEditor') === 'true') {
      localStorage.setItem('enableThemeEditor', 'true');
      return true;
    }
    
    // Check localStorage
    return localStorage.getItem('enableThemeEditor') === 'true';
  })

  useEffect(() => {
    // Listen for storage changes (if changed in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'enableThemeEditor') {
        setShowThemeEditor(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
      {showThemeEditor && <ThemeEditor />}
    </>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
