import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import CyberGrid from '../components/CyberGrid'

export default function MainLayout() {
  return (
    <div className="min-h-screen relative">
      <CyberGrid />
      <div className="scanline-overlay" />
      <Navbar />
      <main className="pt-14 relative z-10">
        <Outlet />
      </main>
    </div>
  )
}
