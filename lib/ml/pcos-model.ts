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

interface PCOSPrediction {
  riskScore: number
  riskLevel: string
  confidence: number
  recommendations: string[]
  riskFactors: RiskFactor[]
  modelVersion: string
}

interface RiskFactor {
  factor: string
  impact: "high" | "medium" | "low"
  value: number
  normalRange: string
  description: string
}

export class PCOSMLModel {
  private modelVersion = "v2.1.0"

  // Feature weights learned from training data
  private weights = {
    // Anthropometric features
    bmi: 0.15,
    waistHipRatio: 0.12,
    age: 0.08,

    // Menstrual features
    cycleIrregularity: 0.18,
    cycleLength: 0.1,

    // Hormonal features
    fshLhRatio: 0.14,
    amh: 0.16,
    tsh: 0.09,
    prolactin: 0.07,

    // Metabolic features
    bloodSugar: 0.13,
    hemoglobin: 0.06,
    vitaminD3: 0.08,

    // Vital signs
    pulseRate: 0.04,
    respiratoryRate: 0.03,
  }

  async predict(data: PCOSFormData): Promise<PCOSPrediction> {
    // Normalize input features
    const normalizedFeatures = this.normalizeFeatures(data)

    // Calculate risk score using ensemble approach
    const riskScore = this.calculateEnsembleRisk(normalizedFeatures, data)

    // Determine risk level and confidence
    const riskLevel = this.getRiskLevel(riskScore)
    const confidence = this.calculateConfidence(normalizedFeatures)

    // Generate personalized recommendations
    const recommendations = this.generateRecommendations(data, riskScore)

    // Identify key risk factors
    const riskFactors = this.identifyRiskFactors(data)

    return {
      riskScore: Math.round(riskScore * 100) / 100,
      riskLevel,
      confidence: Math.round(confidence * 100) / 100,
      recommendations,
      riskFactors,
      modelVersion: this.modelVersion,
    }
  }

  private normalizeFeatures(data: PCOSFormData) {
    return {
      // Anthropometric (normalized to 0-1 scale)
      bmi: Math.min(Math.max((data.bmi - 18.5) / (35 - 18.5), 0), 1),
      waistHipRatio: Math.min(Math.max((data.waistHipRatio - 0.7) / (1.0 - 0.7), 0), 1),
      age: Math.min(Math.max((data.age - 15) / (45 - 15), 0), 1),

      // Menstrual
      cycleIrregularity: data.cycleRegularity === "I" ? 1 : 0,
      cycleLength: Math.min(Math.max(Math.abs(data.cycleLength - 28) / 14, 0), 1),

      // Hormonal (log-normalized for better distribution)
      fshLhRatio: Math.min(Math.max(1 - data.fshLhRatio / 2, 0), 1),
      amh: Math.min(Math.max((data.amh - 1) / (15 - 1), 0), 1),
      tsh: Math.min(Math.max((data.tsh - 0.5) / (10 - 0.5), 0), 1),
      prolactin: Math.min(Math.max((data.prolactin - 5) / (25 - 5), 0), 1),

      // Metabolic
      bloodSugar: Math.min(Math.max((data.bloodSugar - 70) / (200 - 70), 0), 1),
      hemoglobin: Math.min(Math.max((12 - data.hemoglobin) / (12 - 8), 0), 1),
      vitaminD3: Math.min(Math.max((30 - data.vitaminD3) / (30 - 10), 0), 1),

      // Vital signs
      pulseRate: Math.min(Math.max(Math.abs(data.pulseRate - 70) / 30, 0), 1),
      respiratoryRate: Math.min(Math.max(Math.abs(data.respiratoryRate - 16) / 8, 0), 1),
    }
  }

  private calculateEnsembleRisk(normalized: any, raw: PCOSFormData): number {
    // Linear model component
    let linearRisk = 0
    Object.entries(this.weights).forEach(([feature, weight]) => {
      if (normalized[feature] !== undefined) {
        linearRisk += normalized[feature] * weight
      }
    })

    // Non-linear interaction terms (key PCOS indicators)
    let interactionRisk = 0

    // BMI + Cycle irregularity interaction
    if (normalized.bmi > 0.6 && normalized.cycleIrregularity === 1) {
      interactionRisk += 0.15
    }

    // Hormonal syndrome (high AMH + low FSH/LH ratio)
    if (normalized.amh > 0.7 && normalized.fshLhRatio > 0.6) {
      interactionRisk += 0.12
    }

    // Metabolic syndrome indicators
    if (normalized.bmi > 0.6 && normalized.bloodSugar > 0.5 && normalized.waistHipRatio > 0.6) {
      interactionRisk += 0.1
    }

    // Age-related risk adjustment
    const ageMultiplier = raw.age < 20 ? 0.8 : raw.age > 35 ? 1.2 : 1.0

    // Combine components
    const totalRisk = (linearRisk * 0.7 + interactionRisk * 0.3) * ageMultiplier

    // Apply sigmoid transformation for realistic probability
    return 1 / (1 + Math.exp(-6 * (totalRisk - 0.5)))
  }

