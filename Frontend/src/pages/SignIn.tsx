"use client"

import type React from "react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff } from "lucide-react"

const SignIn = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      toast({
        title: "Welcome back!",
        description: "Successfully signed in!",
      })
      navigate("/dashboard")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-teal-800 flex items-center justify-center p-4">
      <Link to="/" className="absolute top-6 left-6 text-slate-400 hover:text-white text-2xl font-light">
        ×
      </Link>

      <Link
        to="/signup"
        className="absolute top-6 right-6 bg-transparent border border-teal-400 text-teal-400 hover:bg-teal-400 hover:text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        SIGN UP
      </Link>

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-normal text-white mb-8">Log in</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg text-base focus:border-teal-400 focus:ring-teal-400"
            required
          />

          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 rounded-lg text-base focus:border-teal-400 focus:ring-teal-400 pr-12"
              required
            />
            
            {/* Password visibility toggle button */}
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-teal-400 transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-sky-500 hover:bg-sky-600 text-white font-bold text-base rounded-lg mt-6"
            disabled={isLoading}
          >
            {isLoading ? "LOGGING IN..." : "LOG IN"}
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-slate-400">OR</span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full h-12 bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 1c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              GOOGLE
            </Button>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 space-y-2">
          <p>
            By signing in to AI Learn, you agree to our <span className="text-teal-400">Terms</span> and{" "}
            <span className="text-teal-400">Privacy Policy</span>.
          </p>
          <p>
            This site is protected by reCAPTCHA Enterprise and the Google{" "}
            <span className="text-teal-400">Privacy Policy</span> and{" "}
            <span className="text-teal-400">Terms of Service</span> apply.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn