import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Activity } from "lucide-react";

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

interface PCOSFormProps {
  onSubmit: (data: PCOSFormData) => void;
  onBack: () => void;
}

export const PCOSForm = ({ onSubmit, onBack }: PCOSFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
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
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateField = (field: keyof PCOSFormData, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'cycleRegularity' ? value : Number(value)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Basic Information</h2>
        <p className="text-muted-foreground">Let's start with your basic demographic and physical measurements</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="age">Age (years)</Label>
          <Input
            id="age"
            type="number"
            value={formData.age || ""}
            onChange={(e) => updateField('age', e.target.value)}
            placeholder="Enter your age"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (Kg)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            value={formData.weight || ""}
            onChange={(e) => updateField('weight', e.target.value)}
            placeholder="Enter your weight"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="height">Height (Cm)</Label>
          <Input
            id="height"
            type="number"
            step="0.1"
            value={formData.height || ""}
            onChange={(e) => updateField('height', e.target.value)}
            placeholder="Enter your height"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bmi">BMI</Label>
          <Input
            id="bmi"
            type="number"
            step="0.1"
            value={formData.bmi || ""}
            onChange={(e) => updateField('bmi', e.target.value)}
            placeholder="Enter your BMI"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="waist">Waist (inches)</Label>
          <Input
            id="waist"
            type="number"
            step="0.1"
            value={formData.waist || ""}
            onChange={(e) => updateField('waist', e.target.value)}
            placeholder="Waist measurement"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hip">Hip (inches)</Label>
          <Input
            id="hip"
            type="number"
            step="0.1"
            value={formData.hip || ""}
            onChange={(e) => updateField('hip', e.target.value)}
            placeholder="Hip measurement"
            className="transition-smooth"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Menstrual & Vital Signs</h2>
        <p className="text-muted-foreground">Information about your menstrual cycle and vital signs</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="waistHipRatio">Waist-Hip Ratio</Label>
          <Input
            id="waistHipRatio"
            type="number"
            step="0.01"
            value={formData.waistHipRatio || ""}
            onChange={(e) => updateField('waistHipRatio', e.target.value)}
            placeholder="0.00"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="cycleLength">Cycle Length (days)</Label>
          <Input
            id="cycleLength"
            type="number"
            value={formData.cycleLength || ""}
            onChange={(e) => updateField('cycleLength', e.target.value)}
            placeholder="Average cycle length"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-3 md:col-span-2">
          <Label>Cycle Regularity</Label>
          <RadioGroup 
            value={formData.cycleRegularity} 
            onValueChange={(value) => updateField('cycleRegularity', value)}
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
        
        <div className="space-y-2">
          <Label htmlFor="pulseRate">Pulse Rate (bpm)</Label>
          <Input
            id="pulseRate"
            type="number"
            value={formData.pulseRate || ""}
            onChange={(e) => updateField('pulseRate', e.target.value)}
            placeholder="Heart rate"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="respiratoryRate">Respiratory Rate (breaths/min)</Label>
          <Input
            id="respiratoryRate"
            type="number"
            value={formData.respiratoryRate || ""}
            onChange={(e) => updateField('respiratoryRate', e.target.value)}
            placeholder="Breathing rate"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="hemoglobin">Hemoglobin (g/dl)</Label>
          <Input
            id="hemoglobin"
            type="number"
            step="0.1"
            value={formData.hemoglobin || ""}
            onChange={(e) => updateField('hemoglobin', e.target.value)}
            placeholder="Hb level"
            className="transition-smooth"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Hormonal Profile</h2>
        <p className="text-muted-foreground">Key hormonal measurements for PCOS assessment</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fsh">FSH (mIU/mL)</Label>
          <Input
            id="fsh"
            type="number"
            step="0.01"
            value={formData.fsh || ""}
            onChange={(e) => updateField('fsh', e.target.value)}
            placeholder="Follicle Stimulating Hormone"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lh">LH (mIU/mL)</Label>
          <Input
            id="lh"
            type="number"
            step="0.01"
            value={formData.lh || ""}
            onChange={(e) => updateField('lh', e.target.value)}
            placeholder="Luteinizing Hormone"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fshLhRatio">FSH/LH Ratio</Label>
          <Input
            id="fshLhRatio"
            type="number"
            step="0.01"
            value={formData.fshLhRatio || ""}
            onChange={(e) => updateField('fshLhRatio', e.target.value)}
            placeholder="FSH to LH ratio"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tsh">TSH (mIU/L)</Label>
          <Input
            id="tsh"
            type="number"
            step="0.01"
            value={formData.tsh || ""}
            onChange={(e) => updateField('tsh', e.target.value)}
            placeholder="Thyroid Stimulating Hormone"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="amh">AMH (ng/mL)</Label>
          <Input
            id="amh"
            type="number"
            step="0.01"
            value={formData.amh || ""}
            onChange={(e) => updateField('amh', e.target.value)}
            placeholder="Anti-Müllerian Hormone"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="prolactin">Prolactin (ng/mL)</Label>
          <Input
            id="prolactin"
            type="number"
            step="0.01"
            value={formData.prolactin || ""}
            onChange={(e) => updateField('prolactin', e.target.value)}
            placeholder="Prolactin level"
            className="transition-smooth"
          />
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Additional Tests</h2>
        <p className="text-muted-foreground">Final measurements to complete your health profile</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="vitaminD3">Vitamin D3 (ng/mL)</Label>
          <Input
            id="vitaminD3"
            type="number"
            step="0.1"
            value={formData.vitaminD3 || ""}
            onChange={(e) => updateField('vitaminD3', e.target.value)}
            placeholder="Vitamin D level"
            className="transition-smooth"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bloodSugar">Random Blood Sugar (mg/dl)</Label>
          <Input
            id="bloodSugar"
            type="number"
            value={formData.bloodSugar || ""}
            onChange={(e) => updateField('bloodSugar', e.target.value)}
            placeholder="RBS level"
            className="transition-smooth"
          />
        </div>
      </div>
      
      <div className="bg-muted/50 rounded-lg p-6 mt-8">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Assessment Summary
        </h3>
        <p className="text-muted-foreground text-sm">
          You've provided comprehensive health information across 20 key parameters. 
          Our AI model will analyze this data to provide you with a personalized PCOS risk assessment 
          and recommendations for your health journey.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="shadow-card">
          <CardHeader className="bg-gradient-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">PCOS Health Assessment</CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Step {currentStep} of {totalSteps}
                </CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={onBack} className="text-primary-foreground hover:bg-primary-foreground/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-2" />
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
                disabled={currentStep === 1}
                className="transition-smooth"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button onClick={nextStep} className="bg-primary hover:bg-primary/90 transition-smooth shadow-primary">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-glow">
                  Complete Assessment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
