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

const MultiplicationGame = () => {
  const navigate = useNavigate();
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [answer, setAnswer] = useState("");
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    totalGames: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  useEffect(() => {
    const saved = localStorage.getItem("multiplicationGameStats");
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  const generateQuestion = () => {
    let max = 5;
    if (difficulty === "medium") max = 9;
    if (difficulty === "hard") max = 12;

    const n1 = Math.floor(Math.random() * max) + 1;
    const n2 = Math.floor(Math.random() * max) + 1;
    setNum1(n1);
    setNum2(n2);
    setAnswer("");
  };

  const startGame = (level: "easy" | "medium" | "hard") => {
    setDifficulty(level);
    setGameStarted(true);
    setTimeout(() => generateQuestion(), 100);
  };

  const checkAnswer = () => {
    const userAnswer = parseInt(answer);
    const correctAnswer = num1 * num2;

    if (userAnswer === correctAnswer) {
      const newStreak = stats.streak + 1;
      const newStats = {
        ...stats,
        correct: stats.correct + 1,
        streak: newStreak,
        bestStreak: Math.max(newStreak, stats.bestStreak),
        totalGames: stats.totalGames + 1,
      };
      setStats(newStats);
      localStorage.setItem("multiplicationGameStats", JSON.stringify(newStats));
      toast.success("Правильно! 🎉", {
        description: `Серия: ${newStreak} ${newStreak >= 5 ? "🔥" : ""}`,
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
      localStorage.setItem("multiplicationGameStats", JSON.stringify(newStats));
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
    localStorage.setItem("multiplicationGameStats", JSON.stringify(emptyStats));
    toast.success("Статистика сброшена!");
  };

  const exitGame = () => {
    setGameStarted(false);
    setAnswer("");
  };

  const accuracy = stats.totalGames > 0 
    ? Math.round((stats.correct / stats.totalGames) * 100) 
    : 0;

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
            <h1 className="text-5xl font-bold mb-4 text-foreground">🎮 Игра: Умножение</h1>
            <p className="text-lg text-muted-foreground">Проверь свои знания таблицы умножения!</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => startGame("easy")}>
              <CardHeader className="bg-green-500/10">
                <CardTitle className="text-2xl text-center text-green-600">
                  <Icon name="Star" size={32} className="mx-auto mb-2" />
                  Легко
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Числа от 1 до 5</p>
                <Button className="mt-4 w-full bg-green-600 hover:bg-green-700">
                  Начать
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => startGame("medium")}>
              <CardHeader className="bg-orange-500/10">
                <CardTitle className="text-2xl text-center text-orange-600">
                  <Icon name="Zap" size={32} className="mx-auto mb-2" />
                  Средне
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Числа от 1 до 9</p>
                <Button className="mt-4 w-full bg-orange-600 hover:bg-orange-700">
                  Начать
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all cursor-pointer" onClick={() => startGame("hard")}>
              <CardHeader className="bg-red-500/10">
                <CardTitle className="text-2xl text-center text-red-600">
                  <Icon name="Flame" size={32} className="mx-auto mb-2" />
                  Сложно
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">Числа от 1 до 12</p>
                <Button className="mt-4 w-full bg-red-600 hover:bg-red-700">
                  Начать
                </Button>
              </CardContent>
            </Card>
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
            </div>
          </div>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-center text-muted-foreground">
              Уровень: {difficulty === "easy" ? "Легко" : difficulty === "medium" ? "Средне" : "Сложно"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-12 pb-12">
            <div className="text-center space-y-8">
              <div className="text-7xl font-bold text-foreground">
                {num1} × {num2} = ?
              </div>
              
              <div className="flex justify-center">
                <Input
                  type="number"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && answer) {
                      checkAnswer();
                    }
                  }}
                  placeholder="Введи ответ"
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

export default MultiplicationGame;
