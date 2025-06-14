"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import { registerSchema } from "@/schemas/userSchema"
import { signUp } from "@/actions/FirebaseUserApi"

export default function SignupPage() {
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, message: "" }

    const hasLower = /[a-z]/.test(password)
    const hasUpper = /[A-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)
    const isLongEnough = password.length >= 8

    const criteriaCount = [hasLower, hasUpper, hasNumber, hasSpecial, isLongEnough].filter(Boolean).length

    if (criteriaCount <= 2) return { strength: 1, message: "Weak" }
    if (criteriaCount <= 4) return { strength: 2, message: "Good" }
    return { strength: 3, message: "Strong" }
  }

  const passwordStrength = getPasswordStrength(formData.password)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!acceptTerms) {
      setError("You must accept the terms and conditions to continue")
      setLoading(false)
      return
    }

    if (passwordStrength.strength < 2) {
      setError("Please use a stronger password")
      setLoading(false)
      return
    }

    const result = registerSchema.safeParse(formData)
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Validation failed")
      setLoading(false)
      return
    }    const response = await signUp(
      result.data.name,
      result.data.email,
      result.data.password
    )

    if (response.success) {
      // Success handled by authentication hook redirect
    } else {
      setError(response.error?.message || 'Try Again Later')
    }

    setLoading(false)
  }

  return (
    <div className="container flex h-screen w-full items-center justify-center">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Enter your details to create a new account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
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
                  placeholder="example@email.com"
                  className="pl-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <Label htmlFor="password">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all ${passwordStrength.strength === 1
                          ? "w-1/3 bg-destructive"
                          : passwordStrength.strength === 2
                            ? "w-2/3 bg-yellow-500"
                            : "w-full bg-green-500"
                          }`}
                      />
                    </div>
                    <span className="text-xs">{passwordStrength.message}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Check className={`h-3 w-3 ${formData.password.length >= 8 ? "text-green-500" : "text-muted"}`} />
                      <span>8+ characters</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className={`h-3 w-3 ${/[A-Z]/.test(formData.password) ? "text-green-500" : "text-muted"}`} />
                      <span>Uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className={`h-3 w-3 ${/[a-z]/.test(formData.password) ? "text-green-500" : "text-muted"}`} />
                      <span>Lowercase letter</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className={`h-3 w-3 ${/\d/.test(formData.password) ? "text-green-500" : "text-muted"}`} />
                      <span>Number</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Check className={`h-3 w-3 ${(formData.password === formData.confirmPassword) ? "text-green-500" : "text-muted"}`} />
                      <span>Password Match</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  terms and conditions
                </Link>
              </label>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" disabled={loading}>
              Google
            </Button>
            <Button variant="outline" disabled={loading}>
              GitHub
            </Button>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
