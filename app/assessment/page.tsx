"use client"

import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { AssessmentWrapper } from "@/components/assessment/AssessmentWrapper"

export default function AssessmentPage() {
  return (
    <ProtectedRoute>
      <AssessmentWrapper />
    </ProtectedRoute>
  )
}
