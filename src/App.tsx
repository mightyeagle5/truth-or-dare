import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { HomePage } from './routes/HomePage'
import { GamePage } from './routes/GamePage'
import { useGameStore, useUIStore, useHistoryStore } from './store'
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
        </Routes>
      </div>
    </Router>
  )
}

export default App
