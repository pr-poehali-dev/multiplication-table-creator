import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GameStats {
  correct: number;
  incorrect: number;
  streak: number;
  bestStreak: number;
  totalGames: number;
}

type QuestionType = "math" | "english" | "mixed";

const numbers: { [key: number]: string } = {
  1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
  6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
  11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen",
  16: "sixteen", 17: "seventeen", 18: "eighteen", 19: "nineteen", 20: "twenty",
  21: "twenty-one", 22: "twenty-two", 23: "twenty-three", 24: "twenty-four",
  25: "twenty-five", 26: "twenty-six", 27: "twenty-seven", 28: "twenty-eight",
  30: "thirty", 32: "thirty-two", 35: "thirty-five", 36: "thirty-six",
  40: "forty", 42: "forty-two", 45: "forty-five", 48: "forty-eight", 49: "forty-nine",
  50: "fifty", 54: "fifty-four", 56: "fifty-six", 63: "sixty-three", 64: "sixty-four",
  72: "seventy-two", 81: "eighty-one",
};

const MixedGame = () => {
  const navigate = useNavigate();
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [result, setResult] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("math");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    totalGames: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mixedGameStats");
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  const generateQuestion = () => {
    const types: QuestionType[] = ["math", "english", "mixed"];
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    const res = n1 * n2;
    
    setNum1(n1);
    setNum2(n2);
    setResult(res);
    setQuestionType(randomType);
    setAnswer("");

    if (randomType === "math") {
      setCurrentQuestion(`${n1} × ${n2} = ?`);
    } else if (randomType === "english") {
      setCurrentQuestion(`Как будет "${res}" на английском?`);
    } else {
      setCurrentQuestion(`${numbers[n1]} × ${numbers[n2]} = ? (ответ числом)`);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeout(() => generateQuestion(), 100);
  };

  const checkAnswer = () => {
    let isCorrect = false;
    const userAnswer = answer.toLowerCase().trim();

    if (questionType === "math") {
      isCorrect = parseInt(userAnswer) === result;
    } else if (questionType === "english") {
      isCorrect = userAnswer === numbers[result];
    } else {
      isCorrect = parseInt(userAnswer) === result;
    }

    if (isCorrect) {
      const newStreak = stats.streak + 1;
      const newStats = {
        ...stats,
        correct: stats.correct + 1,
        streak: newStreak,
        bestStreak: Math.max(newStreak, stats.bestStreak),
        totalGames: stats.totalGames + 1,
      };
      setStats(newStats);
      localStorage.setItem("mixedGameStats", JSON.stringify(newStats));
      
      let message = "Правильно! 🎉";
      if (newStreak >= 10) message = "Невероятно! 🔥🔥🔥";
      else if (newStreak >= 5) message = "Отлично! 🔥";
      
      toast.success(message, {
        description: `Серия: ${newStreak}`,
      });
      setTimeout(() => generateQuestion(), 500);
    } else {
      const newStats = {
        ...stats,
        incorrect: stats.incorrect + 1,
        streak: 0,
        totalGames: stats.totalGames + 1,
      };
      setStats(newStats);
      localStorage.setItem("mixedGameStats", JSON.stringify(newStats));
      
      let correctAnswer = "";
      if (questionType === "math" || questionType === "mixed") {
        correctAnswer = result.toString();
      } else {
        correctAnswer = numbers[result];
      }
      
      toast.error("Неправильно 😢", {
        description: `Правильный ответ: ${correctAnswer}`,
      });
      setTimeout(() => generateQuestion(), 1000);
    }
  };

  const resetStats = () => {
    const emptyStats = {
      correct: 0,
      incorrect: 0,
      streak: 0,
      bestStreak: 0,
      totalGames: 0,
    };
    setStats(emptyStats);
    localStorage.setItem("mixedGameStats", JSON.stringify(emptyStats));
    toast.success("Статистика сброшена!");
  };

  const exitGame = () => {
    setGameStarted(false);
    setAnswer("");
  };

  const accuracy = stats.totalGames > 0 
    ? Math.round((stats.correct / stats.totalGames) * 100) 
    : 0;

  const getQuestionIcon = () => {
    if (questionType === "math") return "Calculator";
    if (questionType === "english") return "Languages";
    return "Sparkles";
  };

  const getQuestionColor = () => {
    if (questionType === "math") return "text-blue-600";
    if (questionType === "english") return "text-green-600";
    return "text-purple-600";
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Button
            onClick={() => navigate("/")}
            variant="ghost"
            className="mb-8 gap-2"
          >
            <Icon name="ArrowLeft" size={20} />
            Назад
          </Button>

          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-foreground">🎯 Супер-игра</h1>
            <p className="text-lg text-muted-foreground">Математика + Английский в одной игре!</p>
            <p className="text-sm text-muted-foreground mt-2">Решай примеры и переводи числа на английский</p>
          </div>

          <Card className="border-2 mb-12 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardHeader>
              <CardTitle className="text-2xl text-center">📚 Типы вопросов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <Icon name="Calculator" size={32} className="mx-auto mb-2 text-blue-600" />
                  <div className="font-semibold text-blue-600">Математика</div>
                  <div className="text-sm text-muted-foreground mt-1">5 × 7 = ?</div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg text-center">
                  <Icon name="Languages" size={32} className="mx-auto mb-2 text-green-600" />
                  <div className="font-semibold text-green-600">Английский</div>
                  <div className="text-sm text-muted-foreground mt-1">35 = ?</div>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                  <Icon name="Sparkles" size={32} className="mx-auto mb-2 text-purple-600" />
                  <div className="font-semibold text-purple-600">Микс</div>
                  <div className="text-sm text-muted-foreground mt-1">five × seven = ?</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mb-12">
            <Button
              onClick={startGame}
              size="lg"
              className="text-xl px-12 py-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Icon name="Play" size={24} className="mr-2" />
              Начать игру
            </Button>
          </div>

          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">📊 Статистика</CardTitle>
                <Button onClick={resetStats} variant="outline" size="sm" className="gap-2">
                  <Icon name="RotateCcw" size={16} />
                  Сбросить
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{stats.correct}</div>
                  <div className="text-sm text-muted-foreground">Правильно</div>
                </div>
                <div className="text-center p-4 bg-red-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">{stats.incorrect}</div>
                  <div className="text-sm text-muted-foreground">Неправильно</div>
                </div>
                <div className="text-center p-4 bg-blue-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Точность</div>
                </div>
                <div className="text-center p-4 bg-orange-500/10 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">{stats.bestStreak}</div>
                  <div className="text-sm text-muted-foreground">Лучшая серия</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <Button onClick={exitGame} variant="ghost" className="gap-2">
            <Icon name="X" size={20} />
            Выйти
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Серия: <span className="text-2xl font-bold text-primary">{stats.streak}</span>
              {stats.streak >= 5 && <span className="ml-2">🔥</span>}
              {stats.streak >= 10 && <span className="ml-1">🔥</span>}
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-center gap-2">
              <Icon name={getQuestionIcon()} size={24} className={getQuestionColor()} />
              <CardTitle className={`text-center ${getQuestionColor()}`}>
                {questionType === "math" && "Математика"}
                {questionType === "english" && "Английский"}
                {questionType === "mixed" && "Микс"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-8">
              <div className="text-5xl font-bold text-foreground min-h-[80px] flex items-center justify-center">
                {currentQuestion}
              </div>
              
              <div className="flex justify-center">
                <Input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answer) {
                      checkAnswer();
                    }
                  }}
                  placeholder={questionType === "english" ? "Введи на английском" : "Введи ответ"}
                  className="text-4xl text-center h-20 max-w-xs"
                  autoFocus
                />
              </div>

              <Button
                onClick={checkAnswer}
                disabled={!answer}
                className="text-xl px-12 py-6"
                size="lg"
              >
                Проверить
              </Button>

              {questionType === "english" && (
                <div className="text-sm text-muted-foreground">
                  💡 Например: thirty-five
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mt-8">
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.correct}</div>
              <div className="text-sm text-muted-foreground">Правильно</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.incorrect}</div>
              <div className="text-sm text-muted-foreground">Неправильно</div>
            </CardContent>
          </Card>
          <Card className="border-2">
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">{accuracy}%</div>
              <div className="text-sm text-muted-foreground">Точность</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MixedGame;
