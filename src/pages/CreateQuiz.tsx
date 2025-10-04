import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

type Question = {
  id: string;
  question_text: string;
  question_type: "mcq" | "true_false" | "short_answer";
  options: string[];
  correct_answer: string;
  points: number;
};

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Math.random().toString(36),
        question_text: "",
        question_type: "mcq",
        options: ["", "", "", ""],
        correct_answer: "",
        points: 1,
      },
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const updateOption = (qId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === qId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a quiz title");
      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        toast.error(`Question ${i + 1} is empty`);
        return;
      }
      if (!q.correct_answer.trim()) {
        toast.error(`Question ${i + 1} needs a correct answer`);
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          title,
          description,
          creator_id: user.id,
        })
        .select()
        .single();

      if (quizError) throw quizError;

      const questionsData = questions.map((q, idx) => ({
        quiz_id: quiz.id,
        question_text: q.question_text,
        question_type: q.question_type,
        options: q.question_type === "mcq" ? q.options : null,
        correct_answer: q.correct_answer,
        points: q.points,
        order_index: idx,
      }));

      const { error: questionsError } = await supabase.from("questions").insert(questionsData);

      if (questionsError) throw questionsError;

      toast.success("Quiz created successfully!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to create quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <Card className="glass border-primary/20 mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-3xl text-glow-cyan">Create New Quiz</CardTitle>
            <CardDescription>Design your custom quiz with multiple question types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Quiz Title</Label>
              <Input
                id="title"
                placeholder="Enter quiz title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="glass border-primary/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter quiz description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="glass border-primary/30"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 mb-6">
          {questions.map((question, qIdx) => (
            <Card key={question.id} className="glass border-secondary/20 animate-slide-in">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg text-secondary">Question {qIdx + 1}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => removeQuestion(question.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select
                    value={question.question_type}
                    onValueChange={(value: any) => updateQuestion(question.id, "question_type", value)}
                  >
                    <SelectTrigger className="glass border-secondary/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">Multiple Choice</SelectItem>
                      <SelectItem value="true_false">True/False</SelectItem>
                      <SelectItem value="short_answer">Short Answer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Textarea
                    placeholder="Enter your question"
                    value={question.question_text}
                    onChange={(e) => updateQuestion(question.id, "question_text", e.target.value)}
                    className="glass border-secondary/30"
                  />
                </div>

                {question.question_type === "mcq" && (
                  <div className="space-y-2">
                    <Label>Options</Label>
                    {question.options.map((option, optIdx) => (
                      <Input
                        key={optIdx}
                        placeholder={`Option ${optIdx + 1}`}
                        value={option}
                        onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                        className="glass border-secondary/30"
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Correct Answer</Label>
                  {question.question_type === "true_false" ? (
                    <Select
                      value={question.correct_answer}
                      onValueChange={(value) => updateQuestion(question.id, "correct_answer", value)}
                    >
                      <SelectTrigger className="glass border-secondary/30">
                        <SelectValue placeholder="Select answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">True</SelectItem>
                        <SelectItem value="false">False</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      placeholder="Enter correct answer"
                      value={question.correct_answer}
                      onChange={(e) => updateQuestion(question.id, "correct_answer", e.target.value)}
                      className="glass border-secondary/30"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) => updateQuestion(question.id, "points", parseInt(e.target.value) || 1)}
                    className="glass border-secondary/30"
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-4">
          <Button variant="neon" onClick={addQuestion} className="flex-1">
            <Plus className="w-4 h-4" />
            Add Question
          </Button>
          <Button variant="gradient" onClick={handleSave} disabled={loading} className="flex-1" size="lg">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;
