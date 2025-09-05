import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PCOSForm } from "@/components/PCOSForm";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { 
  Heart, 
  Activity, 
  ChevronRight, 
  Shield, 
  Clock, 
  Users,
  Sparkles,
  TrendingUp
} from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

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

type AppView = 'home' | 'form' | 'results';

const Index = () => {
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [formData, setFormData] = useState<PCOSFormData | null>(null);

  const handleStartAssessment = () => {
    setCurrentView('form');
  };

  const handleFormSubmit = (data: PCOSFormData) => {
    setFormData(data);
    setCurrentView('results');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setFormData(null);
  };

  const handleBackToForm = () => {
    setCurrentView('form');
  };

  if (currentView === 'form') {
    return <PCOSForm onSubmit={handleFormSubmit} onBack={handleBackToHome} />;
  }

  if (currentView === 'results' && formData) {
    return <ResultsDashboard formData={formData} onBack={handleBackToForm} />;
  }

  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze 20+ health parameters for accurate risk assessment",
      color: "health-primary"
    },
    {
      icon: Clock,
      title: "Quick Results",
      description: "Get your personalized risk assessment in minutes, not months of waiting for appointments",
      color: "health-secondary"
    },
    {
      icon: Shield,
      title: "Evidence-Based",
      description: "Based on latest medical research and validated clinical guidelines for PCOS detection",
      color: "success"
    },
    {
      icon: Users,
      title: "Trusted by Thousands",
      description: "Join thousands of women who have taken control of their reproductive health",
      color: "warning"
    }
  ];

  const stats = [
    { number: "10M+", label: "Women Affected" },
    { number: "70%", label: "Undiagnosed Cases" },
    { number: "95%", label: "Accuracy Rate" },
    { number: "5min", label: "Assessment Time" }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Luna Health</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-smooth">About</a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">Features</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-smooth">Contact</a>
            <Button variant="outline">Sign In</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">
                AI-Powered Health Assessment
              </Badge>
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                Finally, <br />
                <span className="text-transparent bg-gradient-primary bg-clip-text">
                  Intelligent PCOS
                </span>{" "}
                <br />
                & PCOD <br />
                <span className="text-foreground">Screening</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                AI-powered early detection and guidance for women's health. 
                Get your personalized risk assessment in minutes, not months.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:opacity-90 shadow-glow transition-smooth text-lg px-8 py-4"
                onClick={handleStartAssessment}
              >
                Check Your Risk Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 transition-smooth">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.number}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 rounded-2xl blur-2xl"></div>
            <img 
              src={heroImage} 
              alt="Healthcare professionals consulting with diverse group of women in modern medical setting"
              className="relative rounded-2xl shadow-card w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Risk Dashboard Preview */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <Card className="shadow-card bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">PCOS Risk Dashboard</span>
              </div>
              <CardTitle className="text-2xl">Your Risk Score</CardTitle>
              <CardDescription>Real-time health insights</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Mock Risk Score */}
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="stroke-muted"
                        strokeDasharray="100, 100"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="stroke-warning"
                        strokeDasharray="32, 100"
                        strokeWidth="3"
                        fill="transparent"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">32%</span>
                    </div>
                  </div>
                  <Badge className="bg-warning/10 text-warning border-warning/20" variant="outline">
                    Moderate Risk
                  </Badge>
                </div>

                {/* Mock Health Metrics */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Cycle Regularity</span>
                    <Badge className="bg-success/10 text-success border-success/20" variant="outline">
                      Normal
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Insulin Levels</span>
                    <Badge className="bg-warning/10 text-warning border-warning/20" variant="outline">
                      Monitor
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <span className="text-sm font-medium">Hormonal Balance</span>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/20" variant="outline">
                      Attention
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-foreground">
              Comprehensive Health Assessment
            </h2>
            <p className="text-lg text-muted-foreground">
              Our advanced AI analyzes 20 key health parameters to provide you with 
              a detailed risk assessment and personalized recommendations.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Multi-Parameter Analysis</h4>
                  <p className="text-muted-foreground text-sm">
                    Comprehensive evaluation including hormonal profile, metabolic markers, and physical measurements
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h4 className="font-semibold text-foreground">Clinical Validation</h4>
                  <p className="text-muted-foreground text-sm">
                    Results validated against established medical guidelines and research
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Luna Health?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Advanced technology meets personalized healthcare to give you the insights you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="shadow-card hover:shadow-glow transition-all duration-300 group">
              <CardHeader className="text-center">
                <div className={`w-12 h-12 rounded-full bg-gradient-primary mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-primary py-16 mt-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Take Control of Your Health Today
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Don't wait for symptoms to worsen. Get your comprehensive PCOS risk assessment now 
            and start your journey to better health.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="text-lg px-8 py-4 shadow-glow"
            onClick={handleStartAssessment}
          >
            Start Your Assessment
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-12 mt-0">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary" />
              <span className="text-lg font-semibold text-foreground">Luna Health</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © 2024 Luna Health. Empowering women through intelligent health insights.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
