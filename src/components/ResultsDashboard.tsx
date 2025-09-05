import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Heart, 
  Activity, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Info
} from "lucide-react";

interface PCOSFormData {
  age: number;
  weight: number;
  height: number;
  bmi: number;
  waist: number;
  hip: number;
  waistHipRatio: number;
  cycleLength: number;
  cycleRegularity: string;
  pulseRate: number;
  respiratoryRate: number;
  hemoglobin: number;
  fsh: number;
  lh: number;
  fshLhRatio: number;
  tsh: number;
  amh: number;
  prolactin: number;
  vitaminD3: number;
  bloodSugar: number;
}

interface ResultsDashboardProps {
  formData: PCOSFormData;
  onBack: () => void;
}

export const ResultsDashboard = ({ formData, onBack }: ResultsDashboardProps) => {
  // Mock risk calculation for demo - in real app this would call your ML model
  const calculateRiskScore = (data: PCOSFormData) => {
    let risk = 0;
    
    // BMI factor
    if (data.bmi > 30) risk += 15;
    else if (data.bmi > 25) risk += 10;
    
    // Cycle irregularity
    if (data.cycleRegularity === 'I') risk += 20;
    
    // Waist-hip ratio
    if (data.waistHipRatio > 0.85) risk += 15;
    
    // Hormonal factors
    if (data.fshLhRatio < 1) risk += 10;
    if (data.amh > 7) risk += 15;
    
    // Random component for demo
    risk += Math.floor(Math.random() * 20);
    
    return Math.min(risk, 85); // Cap at 85%
  };

  const riskScore = calculateRiskScore(formData);
  
  const getRiskLevel = (score: number) => {
    if (score < 30) return { level: "Low", color: "success", description: "Low risk indicators" };
    if (score < 60) return { level: "Moderate", color: "warning", description: "Some risk factors present" };
    return { level: "High", color: "destructive", description: "Multiple risk factors identified" };
  };

  const risk = getRiskLevel(riskScore);

  const healthMetrics = [
    {
      category: "Cycle Regularity",
      value: formData.cycleRegularity === 'R' ? 'Normal' : 'Irregular',
      status: formData.cycleRegularity === 'R' ? 'success' : 'warning',
      icon: Heart
    },
    {
      category: "BMI Status",
      value: formData.bmi < 25 ? 'Normal' : formData.bmi < 30 ? 'Overweight' : 'Obese',
      status: formData.bmi < 25 ? 'success' : formData.bmi < 30 ? 'warning' : 'destructive',
      icon: Activity
    },
    {
      category: "Hormonal Balance",
      value: formData.fshLhRatio > 1 ? 'Normal' : 'Monitor',
      status: formData.fshLhRatio > 1 ? 'success' : 'warning',
      icon: TrendingUp
    },
    {
      category: "Insulin Levels",
      value: formData.bloodSugar < 140 ? 'Normal' : 'Elevated',
      status: formData.bloodSugar < 140 ? 'success' : 'warning',
      icon: AlertCircle
    }
  ];

  const recommendations = [
    {
      title: "Lifestyle Modifications",
      items: [
        "Maintain regular exercise routine (150 minutes/week)",
        "Follow a balanced, low glycemic index diet",
        "Maintain healthy sleep schedule (7-9 hours)",
        "Manage stress through mindfulness or yoga"
      ]
    },
    {
      title: "Medical Follow-up",
      items: [
        "Schedule regular check-ups with your gynecologist",
        "Monitor hormonal levels every 3-6 months",
        "Consider metabolic screening if BMI is elevated",
        "Discuss family planning goals with your doctor"
      ]
    },
    {
      title: "Nutritional Support",
      items: [
        "Consider omega-3 fatty acid supplements",
        "Ensure adequate vitamin D levels",
        "Include anti-inflammatory foods in diet",
        "Limit processed foods and refined sugars"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Your PCOS Risk Assessment</h1>
            <p className="text-muted-foreground mt-2">
              Based on your health profile and AI analysis
            </p>
          </div>
          <Button variant="outline" onClick={onBack} className="transition-smooth">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Score Card */}
          <Card className="lg:col-span-1 shadow-card">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Your Risk Score</CardTitle>
              <CardDescription>AI-powered assessment based on 20 health parameters</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-6">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="stroke-muted"
                    strokeDasharray="100, 100"
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`${
                      risk.color === 'success' ? 'stroke-success' : 
                      risk.color === 'warning' ? 'stroke-warning' : 'stroke-destructive'
                    }`}
                    strokeDasharray={`${riskScore}, 100`}
                    strokeWidth="3"
                    fill="transparent"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-foreground">{riskScore}%</span>
                </div>
              </div>
              
              <Badge 
                variant={risk.color === 'success' ? 'default' : 'secondary'} 
                className={`text-sm px-4 py-2 ${
                  risk.color === 'success' ? 'bg-success text-success-foreground' :
                  risk.color === 'warning' ? 'bg-warning text-warning-foreground' :
                  'bg-destructive text-destructive-foreground'
                }`}
              >
                {risk.level} Risk
              </Badge>
              <p className="text-muted-foreground mt-2 text-sm">{risk.description}</p>
            </CardContent>
          </Card>

          {/* Health Metrics */}
          <Card className="lg:col-span-2 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Health Metrics Overview
              </CardTitle>
              <CardDescription>Key indicators from your assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {healthMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <metric.icon className={`w-5 h-5 ${
                        metric.status === 'success' ? 'text-success' :
                        metric.status === 'warning' ? 'text-warning' : 'text-destructive'
                      }`} />
                      <span className="font-medium text-foreground">{metric.category}</span>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`${
                        metric.status === 'success' ? 'border-success text-success' :
                        metric.status === 'warning' ? 'border-warning text-warning' :
                        'border-destructive text-destructive'
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
          {recommendations.map((section, index) => (
            <Card key={index} className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {index === 0 && <Heart className="w-5 h-5 text-primary" />}
                  {index === 1 && <CheckCircle className="w-5 h-5 text-primary" />}
                  {index === 2 && <Info className="w-5 h-5 text-primary" />}
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
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
          <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-primary transition-smooth">
            Schedule Consultation
          </Button>
          <Button variant="outline" size="lg" className="transition-smooth">
            Download Report
          </Button>
          <Button variant="outline" size="lg" className="transition-smooth">
            Share with Doctor
          </Button>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border-l-4 border-primary">
          <p className="text-sm text-muted-foreground">
            <strong>Medical Disclaimer:</strong> This assessment is for informational purposes only and should not replace professional medical advice. 
            Please consult with a qualified healthcare provider for proper diagnosis and treatment recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};
