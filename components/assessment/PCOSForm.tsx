"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Activity, Loader2 } from "lucide-react"

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
}

interface PCOSFormProps {
  onSubmit: (data: PCOSFormData) => void
  onBack: () => void
  isLoading?: boolean
}

export const PCOSForm = ({ onSubmit, onBack, isLoading = false }: PCOSFormProps) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<PCOSFormData>({
    age: 0,
    weight: 0,
    height: 0,
    bmi: 0,
    waist: 0,
    hip: 0,
    waistHipRatio: 0,
    cycleLength: 0,
    cycleRegularity: "R",
    pulseRate: 0,
    respiratoryRate: 0,
    hemoglobin: 0,
    fsh: 0,
    lh: 0,
    fshLhRatio: 0,
    tsh: 0,
    amh: 0,
    prolactin: 0,
    vitaminD3: 0,
    bloodSugar: 0,
  })

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const updateField = (field: keyof PCOSFormData, value: number | string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "cycleRegularity" ? value : Number(value),
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const handleWeightHeightChange = (field: "weight" | "height", value: string) => {
    const numValue = Number(value)
    updateField(field, value)

    if (field === "weight" || field === "height") {
      const weight = field === "weight" ? numValue : formData.weight
      const height = field === "height" ? numValue : formData.height

      if (weight > 0 && height > 0) {
        const heightInMeters = height / 100
        const bmi = weight / (heightInMeters * heightInMeters)
        setFormData((prev) => ({ ...prev, bmi: Math.round(bmi * 10) / 10 }))
      }
    }
  }

  const handleWaistHipChange = (field: "waist" | "hip", value: string) => {
    const numValue = Number(value)
    updateField(field, value)

    const waist = field === "waist" ? numValue : formData.waist
    const hip = field === "hip" ? numValue : formData.hip

    if (waist > 0 && hip > 0) {
      const ratio = waist / hip
      setFormData((prev) => ({ ...prev, waistHipRatio: Math.round(ratio * 100) / 100 }))
    }
  }

  const handleHormoneChange = (field: "fsh" | "lh", value: string) => {
    const numValue = Number(value)
    updateField(field, value)

    const fsh = field === "fsh" ? numValue : formData.fsh
    const lh = field === "lh" ? numValue : formData.lh

    if (fsh > 0 && lh > 0) {
      const ratio = fsh / lh
      setFormData((prev) => ({ ...prev, fshLhRatio: Math.round(ratio * 100) / 100 }))
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic Information</h2>
        <p className="text-gray-600">Let's start with your basic demographic and physical measurements</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="age">Age (years)</Label>
          <Input
            id="age"
            type="number"
            value={formData.age || ""}
            onChange={(e) => updateField("age", e.target.value)}
            placeholder="Enter your age"
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="weight">Weight (Kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight || ""}
            onChange={(e) => handleWeightHeightChange("weight", e.target.value)}
            placeholder="Enter your weight"
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="height">Height (Cm)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={formData.height || ""}
            onChange={(e) => handleWeightHeightChange("height", e.target.value)}
            placeholder="Enter your height"
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bmi">BMI (Auto-calculated)</Label>
          <Input
            id="bmi"
            type="number"
            step="0.1"
            value={formData.bmi || ""}
            onChange={(e) => updateField("bmi", e.target.value)}
            placeholder="BMI will auto-calculate"
            className="transition-all duration-200 bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waist">Waist (inches)</Label>
          <Input
            id="waist"
            type="number"
            step="0.1"
            value={formData.waist || ""}
            onChange={(e) => handleWaistHipChange("waist", e.target.value)}
            placeholder="Waist measurement"
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hip">Hip (inches)</Label>
          <Input
            id="hip"
            type="number"
            step="0.1"
            value={formData.hip || ""}
            onChange={(e) => handleWaistHipChange("hip", e.target.value)}
            placeholder="Hip measurement"
            className="transition-all duration-200"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Menstrual & Vital Signs</h2>
        <p className="text-gray-600">Information about your menstrual cycle and vital signs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="waistHipRatio">Waist-Hip Ratio (Auto-calculated)</Label>
          <Input
            id="waistHipRatio"
            type="number"
            step="0.01"
            value={formData.waistHipRatio || ""}
            onChange={(e) => updateField("waistHipRatio", e.target.value)}
            placeholder="Will auto-calculate"
            className="transition-all duration-200 bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cycleLength">Cycle Length (days)</Label>
          <Input
            id="cycleLength"
            type="number"
            value={formData.cycleLength || ""}
            onChange={(e) => updateField("cycleLength", e.target.value)}
            placeholder="Average cycle length"
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-3 md:col-span-2">
          <Label>Cycle Regularity</Label>
          <RadioGroup
            value={formData.cycleRegularity}
            onValueChange={(value) => updateField("cycleRegularity", value)}
            className="flex gap-8"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="R" id="regular" />
              <Label htmlFor="regular">Regular (R)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="I" id="irregular" />
              <Label htmlFor="irregular">Irregular (I)</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hormonal Profile</h2>
        <p className="text-gray-600">Key hormonal measurements for PCOS assessment</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fsh">FSH (mIU/mL)</Label>
          <Input
            id="fsh"
            type="number"
            step="0.01"
            value={formData.fsh || ""}
            onChange={(e) => handleHormoneChange("fsh", e.target.value)}
            placeholder="Follicle Stimulating Hormone"
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lh">LH (mIU/mL)</Label>
          <Input
            id="lh"
            type="number"
            step="0.01"
            value={formData.lh || ""}
            onChange={(e) => handleHormoneChange("lh", e.target.value)}
            placeholder="Luteinizing Hormone"
            className="transition-all duration-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fshLhRatio">FSH/LH Ratio (Auto-calculated)</Label>
          <Input
            id="fshLhRatio"
            type="number"
            step="0.01"
            value={formData.fshLhRatio || ""}
            onChange={(e) => updateField("fshLhRatio", e.target.value)}
            placeholder="Will auto-calculate"
            className="transition-all duration-200 bg-gray-50"
          />
        </div>
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Tests</h2>
        <p className="text-gray-600">Final measurements to complete your health profile</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>

      <div className="bg-blue-50 rounded-lg p-6 mt-8 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Assessment Summary
        </h3>
        <p className="text-gray-700 text-sm">
          You've provided comprehensive health information across 20 key parameters. Our advanced AI model will analyze
          this data to provide you with a personalized PCOS risk assessment and evidence-based recommendations for your
          health journey.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="shadow-xl">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">PCOS Health Assessment</CardTitle>
                <CardDescription className="text-blue-100">
                  Step {currentStep} of {totalSteps}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-blue-700"
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-2 bg-blue-500" />
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            <div className="flex justify-between mt-12">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isLoading}
                className="transition-all duration-200 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                  disabled={isLoading}
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Complete Assessment
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
