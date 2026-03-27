import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { useProgressionStore } from '../store/progressionStore'
import RoleBadge from '../components/RoleBadge'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { xp, levelName } = useProgressionStore()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const navItems = [
    { path: '/dashboard',   label: 'DASHBOARD'   },
    { path: '/leaderboard', label: 'LEADERBOARD' },
    { path: '/profile',     label: 'PROFILE'     },
  ]

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-panel border-b border-arena-border">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-8 h-8 border-2 rounded-sm flex items-center justify-center"
              style={{ borderColor: '#00d4ff', boxShadow: '0 0 10px #00d4ff40' }}
            >
              <span className="text-sm font-display font-bold neon-text-blue">CS</span>
            </div>
            <span className="font-display font-bold text-sm tracking-widest neon-text-blue hidden sm:block">
              CYBERSAFE<span className="neon-text-red ml-1">ARENA</span>
            </span>
          </Link>

          {/* Desktop nav links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
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

          {/* Right side */}
          {user && (
            <div className="flex items-center gap-2">
              {/* Username + level — desktop only */}
              <div className="hidden md:flex flex-col items-end">
                <span className="text-xs font-mono text-white">{user.username}</span>
                <span className="text-xs text-arena-muted">{levelName}</span>
              </div>

              {user.role && (
                <div className="hidden sm:block">
                  <RoleBadge role={user.role} size="sm" />
                </div>
              )}

              {/* Desktop logout */}
              <motion.button
                onClick={handleLogout}
                className="hidden md:block text-xs font-display tracking-wider px-3 py-1.5 border border-arena-border text-arena-muted"
                whileHover={{ borderColor: '#ff2244', color: '#ff2244' }}
              >
                LOGOUT
              </motion.button>

              {/* Mobile hamburger — 44×44 touch target */}
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="md:hidden flex flex-col justify-center items-center w-11 h-11 gap-1.5"
                aria-label="Toggle menu"
              >
                <motion.span
                  className="block w-5 h-px bg-current"
                  style={{ color: menuOpen ? '#00d4ff' : '#475569' }}
                  animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                <motion.span
                  className="block w-5 h-px bg-current"
                  style={{ color: menuOpen ? '#00d4ff' : '#475569' }}
                  animate={{ opacity: menuOpen ? 0 : 1 }}
                  transition={{ duration: 0.15 }}
                />
                <motion.span
                  className="block w-5 h-px bg-current"
                  style={{ color: menuOpen ? '#00d4ff' : '#475569' }}
                  animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }}
                  transition={{ duration: 0.2 }}
                />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              className="fixed top-14 left-0 right-0 z-40 md:hidden border-b border-arena-border"
              style={{ background: 'rgba(6,13,26,0.98)' }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {/* User info row */}
              {user && (
                <div
                  className="flex items-center gap-3 px-5 py-4 border-b border-arena-border"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-base shrink-0"
                    style={{ background: 'rgba(0,212,255,0.15)', color: '#00d4ff', border: '1.5px solid rgba(0,212,255,0.3)' }}
                  >
                    {user.username?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm text-white truncate">{user.username}</p>
                    <p className="font-mono text-xs text-arena-muted">{levelName}</p>
                  </div>
                  {user.role && <RoleBadge role={user.role} size="sm" />}
                </div>
              )}

              {/* Nav links — large touch targets */}
              <div className="py-2">
                {navItems.map(({ path, label }) => {
                  const active = location.pathname === path
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-5 py-4"
                      style={{ color: active ? '#00d4ff' : '#475569' }}
                    >
                      {active && (
                        <div
                          className="w-1 h-4 rounded-full shrink-0"
                          style={{ background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }}
                        />
                      )}
                      {!active && <div className="w-1 shrink-0" />}
                      <span
                        className="font-display text-sm tracking-widest"
                        style={{ textShadow: active ? '0 0 8px #00d4ff' : 'none' }}
                      >
                        {label}
                      </span>
                    </Link>
                  )
                })}
              </div>

              {/* Logout */}
              <div className="px-5 py-4 border-t border-arena-border">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 font-display text-sm tracking-wider border border-arena-border text-arena-muted rounded"
                  style={{ minHeight: '44px' }}
                >
                  LOGOUT
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}