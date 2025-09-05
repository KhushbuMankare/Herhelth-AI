"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Activity, Calendar, TrendingUp, UserIcon, LogOut, FileText, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, getAuthToken } from "@/lib/auth/auth-context"

interface Assessment {
  id: number
  risk_score: number
  risk_level: string
  confidence: number
  recommendations: string[]
  created_at: string
}

export function DashboardContent() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { user, logout } = useAuth()

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const token = getAuthToken()
        if (!token) return

        const response = await fetch(`${process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"}/assessments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setAssessments(data.assessments || [])
        }
      } catch (error) {
        console.error("Error fetching assessments:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchAssessments()
    }
  }, [user])

  const handleSignOut = async () => {
    logout()
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      case "moderate":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const latestAssessment = assessments[0]

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">PCOS Insight</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <UserIcon className="w-4 h-4" />
                <span>{user?.full_name || user?.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-600 hover:text-gray-900">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.full_name?.split(" ")[0] || "there"}!
          </h2>
          <p className="text-gray-600">Track your PCOS health journey and get personalized insights.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assessments</p>
                  <p className="text-2xl font-bold text-gray-900">{assessments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Latest Risk Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestAssessment?.risk_score ? `${Math.round(latestAssessment.risk_score * 100)}%` : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Risk Level</p>
                  <p className="text-2xl font-bold text-gray-900">{latestAssessment?.risk_level || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Last Assessment</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {latestAssessment ? formatDate(latestAssessment.created_at) : "None"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Start a new assessment or manage your health data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/assessment" className="block">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Assessment
                </Button>
              </Link>
              <Button variant="outline" className="w-full bg-transparent">
                <FileText className="w-4 h-4 mr-2" />
                View All Reports
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <TrendingUp className="w-4 h-4 mr-2" />
                Health Trends
              </Button>
            </CardContent>
          </Card>

          {/* Recent Assessments */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Assessments</CardTitle>
              <CardDescription>Your latest PCOS health evaluations</CardDescription>
            </CardHeader>
            <CardContent>
              {assessments.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments yet</h3>
                  <p className="text-gray-600 mb-4">
                    Start your first PCOS health assessment to get personalized insights.
                  </p>
                  <Link href="/assessment">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Start Assessment
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {assessments.slice(0, 5).map((assessment) => (
                    <div key={assessment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Assessment #{assessment.id}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(assessment.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getRiskBadgeColor(assessment.risk_level)}>{assessment.risk_level} Risk</Badge>
                        <span className="text-lg font-semibold text-gray-900">
                          {Math.round(assessment.risk_score * 100)}%
                        </span>
                        <Button variant="ghost" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {assessments.length > 5 && (
                    <div className="text-center pt-4">
                      <Button variant="outline">View All Assessments ({assessments.length})</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Latest Recommendations */}
        {latestAssessment?.recommendations && latestAssessment.recommendations.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Latest Recommendations</CardTitle>
              <CardDescription>Based on your most recent assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestAssessment.recommendations.slice(0, 6).map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
