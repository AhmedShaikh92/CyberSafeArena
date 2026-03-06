import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useProgressionStore } from '../store/progressionStore'
import RoleBadge from '../components/RoleBadge'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { xp, levelName } = useProgressionStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'DASHBOARD' },
    { path: '/leaderboard', label: 'LEADERBOARD' },
    { path: '/profile', label: 'PROFILE' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-arena-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 border-2 rounded-sm flex items-center justify-center"
              style={{ borderColor: '#00d4ff', boxShadow: '0 0 10px #00d4ff40' }}>
              <span className="text-sm font-display font-bold neon-text-blue">CS</span>
            </div>
          </div>
          <span className="font-display font-bold text-sm tracking-widest neon-text-blue hidden sm:block">
            CYBERSAFE<span className="neon-text-red ml-1">ARENA</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navItems.map(({ path, label }) => (
            <Link key={path} to={path}>
              <motion.div
                className="px-3 py-1.5 text-xs font-display tracking-widest relative"
                style={{
                  color: location.pathname === path ? '#00d4ff' : '#475569',
                  textShadow: location.pathname === path ? '0 0 8px #00d4ff' : 'none',
                }}
                whileHover={{ color: '#00d4ff' }}
              >
                {label}
                {location.pathname === path && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }}
                  />
                )}
              </motion.div>
            </Link>
          ))}
        </div>

        {/* User info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-xs font-mono text-white">{user.username}</span>
              <span className="text-xs text-arena-muted">{levelName}</span>
            </div>
            {user.role && <RoleBadge role={user.role} size="sm" />}
            <motion.button
              onClick={handleLogout}
              className="text-xs font-display tracking-wider px-3 py-1.5 border border-arena-border text-arena-muted"
              whileHover={{ borderColor: '#ff2244', color: '#ff2244' }}
            >
              LOGOUT
            </motion.button>
          </div>
        )}
      </div>
    </nav>
  )
}
