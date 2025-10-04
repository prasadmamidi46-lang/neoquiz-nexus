import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, PlayCircle } from "lucide-react";
import { toast } from "sonner";

const BrowseQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredQuizzes(
        quizzes.filter((quiz) => quiz.title.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    } else {
      setFilteredQuizzes(quizzes);
    }
  }, [searchTerm, quizzes]);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .select("*, profiles(username)")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuizzes(data || []);
      setFilteredQuizzes(data || []);
    } catch (error: any) {
      toast.error("Failed to load quizzes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-glow-cyan mb-4">Browse Quizzes</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass border-primary/30"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center text-xl text-primary animate-pulse-glow">Loading quizzes...</div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="glass border-primary/20">
            <CardContent className="p-12 text-center">
              <p className="text-xl text-muted-foreground">No quizzes found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQuizzes.map((quiz) => (
              <Card
                key={quiz.id}
                className="glass border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-105 cursor-pointer animate-fade-in"
                onClick={() => navigate(`/take-quiz/${quiz.id}`)}
              >
                <CardHeader>
                  <CardTitle className="text-xl text-primary">{quiz.title}</CardTitle>
                  <CardDescription>
                    {quiz.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      By {quiz.profiles?.username || "Anonymous"}
                    </div>
                    <Button variant="neon" size="sm">
                      <PlayCircle className="w-4 h-4" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseQuizzes;
