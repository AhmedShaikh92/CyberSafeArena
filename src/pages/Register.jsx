import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { register, isLoading, error, clearError } = useAuthStore()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [focused, setFocused] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await register(form.username, form.email, form.password)
    if (result.success) navigate('/dashboard')
  }

  const handleChange = (e) => {
    clearError()
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const fields = [
    { key: 'username', label: 'OPERATOR CALLSIGN', type: 'text', placeholder: 'ghost_operator_01' },
    { key: 'email', label: 'EMAIL ADDRESS', type: 'email', placeholder: 'operator@arena.net' },
    { key: 'password', label: 'ACCESS KEY', type: 'password', placeholder: '••••••••••••' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-8">
        <motion.h1
          className="font-display text-4xl font-black tracking-widest mb-2"
          animate={{
            textShadow: [
              '0 0 20px #ff2244, 0 0 60px #ff224440',
              '0 0 30px #ff2244, 0 0 80px #ff224460',
              '0 0 20px #ff2244, 0 0 60px #ff224440',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="neon-text-blue">CYBER</span>
          <span className="neon-text-red">SAFE</span>
          <span className="neon-text-blue ml-2">ARENA</span>
        </motion.h1>
        <p className="text-arena-muted text-xs font-mono tracking-widest">
          // NEW OPERATOR REGISTRATION
        </p>
      </div>

      <div className="glass-panel rounded-sm p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-arena-border" />
          <span className="font-display text-xs tracking-widest text-arena-muted">ENLIST NOW</span>
          <div className="h-px flex-1 bg-arena-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-mono text-arena-muted mb-1.5 tracking-wider">{label}</label>
              <input
                type={type}
                name={key}
                value={form[key]}
                onChange={handleChange}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused(null)}
                required
                className="w-full bg-black/40 border rounded-sm px-4 py-3 text-sm font-mono text-white outline-none transition-all duration-200"
                style={{
                  borderColor: focused === key ? '#ff2244' : '#1e293b',
                  boxShadow: focused === key ? '0 0 15px #ff224420, inset 0 0 10px #ff224408' : 'none',
                }}
                placeholder={placeholder}
              />
            </div>
          ))}

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

          <div className="pt-2">
            <p className="text-xs text-arena-muted font-mono mb-3 leading-relaxed">
              <span style={{ color: '#f59e0b' }}>⚡</span> Your team assignment will be determined by the Arena AI based on your performance profile.
            </p>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-sm px-6 py-3 font-display text-sm font-bold tracking-widest uppercase transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff224415, #ff224408)',
              border: '1px solid #ff2244',
              color: '#ff2244',
              textShadow: '0 0 10px #ff2244',
              boxShadow: '0 0 15px #ff224420',
            }}
            whileHover={{ boxShadow: '0 0 30px #ff224440' }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? 'ENLISTING...' : 'ENLIST AS OPERATOR'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login">
            <span className="text-xs font-mono text-arena-muted hover:text-arena-defender transition-colors">
              Already enlisted? <span className="neon-text-blue">LOGIN</span>
            </span>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
