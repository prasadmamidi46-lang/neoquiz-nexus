import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuizData();
  }, [quizId]);

  const fetchQuizData = async () => {
    try {
      const [quizRes, questionsRes] = await Promise.all([
        supabase.from("quizzes").select("*").eq("id", quizId).single(),
        supabase.from("questions").select("*").eq("quiz_id", quizId).order("order_index"),
      ]);

      if (quizRes.error) throw quizRes.error;
      if (questionsRes.error) throw questionsRes.error;

      setQuiz(quizRes.data);
      setQuestions(questionsRes.data || []);
    } catch (error: any) {
      toast.error("Failed to load quiz");
      navigate("/browse-quizzes");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    if (Object.keys(answers).length !== questions.length) {
      toast.error("Please answer all questions");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Calculate score
      let score = 0;
      const answerRecords = questions.map((q) => {
        const userAnswer = answers[q.id] || "";
        const isCorrect = userAnswer.toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
        if (isCorrect) score += q.points;

        return {
          question_id: q.id,
          user_answer: userAnswer,
          is_correct: isCorrect,
        };
      });

      const maxScore = questions.reduce((sum, q) => sum + q.points, 0);
      const percentage = (score / maxScore) * 100;

      // Insert attempt
      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          quiz_id: quizId,
          user_id: user.id,
          score,
          max_score: maxScore,
          percentage: parseFloat(percentage.toFixed(2)),
        })
        .select()
        .single();

      if (attemptError) throw attemptError;

      // Insert answers
      const answersData = answerRecords.map((a) => ({
        ...a,
        attempt_id: attempt.id,
      }));

      const { error: answersError } = await supabase.from("answers").insert(answersData);

      if (answersError) throw answersError;

      toast.success("Quiz submitted successfully!");
      navigate(`/results/${attempt.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-primary animate-pulse-glow">Loading quiz...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/browse-quizzes")} className="mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <Card className="glass border-primary/20 mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl text-glow-cyan">{quiz?.title}</CardTitle>
            {quiz?.description && <p className="text-muted-foreground mt-2">{quiz.description}</p>}
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {questions.map((question, idx) => (
            <Card key={question.id} className="glass border-secondary/20 animate-slide-in">
              <CardHeader>
                <CardTitle className="text-lg text-secondary">
                  Question {idx + 1} ({question.points} {question.points === 1 ? "point" : "points"})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-lg">{question.question_text}</p>

                {question.question_type === "mcq" && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                  >
                    {(question.options as string[]).map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`${question.id}-${optIdx}`} />
                        <Label htmlFor={`${question.id}-${optIdx}`} className="cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.question_type === "true_false" && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`${question.id}-true`} />
                      <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`${question.id}-false`} />
                      <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {question.question_type === "short_answer" && (
                  <Input
                    placeholder="Enter your answer"
                    value={answers[question.id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                    className="glass border-secondary/30"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            <Check className="w-5 h-5" />
            {submitting ? "Submitting..." : "Submit Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;
