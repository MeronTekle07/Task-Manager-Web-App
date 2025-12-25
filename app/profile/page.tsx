"use client"

import type React from "react"

import { useState } from "react"
import { ProtectedLayout } from "@/components/layout/protected-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Lock } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Profile form
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEditingProfile(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Update user in localStorage
    const updatedUser = { ...user, name, email }
    localStorage.setItem("user", JSON.stringify(updatedUser))

    setIsEditingProfile(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Weak password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setIsChangingPassword(false)

    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    })
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6 p-6 lg:p-8">
        <div className="space-y-1">
          <h1 className="text-balance text-3xl font-semibold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <CardDescription>Update your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isEditingProfile}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input
                      id="profile-email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isEditingProfile}
                    />
                  </div>
                  <Button type="submit" disabled={isEditingProfile}>
                    {isEditingProfile ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Change Password
                </CardTitle>
                <CardDescription>Update your password to keep your account secure</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isChangingPassword}
                    />
                  </div>
                  <Button type="submit" disabled={isChangingPassword}>
                    {isChangingPassword ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Account Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-muted-foreground">Name</p>
                      <p className="truncate font-medium">{user?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="truncate font-medium">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
