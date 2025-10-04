import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, BookOpen, TrendingUp, LogOut, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUser(session.user);
  };

  const fetchData = async () => {
    try {
      const [quizzesRes, attemptsRes] = await Promise.all([
        supabase.from("quizzes").select("*").order("created_at", { ascending: false }),
        supabase.from("quiz_attempts").select("*, quizzes(title)").order("completed_at", { ascending: false }).limit(5),
      ]);

      if (quizzesRes.data) setQuizzes(quizzesRes.data);
      if (attemptsRes.data) setAttempts(attemptsRes.data);
    } catch (error: any) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const avgScore = attempts.length > 0 
    ? (attempts.reduce((sum, a) => sum + (a.percentage || 0), 0) / attempts.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-primary animate-pulse-glow">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold text-glow-cyan flex items-center gap-2">
            <Zap className="w-10 h-10 text-primary" />
            QuizMaster
          </h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user?.email?.split("@")[0]}</p>
        </div>
        <Button variant="neon" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="glass border-primary/30 glow-cyan hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <BookOpen className="w-5 h-5" />
              Total Quizzes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{quizzes.length}</p>
          </CardContent>
        </Card>

        <Card className="glass border-secondary/30 glow-magenta hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-secondary">
              <Trophy className="w-5 h-5" />
              Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{attempts.length}</p>
          </CardContent>
        </Card>

        <Card className="glass border-accent/30 glow-purple hover:scale-105 transition-transform duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-accent">
              <TrendingUp className="w-5 h-5" />
              Avg Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{avgScore}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="glass border-primary/20 hover:border-primary/50 transition-all duration-300 cursor-pointer" onClick={() => navigate("/create-quiz")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-primary" />
              Create New Quiz
            </CardTitle>
            <CardDescription>Design custom quizzes with multiple question types</CardDescription>
          </CardHeader>
        </Card>

        <Card className="glass border-secondary/20 hover:border-secondary/50 transition-all duration-300 cursor-pointer" onClick={() => navigate("/browse-quizzes")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-secondary" />
              Browse Quizzes
            </CardTitle>
            <CardDescription>Explore and take quizzes created by the community</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <Card className="glass border-accent/20">
          <CardHeader>
            <CardTitle className="text-accent">Recent Quiz Attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attempts.map((attempt) => (
                <div key={attempt.id} className="flex justify-between items-center p-4 glass rounded-lg border border-primary/20 hover:border-primary/40 transition-all">
                  <div>
                    <p className="font-medium">{attempt.quizzes?.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(attempt.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{attempt.percentage}%</p>
                    <p className="text-sm text-muted-foreground">
                      {attempt.score}/{attempt.max_score}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
