import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  BookOpen
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { user: contextUser, logout, switchLanguage, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [switchingLanguage, setSwitchingLanguage] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (contextUser) {
      setFormData({
        displayName: contextUser.displayName || '',
        bio: contextUser.bio || '',
        location: contextUser.location || ''
      });
    }
  }, [contextUser]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.user) {
        setProfile(data);
        updateUser(data.user);
        setFormData({
          displayName: data.user.displayName || '',
          bio: data.user.bio || '',
          location: data.user.location || ''
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch (error: any) {
      console.error('Profile fetch error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Properly calls your backend PUT /profile endpoint
  const handleSaveProfile = async () => {
    if (!formData.displayName.trim()) {
      toast({
        title: "Error",
        description: "Display name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        handleLogout();
        return;
      }

      console.log('🔄 Updating profile with data:', formData);

      // ✅ This matches your backend exactly: PUT /api/auth/profile
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          displayName: formData.displayName.trim(),
          bio: formData.bio.trim(),
          location: formData.location.trim()
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleLogout();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Profile update response:', data);
      
      if (data.success && data.user) {
        toast({
          title: "Success! ✅",
          description: "Profile updated successfully",
        });
        
        // Update both local state and context
        updateUser(data.user);
        setProfile(prevProfile => ({
          ...prevProfile,
          user: data.user
        }));
        
        // Update form to reflect saved data
        setFormData({
          displayName: data.user.displayName || '',
          bio: data.user.bio || '',
          location: data.user.location || ''
        });
        
      } else {
        throw new Error(data.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/signin');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  const handleLanguageSwitch = async (newLanguage: string) => {
    setSwitchingLanguage(true);
    try {
      await switchLanguage(newLanguage);
      toast({
        title: "Success",
        description: `Switched to ${newLanguage} successfully!`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to switch language",
        variant: "destructive",
      });
    } finally {
      setSwitchingLanguage(false);
    }
  };

  const formatTimeSpent = (minutes: number) => {
    if (!minutes || minutes === 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const getAchievementIcon = (iconName: string) => {
    const icons: any = {
      Star,
      Flame,
      BookOpen,
      Award,
      Clock,
      Trophy
    };
    const IconComponent = icons[iconName] || Trophy;
    return <IconComponent className="w-8 h-8" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile && !contextUser) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No profile data available</p>
        <Button onClick={fetchProfile} className="mt-4">Retry</Button>
      </div>
    );
  }

  const userData = profile?.user || contextUser || {};
  const userStats = profile?.stats || {};
  const achievements = profile?.achievements || [];

  return (
    <div className="space-y-8">
      {/* Header with Logout */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account and learning preferences</p>
        </div>
        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
          <LogOut className="w-4 h-4" />
          Log Out
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="relative mx-auto">
              <Avatar className="w-24 h-24">
                <AvatarImage src={userData.avatarUrl || "/avatars/default.jpg"} />
                <AvatarFallback className="text-2xl">
                  {(userData.displayName || userData.email || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" variant="outline" className="absolute -bottom-2 -right-2 rounded-full p-2">
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <CardTitle className="text-xl">{userData.displayName || 'User'}</CardTitle>
              <CardDescription>{userData.bio || 'Language Enthusiast'}</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1 p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {userStats.level || 1}
                </div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
              <div className="space-y-1 p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userStats.totalXP || 0}
                </div>
                <div className="text-xs text-muted-foreground">Total XP</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1 p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6" />
                  {userStats.streak || 0}
                </div>
                <div className="text-xs text-muted-foreground">Day Streak</div>
              </div>
              <div className="space-y-1 p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userStats.lessonsCompleted || 0}
                </div>
                <div className="text-xs text-muted-foreground">Lessons Done</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1 p-2 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                  {formatTimeSpent(userStats.timeSpent || 0)}
                </div>
                <div className="text-xs text-muted-foreground">Study Time</div>
              </div>
              <div className="space-y-1 p-2 bg-muted/50 rounded-lg">
                <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                  {userStats.averageScore || 0}%
                </div>
                <div className="text-xs text-muted-foreground">Avg Score</div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(userData.joinDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                <span>Learning</span>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant={userData.currentLanguage === 'japanese' ? 'default' : 'outline'}
                    onClick={() => handleLanguageSwitch('japanese')}
                    disabled={switchingLanguage}
                    className="h-6 px-2 text-xs"
                  >
                    Japanese
                  </Button>
                  <Button
                    size="sm"
                    variant={userData.currentLanguage === 'spanish' ? 'default' : 'outline'}
                    onClick={() => handleLanguageSwitch('spanish')}
                    disabled={switchingLanguage}
                    className="h-6 px-2 text-xs"
                  >
                    Spanish
                  </Button>
                </div>
              </div>
              
              {userData.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{userData.location}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input 
                id="displayName" 
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                placeholder="Enter your display name"
                className="font-medium"
              />
              <p className="text-xs text-muted-foreground">This is how your name appears to others</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={userData.email || ''} 
                disabled 
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Where are you from?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell us about your language learning journey..."
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">{formData.bio.length}/500 characters</p>
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ✅ Achievements Section - Shows actual earned achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
            <Badge variant="secondary" className="ml-2">{achievements.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement: any, index: number) => (
                <div key={achievement.id} className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg border border-yellow-200">
                  <div className={`${achievement.color} opacity-80`}>
                    {getAchievementIcon(achievement.icon)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{achievement.name}</h4>
                    <p className="text-sm text-muted-foreground">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No achievements yet</p>
              <p className="text-sm text-muted-foreground">
                Complete lessons and maintain streaks to earn achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
