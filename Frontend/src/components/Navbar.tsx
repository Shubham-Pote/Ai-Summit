import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { BookOpen, BarChart3, Brain, GraduationCap, User, Users } from "lucide-react"

const Navbar = () => {
  const location = useLocation()

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/lessons", label: "Lessons", icon: BookOpen },
    { path: "/characters", label: "Characters", icon: Users },
    { path: "/study-hub", label: "Study Hub", icon: GraduationCap },
    { path: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="border-b border-white/10 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              AI Learn
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  asChild
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg"
                      : "text-slate-300 hover:text-white hover:bg-white/10 hover:shadow-md"
                  }`}
                >
                  <Link to={item.path}>
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
