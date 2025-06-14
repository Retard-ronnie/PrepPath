"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Camera, AlertCircle, Loader2, MapPin, Globe, Phone, Briefcase, GraduationCap, Linkedin, Github, Twitter, ExternalLink } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ProtectedRoute from "@/components/auth/ProtectedRoute"
import { useAuth } from "@/hooks/useAuth"
import { updateUser } from "@/actions/FirebaseUserApi"

export default function EditProfilePage() {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  const USER_NAME = userData?.name || userData?.displayName || ((userData?.firstName || '') + ' ' + (userData?.lastName || '')) || 'User'

  const [currentStep, setCurrentStep] = useState(1)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Info
    name: USER_NAME,
    email: user?.email || userData?.email || "",
    bio: userData?.bio || "Write Something...",
    location: userData?.location || "",
    website: userData?.website || "",
    phone: userData?.phone || "",

    // Professional Info
    title: userData?.title || "",
    company: userData?.company || "",

    // Education (using first education entry if available)
    institution: userData?.education?.[0]?.institution || "",
    degree: userData?.education?.[0]?.degree || "",
    fieldOfStudy: userData?.education?.[0]?.fieldOfStudy || "",
    graduationYear: userData?.education?.[0]?.graduationYear?.toString() || "",

    // Social Profiles
    linkedin: userData?.socialProfiles?.linkedin || "",
    github: userData?.socialProfiles?.github || "",
    twitter: userData?.socialProfiles?.twitter || "",
    portfolio: userData?.socialProfiles?.portfolio || "",
  })

  // Total number of steps in the form
  const TOTAL_STEPS = 3

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Navigate to next step
  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1)
    }
  }

  // Navigate to previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setError("")
    setSuccess(false)

    try {
      // Validate form
      if (!formData.name.trim()) {
        throw new Error("Name is required")
      }

      if (!formData.email?.trim() || !/^\S+@\S+\.\S+$/.test(formData.email || '')) {
        throw new Error("Valid email is required")
      }      // Transform data to match UserType
      const updatedUserData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        location: formData.location.trim() || null,
        website: formData.website.trim() || null,
        phone: formData.phone.trim() || null,
        title: formData.title.trim() || null,
        company: formData.company.trim() || null,
        education: [{
          institution: formData.institution.trim() || null,
          degree: formData.degree.trim() || null,
          fieldOfStudy: formData.fieldOfStudy.trim() || null,
          graduationYear: formData.graduationYear ? parseInt(formData.graduationYear) : null,
        }],
        socialProfiles: {
          linkedin: formData.linkedin.trim() || null,
          github: formData.github.trim() || null,
          twitter: formData.twitter.trim() || null,
          portfolio: formData.portfolio.trim() || null,
        },
      }

      // Remove any undefined values from the object
      const cleanedUserData = removeUndefinedValues(updatedUserData) as Record<string, unknown>

      if (!userData?.uid) {
        setError('UID is needed')
        return
      }

      // This would be an API call in a real application
      const result = await updateUser(userData.uid, cleanedUserData)
      if (!result.success) {
        setError(result.error?.message || 'Unable to save')
        setIsUpdating(false)
        return
      }


      setSuccess(true)
      router.push("/profile")
    } catch (err) {
      console.error("Failed to update profile:", err)
      setError((err as Error).message || "Failed to update profile")
    } finally {
      setIsUpdating(false)
    }
  }

  // Helper function to recursively remove undefined values from the form

  function removeUndefinedValues(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj
        .map((item) => removeUndefinedValues(item))
        .filter((item) => item !== undefined);
    }

    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, removeUndefinedValues(v)])
    );
  }


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container max-w-3xl py-10">
        <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your profile information and personalize your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>Profile updated successfully!</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={userData?.photoURL || userData?.photo} alt={userData?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {USER_NAME.split(' ').reduce((prev, curr) => curr[0] + prev, '')}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                    type="button"
                  >
                    <Camera className="h-4 w-4" />
                    <span className="sr-only">Change avatar</span>
                  </Button>
                </div>
                <Button variant="outline" size="sm" type="button">
                  Upload new picture
                </Button>
              </div>

              <Tabs defaultValue="step1" value={`step${currentStep}`} className="w-full">
                <TabsList className="grid grid-cols-3 mb-6">
                  <TabsTrigger value="step1" onClick={() => setCurrentStep(1)}>Basic Info</TabsTrigger>
                  <TabsTrigger value="step2" onClick={() => setCurrentStep(2)}>Professional</TabsTrigger>
                  <TabsTrigger value="step3" onClick={() => setCurrentStep(3)}>Social</TabsTrigger>
                </TabsList>

                {/* Step 1: Basic Information */}
                <TabsContent value="step1" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        placeholder="Your full name"
                        className="pl-10"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Your email address"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="location"
                          name="location"
                          placeholder="Your location"
                          className="pl-10"
                          value={formData.location}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          placeholder="Your phone number"
                          className="pl-10"
                          value={formData.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="website"
                        name="website"
                        placeholder="please add : https://"
                        className="pl-10"
                        value={formData.website}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Step 2: Professional Information */}
                <TabsContent value="step2" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="title"
                        name="title"
                        placeholder="Your current job title"
                        className="pl-10"
                        value={formData.title}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="company"
                        name="company"
                        placeholder="Your company name"
                        className="pl-10"
                        value={formData.company}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Education</Label>
                    <div className="space-y-4 border rounded-md p-4">
                      <div className="space-y-2">
                        <Label htmlFor="institution">Institution</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="institution"
                            name="institution"
                            placeholder="Educational institution"
                            className="pl-10"
                            value={formData.institution}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="degree">Degree</Label>
                        <Input
                          id="degree"
                          name="degree"
                          placeholder="Your degree"
                          value={formData.degree}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="fieldOfStudy">Field of Study</Label>
                          <Input
                            id="fieldOfStudy"
                            name="fieldOfStudy"
                            placeholder="Your field of study"
                            value={formData.fieldOfStudy}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Graduation Year</Label>
                          <Input
                            id="graduationYear"
                            name="graduationYear"
                            placeholder="Year of graduation"
                            type="number"
                            min="1900"
                            max="2099"
                            value={formData.graduationYear}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Step 3: Social Profiles */}
                <TabsContent value="step3" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="linkedin"
                        name="linkedin"
                        placeholder="Your LinkedIn profile URL"
                        className="pl-10"
                        value={formData.linkedin}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github">GitHub</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="github"
                        name="github"
                        placeholder="Your GitHub profile URL"
                        className="pl-10"
                        value={formData.github}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="twitter"
                        name="twitter"
                        placeholder="Your Twitter profile URL"
                        className="pl-10"
                        value={formData.twitter}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portfolio">Portfolio</Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="portfolio"
                        name="portfolio"
                        placeholder="Your portfolio website URL"
                        className="pl-10"
                        value={formData.portfolio}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Navigation and Submit Buttons */}
              <div className="mt-6 flex justify-between">
                <div>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={isUpdating}
                    >
                      Previous
                    </Button>
                  )}
                </div>

                <div className="flex space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/profile")}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>

                  {currentStep < TOTAL_STEPS ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isUpdating}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? "Saving changes..." : "Save changes"}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
