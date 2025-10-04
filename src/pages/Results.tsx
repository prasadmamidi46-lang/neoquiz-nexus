import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Trophy, TrendingUp, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

const Results = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      const [attemptRes, answersRes] = await Promise.all([
        supabase
          .from("quiz_attempts")
          .select("*, quizzes(title, description)")
          .eq("id", attemptId)
          .single(),
        supabase
          .from("answers")
          .select("*, questions(question_text, question_type, correct_answer, points)")
          .eq("attempt_id", attemptId)
          .order("created_at"),
      ]);

      if (attemptRes.error) throw attemptRes.error;
      if (answersRes.error) throw answersRes.error;

      setAttempt(attemptRes.data);
      setAnswers(answersRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load results");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-primary animate-pulse-glow">Loading results...</div>
      </div>
    );
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-primary";
    if (percentage >= 60) return "text-accent";
    return "text-secondary";
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        {/* Score Card */}
        <Card className="glass border-primary/20 mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl text-glow-cyan flex items-center gap-2">
              <Trophy className="w-8 h-8" />
              Quiz Results
            </CardTitle>
            <p className="text-muted-foreground mt-2">{attempt?.quizzes?.title}</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 glass rounded-lg border border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Score</p>
                <p className="text-4xl font-bold text-primary">
                  {attempt?.score}/{attempt?.max_score}
                </p>
              </div>
              <div className="text-center p-6 glass rounded-lg border border-accent/30">
                <p className="text-sm text-muted-foreground mb-2">Percentage</p>
                <p className={`text-4xl font-bold ${getScoreColor(attempt?.percentage)}`}>
                  {attempt?.percentage}%
                </p>
              </div>
              <div className="text-center p-6 glass rounded-lg border border-secondary/30">
                <p className="text-sm text-muted-foreground mb-2">Grade</p>
                <p className="text-4xl font-bold text-secondary">
                  {attempt?.percentage >= 90
                    ? "A+"
                    : attempt?.percentage >= 80
                    ? "A"
                    : attempt?.percentage >= 70
                    ? "B"
                    : attempt?.percentage >= 60
                    ? "C"
                    : "D"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Answer Review */}
        <Card className="glass border-accent/20">
          <CardHeader>
            <CardTitle className="text-2xl text-accent flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Answer Review
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {answers.map((answer, idx) => (
              <div
                key={answer.id}
                className={`p-4 glass rounded-lg border ${
                  answer.is_correct ? "border-primary/30" : "border-destructive/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-lg">Question {idx + 1}</h3>
                  <div className="flex items-center gap-2">
                    {answer.is_correct ? (
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    ) : (
                      <XCircle className="w-5 h-5 text-destructive" />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {answer.questions.points} {answer.questions.points === 1 ? "point" : "points"}
                    </span>
                  </div>
                </div>
                <p className="text-muted-foreground mb-3">{answer.questions.question_text}</p>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Your Answer: </span>
                    <span className={answer.is_correct ? "text-primary" : "text-destructive"}>
                      {answer.user_answer}
                    </span>
                  </div>
                  {!answer.is_correct && (
                    <div>
                      <span className="text-sm font-medium">Correct Answer: </span>
                      <span className="text-primary">{answer.questions.correct_answer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button variant="neon" onClick={() => navigate("/browse-quizzes")} className="flex-1">
            Browse More Quizzes
          </Button>
          <Button variant="gradient" onClick={() => navigate("/dashboard")} className="flex-1">
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Results;
