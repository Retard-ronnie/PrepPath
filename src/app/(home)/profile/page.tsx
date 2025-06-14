"use client"

import { useRouter } from "next/navigation"
import { User, Mail, MapPin, Globe, Phone, Briefcase, GraduationCap, Linkedin, Github, Twitter, ExternalLink, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/hooks/useAuth" 
import ProtectedRoute from "@/components/auth/ProtectedRoute"

export default function ProfilePage() {
  const { user, userData, loading} = useAuth()
  const router = useRouter()
  
  const USER_NAME = userData?.name || userData?.displayName || ((userData?.firstName || '') +' '+ (userData?.lastName || '')) || 'User'
  
  // Get data for displaying in the profile
  const education = userData?.education?.[0]
  const socialProfiles = userData?.socialProfiles || {}

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-4xl py-10">
        <h1 className="text-3xl font-bold mb-8">User Profile</h1>

        <div className="grid grid-cols-1 gap-6">
          {/* User info card */}
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData?.photoURL || userData?.photo} alt={USER_NAME} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {USER_NAME.split(' ').reduce((prev, curr)=> curr[0] + prev, '')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <CardTitle className="text-2xl">{USER_NAME}</CardTitle>
                  <CardDescription className="text-base flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2" />
                    {user?.email}
                  </CardDescription>
                  {userData?.title && (
                    <p className="text-sm font-medium mt-1 flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                      {userData.title} {userData?.company ? `at ${userData.company}` : ''}
                    </p>
                  )}
                  {userData?.location && (
                    <p className="text-sm mt-1 flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                      {userData.location}
                    </p>
                  )}
                </div>
                <div className="ml-auto mt-4 sm:mt-0">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push("/edit-profile")}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="professional">Professional</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                </TabsList>
                
                {/* Basic Information Tab */}
                <TabsContent value="basic">
                  <div className="space-y-6">
                    {userData?.bio && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">About Me</h3>
                        <p className="text-muted-foreground">{userData.bio}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                            <span>{user?.email}</span>
                          </div>
                          
                          {userData?.phone && (
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                              <span>{userData.phone}</span>
                            </div>
                          )}
                          
                          {userData?.website && (
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-3 text-muted-foreground" />
                              <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                                {userData.website}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-2">Account Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-3 text-muted-foreground" />
                            <span>Member since {new Date(userData?.createdAt || Date.now()).toLocaleDateString()}</span>
                          </div>
                          {userData?.lastLogin && (
                            <div className="flex items-center">
                              <span className="ml-7">Last login {new Date(userData.lastLogin).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Professional Information Tab */}
                <TabsContent value="professional">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Professional Information</h3>
                      <div className="space-y-4">
                        {(userData?.title || userData?.company) && (
                          <div className="space-y-1">
                            <h4 className="font-medium">Current Position</h4>
                            <p className="text-muted-foreground">{userData?.title} {userData?.company ? `at ${userData.company}` : ''}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {education && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Education</h3>
                        <Card className="bg-muted/50">
                          <CardContent className="pt-6">
                            <div className="space-y-2">
                              {education.institution && (
                                <h4 className="font-medium flex items-center">
                                  <GraduationCap className="h-4 w-4 mr-2" />
                                  {education.institution}
                                </h4>
                              )}
                              {education.degree && (
                                <p className="text-muted-foreground">
                                  {education.degree}
                                  {education.fieldOfStudy ? ` in ${education.fieldOfStudy}` : ''}
                                  {education.graduationYear ? ` (${education.graduationYear})` : ''}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                {/* Social Profiles Tab */}
                <TabsContent value="social">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium mb-2">Social Profiles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialProfiles.linkedin && (
                        <a 
                          href={socialProfiles.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <Linkedin className="h-5 w-5 mr-3 text-[#0077B5]" />
                          <span>LinkedIn Profile</span>
                        </a>
                      )}
                      
                      {socialProfiles.github && (
                        <a 
                          href={socialProfiles.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <Github className="h-5 w-5 mr-3 text-black dark:text-white" />
                          <span>GitHub Profile</span>
                        </a>
                      )}
                      
                      {socialProfiles.twitter && (
                        <a 
                          href={socialProfiles.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <Twitter className="h-5 w-5 mr-3 text-[#1DA1F2]" />
                          <span>Twitter Profile</span>
                        </a>
                      )}
                      
                      {socialProfiles.portfolio && (
                        <a 
                          href={socialProfiles.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-4 border rounded-lg hover:bg-muted transition-colors"
                        >
                          <ExternalLink className="h-5 w-5 mr-3 text-muted-foreground" />
                          <span>Portfolio</span>
                        </a>
                      )}
                      
                      {!socialProfiles.linkedin && !socialProfiles.github && 
                       !socialProfiles.twitter && !socialProfiles.portfolio && (
                        <div className="col-span-full text-center p-6 border rounded-lg bg-muted/50">
                          <p className="text-muted-foreground">No social profiles added yet.</p>
                          <Button 
                            variant="link" 
                            onClick={() => router.push("/edit-profile")}
                            className="mt-2"
                          >
                            Add your social profiles
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Stats and activity */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Courses Completed</h3>
                    <p className="text-2xl font-bold">{userData?.stats?.completedInterviews || 0}</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
                    <p className="text-2xl font-bold">{userData?.stats?.streakDays || 0} days</p>
                  </div>
                  <div className="bg-muted rounded-lg p-4">
                    <h3 className="text-sm font-medium text-muted-foreground">Total Interviews</h3>
                    <p className="text-2xl font-bold">{userData?.stats?.totalInterviews || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm">View all</Button>
              </CardHeader>
              <CardContent>
                {/* Example activities - in a real app, these would come from user data */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <div className="h-8 w-8 flex items-center justify-center">
                        <span className="text-primary font-medium">1</span>
                      </div>
                    </div>
                    <div>                      <h4 className="font-medium">Completed &quot;Introduction to React&quot;</h4>
                      <p className="text-sm text-muted-foreground">2 days ago</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <div className="h-8 w-8 flex items-center justify-center">
                        <span className="text-primary font-medium">2</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Earned &quot;JavaScript Expert&quot; badge</h4>
                      <p className="text-sm text-muted-foreground">5 days ago</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <div className="h-8 w-8 flex items-center justify-center">
                        <span className="text-primary font-medium">3</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Started &quot;Advanced TypeScript&quot;</h4>
                      <p className="text-sm text-muted-foreground">1 week ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
