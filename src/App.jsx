import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'

// Layouts
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'

// Pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Matchmaking from './pages/Matchmaking'
import MatchFound from './pages/MatchFound'
import TacticalBriefing from './pages/TacticalBriefing'
import Simulation from './pages/Simulation'
import AAR from './pages/AAR'
import Leaderboard from './pages/Leaderboard'
import Profile from './pages/Profile'
import PrivateRoom from './pages/PrivateRoom'

// Auth guard
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Auth routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Game flow — minimal nav */}
          <Route path="/matchmaking" element={
            <ProtectedRoute>
              <div className="min-h-screen" style={{ background: '#0b1120' }}>
                <Matchmaking />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/room" element={
            <ProtectedRoute>
              <PrivateRoom />
            </ProtectedRoute>
          } />
          <Route path="/match-found" element={
            <ProtectedRoute>
              <div className="min-h-screen" style={{ background: '#0b1120' }}>
                <MatchFound />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/briefing" element={
            <ProtectedRoute>
              <div className="min-h-screen pt-0" style={{ background: '#0b1120' }}>
                <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />
                <TacticalBriefing />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/simulation" element={
            <ProtectedRoute>
              <div style={{ background: '#0b1120' }}>
                <Simulation />
              </div>
            </ProtectedRoute>
          } />
          <Route path="/aar" element={
            <ProtectedRoute>
              <div className="min-h-screen" style={{ background: '#0b1120' }}>
                <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
                <div className="relative z-10 pt-4">
                  <AAR />
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </BrowserRouter>
  )
}
