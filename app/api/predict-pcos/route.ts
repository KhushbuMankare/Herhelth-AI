import { type NextRequest, NextResponse } from "next/server"
import { PCOSMLModel } from "@/lib/ml/pcos-model"
import { callFastAPI } from "@/lib/config/api"
import { verify } from "jsonwebtoken"

function verifyAuthToken(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return false
  }

  try {
    const token = authHeader.substring(7)
    // Note: In production, you should use the same SECRET_KEY as your FastAPI backend
    const secret = process.env.SECRET_KEY || "your-secret-key-change-in-production"
    verify(token, secret)
    return true
  } catch (error) {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!verifyAuthToken(authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.json()

    const requiredFields = [
      "age",
      "weight",
      "height",
      "bmi",
      "blood_group",
      "pulse_rate",
      "rr",
      "hb",
      "cycle",
      "cycle_length",
      "marriage_status",
      "pregnant",
      "no_of_abortions",
      "i_beta_hcg_1",
      "i_beta_hcg_2",
      "fsh",
      "lh",
      "fsh_lh",
      "hip",
      "waist",
      "waist_hip_ratio",
      "tsh",
      "amh",
      "prl",
      "vit_d3",
      "prg",
      "rbs",
      "weight_gain",
      "hair_growth",
      "skin_darkening",
      "hair_loss",
      "pimples",
      "fast_food",
      "reg_exercise",
      "bp_systolic",
      "bp_diastolic",
      "follicle_no_l",
      "follicle_no_r",
      "avg_f_size_l",
      "avg_f_size_r",
      "endometrium",
    ]

    for (const field of requiredFields) {
      if (formData[field] === undefined || formData[field] === null) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    let prediction

    try {
      console.log("[v0] Calling FastAPI service for prediction")
      prediction = await callFastAPI("/assessments", formData, authHeader)
      console.log("[v0] FastAPI prediction successful:", prediction)

      return NextResponse.json({
        riskScore: prediction.risk_score,
        riskLevel: prediction.risk_level,
        confidence: prediction.confidence,
        recommendations: prediction.recommendations,
        featureImportance: prediction.feature_importance,
        modelVersion: "FastAPI-v1.0.0",
        source: "fastapi",
      })
    } catch (fastApiError) {
      console.error("[v0] FastAPI service failed, falling back to local model:", fastApiError)

      // Transform data format for local model compatibility
      const localModelData = {
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        bmi: formData.bmi,
        waist: formData.waist,
        hip: formData.hip,
        waistHipRatio: formData.waist_hip_ratio,
        cycleLength: formData.cycle_length,
        cycleRegularity: formData.cycle === "Regular" ? "R" : "I",
        pulseRate: formData.pulse_rate,
        respiratoryRate: formData.rr,
        hemoglobin: formData.hb,
        fsh: formData.fsh,
        lh: formData.lh,
        fshLhRatio: formData.fsh_lh,
        tsh: formData.tsh,
        amh: formData.amh,
        prolactin: formData.prl,
        vitaminD3: formData.vit_d3,
        bloodSugar: formData.rbs,
      }

      const model = new PCOSMLModel()
      prediction = await model.predict(localModelData)

      console.log("[v0] Local model prediction successful:", prediction)

      return NextResponse.json({
        riskScore: prediction.riskScore,
        riskLevel: prediction.riskLevel,
        confidence: prediction.confidence,
        recommendations: prediction.recommendations,
        riskFactors: prediction.riskFactors,
        modelVersion: prediction.modelVersion,
        source: "local-fallback",
      })
    }
  } catch (error) {
    console.error("[v0] PCOS prediction error:", error)
    return NextResponse.json(
      {
        error: "Internal server error during prediction",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
