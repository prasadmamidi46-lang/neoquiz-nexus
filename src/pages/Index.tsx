import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Trophy, TrendingUp, Sparkles, Target } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "2s" }} />
        </div>

        <div className="max-w-6xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="p-4 rounded-full bg-primary/10 border border-primary/30 glow-cyan animate-float">
              <Zap className="w-16 h-16 text-primary" />
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-glow-cyan">
            QuizMaster
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create, share, and master quizzes with our futuristic learning platform. Elevate your knowledge with interactive assessments and real-time feedback.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gradient" size="lg" onClick={() => navigate("/auth")} className="text-lg">
              <Sparkles className="w-5 h-5" />
              Get Started
            </Button>
            <Button variant="neon" size="lg" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-glow-magenta">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass border-primary/30 hover:border-primary/50 transition-all duration-300 hover:scale-105 animate-fade-in">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-cyan">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-primary">Smart Quiz Creation</CardTitle>
                <CardDescription>
                  Design custom quizzes with multiple question types including MCQs, true/false, and short answers.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-secondary/30 hover:border-secondary/50 transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4 glow-magenta">
                  <Trophy className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-secondary">Auto-Grading System</CardTitle>
                <CardDescription>
                  Get instant results with our intelligent auto-grading system that evaluates your answers in real-time.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="glass border-accent/30 hover:border-accent/50 transition-all duration-300 hover:scale-105 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 glow-purple">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-accent">Performance Analytics</CardTitle>
                <CardDescription>
                  Track your progress with detailed analytics and performance graphs to identify strengths and weaknesses.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-glow-purple">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: "Create Account", desc: "Sign up in seconds and start your learning journey" },
              { icon: Target, title: "Take or Create Quizzes", desc: "Browse quizzes or create your own custom assessments" },
              { icon: Trophy, title: "Track Progress", desc: "Monitor your performance and improve over time" },
            ].map((step, idx) => (
              <div key={idx} className="text-center animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full glass border-2 border-primary/30 flex items-center justify-center glow-cyan">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass border-primary/20 p-8 animate-fade-in">
            <CardContent className="space-y-6">
              <h2 className="text-4xl font-bold text-glow-cyan">
                Ready to Master Your Knowledge?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of learners using QuizMaster to enhance their skills and track their progress.
              </p>
              <Button variant="gradient" size="lg" onClick={() => navigate("/auth")} className="text-lg">
                <Sparkles className="w-5 h-5" />
                Start Learning Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
