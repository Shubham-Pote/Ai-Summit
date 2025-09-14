"use client"

import { Outlet, Navigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import Navbar from "./Navbar"

const Layout = () => {
  const { user, loading } = useAuth()

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-emerald-400 mx-auto mb-6"></div>
            <div
              className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-t-blue-400 animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <p className="text-slate-300 text-lg font-medium">Loading your learning journey...</p>
        </div>
      </div>
    )
  }

  // Redirect to sign in if not authenticated
  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
