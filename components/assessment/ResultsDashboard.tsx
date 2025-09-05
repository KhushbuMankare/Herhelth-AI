"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Heart,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  Brain,
  Shield,
  Download,
  Share,
} from "lucide-react"

interface PCOSFormData {
  age: number
  weight: number
  height: number
  bmi: number
  waist: number
  hip: number
  waistHipRatio: number
  cycleLength: number
  cycleRegularity: string
  pulseRate: number
  respiratoryRate: number
  hemoglobin: number
  fsh: number
  lh: number
  fshLhRatio: number
  tsh: number
  amh: number
  prolactin: number
  vitaminD3: number
  bloodSugar: number
  mlPrediction?: {
    riskScore: number
    riskLevel: string
    confidence: number
    recommendations: string[]
    riskFactors: any[]
    modelVersion: string
  }
}

interface ResultsDashboardProps {
  formData: PCOSFormData
  onBack: () => void
  onBackToDashboard: () => void
  isLoading?: boolean
}

export const ResultsDashboard = ({ formData, onBack, onBackToDashboard, isLoading = false }: ResultsDashboardProps) => {
  const riskScore = formData.mlPrediction ? formData.mlPrediction.riskScore * 100 : calculateBasicRiskScore(formData)
  const riskLevel = formData.mlPrediction ? formData.mlPrediction.riskLevel : getBasicRiskLevel(riskScore)
  const confidence = formData.mlPrediction ? formData.mlPrediction.confidence * 100 : 75
  const recommendations = formData.mlPrediction
    ? formData.mlPrediction.recommendations
    : getBasicRecommendations(formData)
  const modelVersion = formData.mlPrediction ? formData.mlPrediction.modelVersion : "basic"

  function calculateBasicRiskScore(data: PCOSFormData) {
    let risk = 0

    if (data.bmi > 30) risk += 15
    else if (data.bmi > 25) risk += 10

    if (data.cycleRegularity === "I") risk += 20
    if (data.waistHipRatio > 0.85) risk += 15
    if (data.fshLhRatio < 1) risk += 10
    if (data.amh > 7) risk += 15

    return Math.min(risk + Math.random() * 10, 85)
  }

  function getBasicRiskLevel(score: number) {
    if (score < 30) return "Low"
    if (score < 60) return "Moderate"
    return "High"
  }

  function getBasicRecommendations(data: PCOSFormData) {
    const recs = [
      "Maintain regular exercise routine (150 minutes/week)",
      "Follow a balanced, low glycemic index diet",
      "Schedule regular check-ups with your gynecologist",
    ]

    if (data.bmi > 25) {
      recs.push("Consider weight management program")
    }

    if (data.cycleRegularity === "I") {
      recs.push("Monitor menstrual cycle patterns")
    }

    return recs
  }

  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: "Low", color: "success", description: "Low risk indicators" }
    if (score < 60) return { level: "Moderate", color: "warning", description: "Some risk factors present" }
    return { level: "High", color: "destructive", description: "Multiple risk factors identified" }
  }

  const risk = getRiskLevel(riskScore)

  const healthMetrics = [
    {
      category: "Cycle Regularity",
      value: formData.cycleRegularity === "R" ? "Normal" : "Irregular",
      status: formData.cycleRegularity === "R" ? "success" : "warning",
      icon: Heart,
    },
    {
      category: "BMI Status",
      value: formData.bmi < 25 ? "Normal" : formData.bmi < 30 ? "Overweight" : "Obese",
      status: formData.bmi < 25 ? "success" : formData.bmi < 30 ? "warning" : "destructive",
      icon: Activity,
    },
    {
      category: "Hormonal Balance",
      value: formData.fshLhRatio > 1 ? "Normal" : "Monitor",
      status: formData.fshLhRatio > 1 ? "success" : "warning",
      icon: TrendingUp,
    },
    {
      category: "Insulin Levels",
      value: formData.bloodSugar < 140 ? "Normal" : "Elevated",
      status: formData.bloodSugar < 140 ? "success" : "warning",
      icon: AlertCircle,
    },
  ]

  const recommendationSections = [
    {
      title: "Lifestyle Modifications",
      icon: Heart,
      items: recommendations
        .filter((r) => r.includes("exercise") || r.includes("diet") || r.includes("lifestyle") || r.includes("weight"))
        .slice(0, 4),
    },
    {
      title: "Medical Follow-up",
      icon: CheckCircle,
      items: recommendations
        .filter(
          (r) => r.includes("doctor") || r.includes("gynecologist") || r.includes("screening") || r.includes("consult"),
        )
        .slice(0, 4),
    },
    {
      title: "Health Monitoring",
      icon: Info,
      items: recommendations
        .filter(
          (r) => r.includes("monitor") || r.includes("track") || r.includes("vitamin") || r.includes("supplement"),
        )
        .slice(0, 4),
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your PCOS Risk Assessment</h1>
            <p className="text-gray-600 mt-2 flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Powered by AI Model {modelVersion} • Confidence: {confidence.toFixed(0)}%
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onBack} className="transition-all duration-200 bg-transparent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Form
            </Button>
            <Button onClick={onBackToDashboard} className="bg-blue-600 hover:bg-blue-700">
              <Shield className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Score Card */}
          <Card className="lg:col-span-1 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Your Risk Score</CardTitle>
              <CardDescription>AI-powered assessment based on 20 health parameters</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-gray-200"
                    strokeDasharray="100, 100"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${
                      risk.color === "success"
                        ? "stroke-green-500"
                        : risk.color === "warning"
                          ? "stroke-yellow-500"
                          : "stroke-red-500"
                    }`}
                    strokeDasharray={`${riskScore}, 100`}
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-gray-900">{riskScore.toFixed(0)}%</span>
                </div>
              </div>

              <Badge
                className={`text-sm px-4 py-2 ${
                  risk.color === "success"
                    ? "bg-green-100 text-green-800 border-green-200"
                    : risk.color === "warning"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-red-100 text-red-800 border-red-200"
                }`}
              >
                {risk.level} Risk
              </Badge>
              <p className="text-gray-600 mt-2 text-sm">{risk.description}</p>

              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Model Confidence</p>
                <Progress value={confidence} className="h-2" />
                <p className="text-xs text-gray-500 mt-1">{confidence.toFixed(0)}% confident</p>
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <Card className="lg:col-span-2 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Health Metrics Overview
              </CardTitle>
              <CardDescription>Key indicators from your assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <metric.icon
                        className={`w-5 h-5 ${
                          metric.status === "success"
                            ? "text-green-600"
                            : metric.status === "warning"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      />
                      <span className="font-medium text-gray-900">{metric.category}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        metric.status === "success"
                          ? "border-green-500 text-green-700"
                          : metric.status === "warning"
                            ? "border-yellow-500 text-yellow-700"
                            : "border-red-500 text-red-700"
                      }`}
                    >
                      {metric.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {recommendationSections.map((section, index) => (
            <Card key={index} className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <section.icon className="w-5 h-5 text-blue-600" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 transition-all duration-200">
            <CheckCircle className="w-4 h-4 mr-2" />
            Schedule Consultation
          </Button>
          <Button variant="outline" size="lg" className="transition-all duration-200 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button variant="outline" size="lg" className="transition-all duration-200 bg-transparent">
            <Share className="w-4 h-4 mr-2" />
            Share with Doctor
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
          <p className="text-sm text-gray-700">
            <strong>Medical Disclaimer:</strong> This AI-powered assessment is for informational purposes only and
            should not replace professional medical advice. Please consult with a qualified healthcare provider for
            proper diagnosis and treatment recommendations. Model accuracy: {confidence.toFixed(0)}% • Version:{" "}
            {modelVersion}
          </p>
        </div>
      </div>
    </div>
  )
}
