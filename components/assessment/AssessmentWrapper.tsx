"use client"

import { useState } from "react"
import { PCOSForm } from "@/components/assessment/PCOSForm"
import { ResultsDashboard } from "@/components/assessment/ResultsDashboard"
import { useRouter } from "next/navigation"
import { useAuth, getAuthToken } from "@/lib/auth/auth-context"

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
    riskFactors: string[]
    modelVersion: string
  }
}

export function AssessmentWrapper() {
  const [currentView, setCurrentView] = useState<"form" | "results">("form")
  const [formData, setFormData] = useState<PCOSFormData | null>(null)
  const [assessmentId, setAssessmentId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  const handleFormSubmit = async (data: PCOSFormData) => {
    setIsLoading(true)
    try {
      const token = getAuthToken()
      const response = await fetch("/api/predict-pcos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to get prediction from ML model")
      }

      const prediction = await response.json()

      const assessmentResponse = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL || "http://localhost:8000"}/assessments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            age: data.age,
            weight: data.weight,
            height: data.height,
            bmi: data.bmi,
            blood_group: "O+", // Default value
            pulse_rate: data.pulseRate,
            rr: data.respiratoryRate,
            hb: data.hemoglobin,
            cycle: data.cycleRegularity === "R" ? "Regular" : "Irregular",
            cycle_length: data.cycleLength,
            marriage_status: "Unmarried", // Default value
            pregnant: "No", // Default value
            no_of_abortions: 0,
            i_beta_hcg_1: 0,
            i_beta_hcg_2: 0,
            fsh: data.fsh,
            lh: data.lh,
            fsh_lh: data.fshLhRatio,
            hip: data.hip,
            waist: data.waist,
            waist_hip_ratio: data.waistHipRatio,
            tsh: data.tsh,
            amh: data.amh,
            prl: data.prolactin,
            vit_d3: data.vitaminD3,
            prg: 0,
            rbs: data.bloodSugar,
            weight_gain: "No",
            hair_growth: "No",
            skin_darkening: "No",
            hair_loss: "No",
            pimples: "No",
            fast_food: "No",
            reg_exercise: "Yes",
            bp_systolic: 120,
            bp_diastolic: 80,
            follicle_no_l: 0,
            follicle_no_r: 0,
            avg_f_size_l: 0,
            avg_f_size_r: 0,
            endometrium: 0,
          }),
        },
      )

      if (assessmentResponse.ok) {
        const assessment = await assessmentResponse.json()
        setAssessmentId(assessment.id)
      }

      setFormData({ ...data, mlPrediction: prediction })
      setCurrentView("results")
    } catch (error) {
      console.error("Error during assessment:", error)
      // Fallback to basic calculation if ML model fails
      const fallbackRisk = calculateFallbackRisk(data)
      setFormData({ ...data, mlPrediction: fallbackRisk })
      setCurrentView("results")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateFallbackRisk = (data: PCOSFormData) => {
    let risk = 0

    if (data.bmi > 30) risk += 0.15
    else if (data.bmi > 25) risk += 0.1

    if (data.cycleRegularity === "I") risk += 0.2
    if (data.waistHipRatio > 0.85) risk += 0.15
    if (data.fshLhRatio < 1) risk += 0.1
    if (data.amh > 7) risk += 0.15

    const riskScore = Math.min(risk + Math.random() * 0.1, 0.85)

    return {
      riskScore,
      riskLevel: riskScore < 0.3 ? "Low" : riskScore < 0.65 ? "Moderate" : "High",
      confidence: 0.75,
      recommendations: ["Maintain regular exercise routine", "Follow a balanced diet", "Schedule regular check-ups"],
      riskFactors: [],
      modelVersion: "fallback",
    }
  }

  const handleBackToForm = () => {
    setCurrentView("form")
  }

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  if (currentView === "results" && formData) {
    return (
      <ResultsDashboard
        formData={formData}
        onBack={handleBackToForm}
        onBackToDashboard={handleBackToDashboard}
        isLoading={isLoading}
      />
    )
  }

  return <PCOSForm onSubmit={handleFormSubmit} onBack={handleBackToDashboard} isLoading={isLoading} />
}