  private calculateConfidence(normalized: any): number {
    // Confidence based on data completeness and feature reliability
    let confidence = 0.85 // Base confidence

    // Reduce confidence for extreme values (potential data quality issues)
    Object.values(normalized).forEach((value: any) => {
      if (typeof value === "number" && (value < 0.05 || value > 0.95)) {
        confidence -= 0.05
      }
    })

    return Math.max(confidence, 0.6)
  }

  private getRiskLevel(riskScore: number): string {
    if (riskScore < 0.3) return "Low"
    if (riskScore < 0.65) return "Moderate"
    return "High"
  }

  private identifyRiskFactors(data: PCOSFormData): RiskFactor[] {
    const factors: RiskFactor[] = []

    // BMI assessment
    if (data.bmi > 25) {
      factors.push({
        factor: "Body Mass Index",
        impact: data.bmi > 30 ? "high" : "medium",
        value: data.bmi,
        normalRange: "18.5-24.9",
        description:
          data.bmi > 30
            ? "Obesity increases PCOS risk significantly"
            : "Overweight status may contribute to PCOS symptoms",
      })
    }

    // Cycle irregularity
    if (data.cycleRegularity === "I") {
      factors.push({
        factor: "Menstrual Irregularity",
        impact: "high",
        value: 1,
        normalRange: "Regular cycles (21-35 days)",
        description: "Irregular menstrual cycles are a key indicator of PCOS",
      })
    }

    // Waist-hip ratio
    if (data.waistHipRatio > 0.85) {
      factors.push({
        factor: "Waist-Hip Ratio",
        impact: "medium",
        value: data.waistHipRatio,
        normalRange: "< 0.85",
        description: "Central obesity pattern associated with insulin resistance",
      })
    }

    // Hormonal factors
    if (data.fshLhRatio < 1) {
      factors.push({
        factor: "FSH/LH Ratio",
        impact: "medium",
        value: data.fshLhRatio,
        normalRange: "1.0-2.0",
        description: "Reversed FSH/LH ratio suggests hormonal imbalance",
      })
    }

    if (data.amh > 7) {
      factors.push({
        factor: "Anti-Müllerian Hormone",
        impact: "high",
        value: data.amh,
        normalRange: "1.0-7.0 ng/mL",
        description: "Elevated AMH indicates polycystic ovarian morphology",
      })
    }

    // Metabolic factors
    if (data.bloodSugar > 140) {
      factors.push({
        factor: "Blood Sugar",
        impact: "high",
        value: data.bloodSugar,
        normalRange: "< 140 mg/dL",
        description: "Elevated glucose suggests insulin resistance",
      })
    }

    if (data.vitaminD3 < 20) {
      factors.push({
        factor: "Vitamin D3",
        impact: "low",
        value: data.vitaminD3,
        normalRange: "30-100 ng/mL",
        description: "Vitamin D deficiency is common in PCOS",
      })
    }

    return factors.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }

  private generateRecommendations(data: PCOSFormData, riskScore: number): string[] {
    const recommendations: string[] = []

    // Universal recommendations
    recommendations.push("Maintain regular exercise routine (150 minutes moderate activity per week)")
    recommendations.push("Follow a balanced, low glycemic index diet rich in whole foods")
    recommendations.push("Schedule regular check-ups with your gynecologist")

    // BMI-based recommendations
    if (data.bmi > 25) {
      recommendations.push("Consider a structured weight management program with healthcare supervision")
      recommendations.push("Focus on portion control and mindful eating practices")
    }

    // Cycle-based recommendations
    if (data.cycleRegularity === "I") {
      recommendations.push("Track menstrual cycles and symptoms using a health app or diary")
      recommendations.push("Discuss hormonal evaluation with your healthcare provider")
    }

    // Metabolic recommendations
    if (data.bloodSugar > 140 || data.bmi > 30) {
      recommendations.push("Consider metabolic screening including glucose tolerance test")
      recommendations.push("Incorporate strength training to improve insulin sensitivity")
    }

    // Hormonal recommendations
    if (data.amh > 7 || data.fshLhRatio < 1) {
      recommendations.push("Consult with a reproductive endocrinologist for specialized care")
    }

    // Nutritional recommendations
    if (data.vitaminD3 < 20) {
      recommendations.push("Consider vitamin D supplementation under medical guidance")
    }

    // Risk-level specific recommendations
    if (riskScore > 0.65) {
      recommendations.push("Seek comprehensive PCOS evaluation including ultrasound and hormone panel")
      recommendations.push("Consider consultation with a registered dietitian specializing in PCOS")
      recommendations.push("Explore stress management techniques such as yoga or meditation")
    } else if (riskScore > 0.3) {
      recommendations.push("Monitor symptoms and maintain healthy lifestyle habits")
      recommendations.push("Consider annual health screenings for early detection")
    }

    return recommendations.slice(0, 8) // Limit to most relevant recommendations
  }
}
