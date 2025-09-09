import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  MapPin,
  Settings,
  Camera,
  Trophy,
  Flame,
  Globe,
  LogOut,
  Star,
  Award,
  Clock,
  BookOpen,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"

const Profile = () => {
  const { user: contextUser, logout, switchLanguage, updateUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [switchingLanguage, setSwitchingLanguage] = useState(false)
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    location: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  useEffect(() => {
    if (contextUser) {
      setFormData({
        displayName: contextUser.displayName || "",
        bio: contextUser.bio || "",
        location: contextUser.location || "",
      })
    }
  }, [contextUser])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        handleLogout()
        return
      }

      const response = await fetch("https://ai-summit-fic4.vercel.app/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout()
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.success && data.user) {
        setProfile(data)
        updateUser(data.user)
        setFormData({
          displayName: data.user.displayName || "",
          bio: data.user.bio || "",
          location: data.user.location || "",
        })
      } else {
        throw new Error("Invalid response")
      }
    } catch (error: any) {
      console.error("Profile fetch error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // ✅ FIXED: Properly calls your backend PUT /profile endpoint
  const handleSaveProfile = async () => {
    if (!formData.displayName.trim()) {
      toast({
        title: "Error",
        description: "Display name cannot be empty",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        handleLogout()
        return
      }

      console.log("🔄 Updating profile with data:", formData)

      // ✅ This matches your backend exactly: PUT /api/auth/profile
      const response = await fetch("https://ai-summit-fic4.vercel.app/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          bio: formData.bio.trim(),
          location: formData.location.trim(),
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout()
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      console.log("✅ Profile update response:", data)

      if (data.success && data.user) {
        toast({
          title: "Success! ✅",
          description: "Profile updated successfully",
        })

        // Update both local state and context
        updateUser(data.user)
        setProfile((prevProfile) => ({
          ...prevProfile,
          user: data.user,
        }))

        // Update form to reflect saved data
        setFormData({
          displayName: data.user.displayName || "",
          bio: data.user.bio || "",
          location: data.user.location || "",
        })
      } else {
        throw new Error(data.message || "Update failed")
      }
    } catch (error: any) {
      console.error("❌ Profile update error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/signin")
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
  }

  const handleLanguageSwitch = async (newLanguage: string) => {
    setSwitchingLanguage(true)
    try {
      await switchLanguage(newLanguage)

      // Immediately update local state to reflect the change
      const updatedUser = { ...contextUser, currentLanguage: newLanguage }
      updateUser(updatedUser)

      if (profile) {
        setProfile((prev) => ({
          ...prev,
          user: { ...prev.user, currentLanguage: newLanguage },
        }))
      }

      toast({
        title: "Success",
        description: `Switched to ${newLanguage} successfully!`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to switch language",
        variant: "destructive",
      })
    } finally {
      setSwitchingLanguage(false)
    }
  }

  const formatTimeSpent = (minutes: number) => {
    if (!minutes || minutes === 0) return "0m"
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const getAchievementIcon = (iconName: string) => {
    const icons: any = {
      Star,
      Flame,
      BookOpen,
      Award,
      Clock,
      Trophy,
    }
    const IconComponent = icons[iconName] || Trophy
    return <IconComponent className="w-8 h-8" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-300 text-lg">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile && !contextUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center py-12">
          <p className="text-slate-300 text-lg mb-4">No profile data available</p>
          <Button onClick={fetchProfile} className="bg-blue-500 hover:bg-blue-600 text-white">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  const userData = profile?.user || contextUser || {}
  const userStats = profile?.stats || {}
  const achievements = profile?.achievements || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Logout */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Profile
            </h1>
            <p className="text-slate-300 mt-2">Manage your account and learning preferences</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white bg-transparent"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="lg:col-span-1 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="w-24 h-24 ring-4 ring-blue-500/20">
                  <AvatarImage src={userData.avatarUrl || "/avatars/default.jpg"} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white">
                    {(userData.displayName || userData.email || "U").substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-2 -right-2 rounded-full p-2 bg-slate-700 border-slate-600 hover:bg-slate-600"
                >
                  <Camera className="w-4 h-4 text-slate-300" />
                </Button>
              </div>
              <div>
                <CardTitle className="text-xl text-white">{userData.displayName || "User"}</CardTitle>
                <CardDescription className="text-slate-400">{userData.bio || "Language Enthusiast"}</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1 p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400">{userStats.level || 1}</div>
                  <div className="text-xs text-slate-400">Level</div>
                </div>
                <div className="space-y-1 p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30">
                  <div className="text-3xl font-bold text-blue-400">{userStats.totalXP || 0}</div>
                  <div className="text-xs text-slate-400">Total XP</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1 p-4 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl border border-red-500/30">
                  <div className="text-3xl font-bold text-red-400 flex items-center justify-center gap-1">
                    <Flame className="w-7 h-7" />
                    {userStats.streak || 0}
                  </div>
                  <div className="text-xs text-slate-400">Day Streak</div>
                </div>
                <div className="space-y-1 p-4 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl border border-emerald-500/30">
                  <div className="text-3xl font-bold text-emerald-400">{userStats.lessonsCompleted || 0}</div>
                  <div className="text-xs text-slate-400">Lessons Done</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="space-y-1 p-3 bg-slate-700/50 rounded-xl border border-slate-600">
                  <div className="text-xl font-semibold text-purple-400">
                    {formatTimeSpent(userStats.timeSpent || 0)}
                  </div>
                  <div className="text-xs text-slate-400">Study Time</div>
                </div>
                <div className="space-y-1 p-3 bg-slate-700/50 rounded-xl border border-slate-600">
                  <div className="text-xl font-semibold text-indigo-400">{userStats.averageScore || 0}%</div>
                  <div className="text-xs text-slate-400">Avg Score</div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(userData.joinDate).toLocaleDateString()}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Globe className="w-4 h-4" />
                    <span>Learning Language</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={userData.currentLanguage === "japanese" ? "default" : "outline"}
                      onClick={() => handleLanguageSwitch("japanese")}
                      disabled={switchingLanguage}
                      className={`h-8 px-3 text-xs transition-all ${
                        userData.currentLanguage === "japanese"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      Japanese
                    </Button>
                    <Button
                      size="sm"
                      variant={userData.currentLanguage === "spanish" ? "default" : "outline"}
                      onClick={() => handleLanguageSwitch("spanish")}
                      disabled={switchingLanguage}
                      className={`h-8 px-3 text-xs transition-all ${
                        userData.currentLanguage === "spanish"
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      Spanish
                    </Button>
                  </div>
                </div>

                {userData.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{userData.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profile Settings */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-slate-400">Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="displayName" className="text-slate-300">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  placeholder="Enter your display name"
                  className="font-medium bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                />
                <p className="text-xs text-slate-500">This is how your name appears to others</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email || ""}
                  disabled
                  className="bg-slate-700 border-slate-600 text-slate-400"
                />
                <p className="text-xs text-slate-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-slate-300">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where are you from?"
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-300">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about your language learning journey..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="min-h-[100px] bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                  maxLength={500}
                />
                <p className="text-xs text-slate-500">{formData.bio.length}/500 characters</p>
              </div>

              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {saving ? "Saving Changes..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ✅ Achievements Section - Shows actual earned achievements */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Achievements
              <Badge variant="secondary" className="ml-2 bg-slate-700 text-slate-300">
                {achievements.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement: any, index: number) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-xl border border-yellow-500/30"
                  >
                    <div className={`${achievement.color} opacity-80`}>{getAchievementIcon(achievement.icon)}</div>
                    <div>
                      <h4 className="font-semibold text-white">{achievement.name}</h4>
                      <p className="text-sm text-slate-400">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 mb-2">No achievements yet</p>
                <p className="text-sm text-slate-500">Complete lessons and maintain streaks to earn achievements!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile
