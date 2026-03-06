import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const { login, isLoading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await login(form.email, form.password)
    if (result.success) navigate('/dashboard')
  }

  const handleChange = (e) => {
    clearError()
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <div className="text-center mb-8">
        <motion.h1
          className="font-display text-4xl font-black tracking-widest mb-2"
          animate={{
            textShadow: [
              '0 0 20px #00d4ff, 0 0 60px #00d4ff40',
              '0 0 30px #00d4ff, 0 0 80px #00d4ff60',
              '0 0 20px #00d4ff, 0 0 60px #00d4ff40',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="neon-text-blue">CYBER</span>
          <span className="neon-text-red">SAFE</span>
          <span className="neon-text-blue ml-2">ARENA</span>
        </motion.h1>
        <p className="text-arena-muted text-xs font-mono tracking-widest">
          // SECURE ACCESS TERMINAL
        </p>
      </div>

      {/* Card */}
      <div className="glass-panel rounded-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-arena-border" />
          <span className="font-display text-xs tracking-widest text-arena-muted">OPERATOR LOGIN</span>
          <div className="h-px flex-1 bg-arena-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-xs font-mono text-arena-muted mb-1.5 tracking-wider">EMAIL ADDRESS</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                required
                className="w-full bg-black/40 border rounded-sm px-4 py-3 text-sm font-mono text-white outline-none transition-all duration-200"
                style={{
                  borderColor: focused === 'email' ? '#00d4ff' : '#1e293b',
                  boxShadow: focused === 'email' ? '0 0 15px #00d4ff20, inset 0 0 10px #00d4ff08' : 'none',
                }}
                placeholder="operator@arena.net"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-mono text-arena-muted mb-1.5 tracking-wider">ACCESS KEY</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              required
              className="w-full bg-black/40 border rounded-sm px-4 py-3 text-sm font-mono text-white outline-none transition-all duration-200"
              style={{
                borderColor: focused === 'password' ? '#00d4ff' : '#1e293b',
                boxShadow: focused === 'password' ? '0 0 15px #00d4ff20, inset 0 0 10px #00d4ff08' : 'none',
              }}
              placeholder="••••••••••••"
            />
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-mono px-3 py-2 rounded-sm"
              style={{ background: '#ff224415', border: '1px solid #ff224440', color: '#ff2244' }}
            >
              ⚠ {error}
            </motion.div>
          )}

          {/* Submit */}
          <motion.button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full rounded-sm mt-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full"
                />
                AUTHENTICATING...
              </span>
            ) : 'ENTER ARENA'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/register">
            <span className="text-xs font-mono text-arena-muted hover:text-arena-defender transition-colors">
              No operator account? <span className="neon-text-blue">REGISTER</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-arena-muted mt-4 font-mono opacity-50">
        All sessions are monitored and logged
      </p>
    </motion.div>
  )
}
