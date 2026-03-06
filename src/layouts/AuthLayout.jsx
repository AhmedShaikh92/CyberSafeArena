import React from 'react'
import { Outlet } from 'react-router-dom'
import CyberGrid from '../components/CyberGrid'

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <CyberGrid />
      <div className="scanline-overlay" />
      <div className="relative z-10 w-full max-w-md px-4">
        <Outlet />
      </div>
    </div>
  )
}
