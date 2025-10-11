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

type QuestionType = "math" | "english" | "chinese" | "german" | "exercise";

const numbers: { [key: number]: string } = {
  1: "one", 2: "two", 3: "three", 4: "four", 5: "five",
  6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
  12: "twelve", 15: "fifteen", 16: "sixteen", 18: "eighteen",
  20: "twenty", 21: "twenty-one", 24: "twenty-four", 25: "twenty-five",
  27: "twenty-seven", 28: "twenty-eight", 30: "thirty", 32: "thirty-two",
  35: "thirty-five", 36: "thirty-six", 40: "forty", 42: "forty-two",
  45: "forty-five", 48: "forty-eight", 49: "forty-nine", 54: "fifty-four",
  56: "fifty-six", 63: "sixty-three", 64: "sixty-four", 72: "seventy-two", 81: "eighty-one",
};

const chineseNumbers: { [key: number]: { chinese: string; pinyin: string } } = {
  1: { chinese: "一", pinyin: "yi" },
  2: { chinese: "二", pinyin: "er" },
  3: { chinese: "三", pinyin: "san" },
  4: { chinese: "四", pinyin: "si" },
  5: { chinese: "五", pinyin: "wu" },
  6: { chinese: "六", pinyin: "liu" },
  7: { chinese: "七", pinyin: "qi" },
  8: { chinese: "八", pinyin: "ba" },
  9: { chinese: "九", pinyin: "jiu" },
};

const germanNumbers: { [key: number]: string } = {
  1: "eins", 2: "zwei", 3: "drei", 4: "vier", 5: "fünf",
  6: "sechs", 7: "sieben", 8: "acht", 9: "neun", 10: "zehn",
  12: "zwölf", 15: "fünfzehn", 16: "sechzehn", 18: "achtzehn",
  20: "zwanzig", 21: "einundzwanzig", 24: "vierundzwanzig",
  25: "fünfundzwanzig", 27: "siebenundzwanzig", 28: "achtundzwanzig",
  30: "dreißig", 32: "zweiunddreißig", 35: "fünfunddreißig",
  36: "sechsunddreißig", 40: "vierzig", 42: "zweiundvierzig",
  45: "fünfundvierzig", 48: "achtundvierzig", 49: "neunundvierzig",
  54: "vierundfünfzig", 56: "sechsundfünfzig", 63: "dreiundsechzig",
  64: "vierundsechzig", 72: "zweiundsiebzig", 81: "einundachtzig",
};

const exercises = [
  { name: "приседания", count: 5, emoji: "🏋️" },
  { name: "прыжки", count: 10, emoji: "🦘" },
  { name: "наклоны", count: 5, emoji: "🤸" },
  { name: "повороты головы", count: 5, emoji: "🔄" },
  { name: "махи руками", count: 10, emoji: "💪" },
  { name: "растяжка", count: 3, emoji: "🧘" },
];

const UltimateGame = () => {
  const navigate = useNavigate();
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [result, setResult] = useState(0);
  const [answer, setAnswer] = useState("");
  const [questionType, setQuestionType] = useState<QuestionType>("math");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentExercise, setCurrentExercise] = useState({ name: "", count: 0, emoji: "" });
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [stats, setStats] = useState<GameStats>({
    correct: 0,
    incorrect: 0,
    streak: 0,
    bestStreak: 0,
    totalGames: 0,
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [questionsUntilExercise, setQuestionsUntilExercise] = useState(5);

  useEffect(() => {
    const saved = localStorage.getItem("ultimateGameStats");
    if (saved) {
      setStats(JSON.parse(saved));
    }
  }, []);

  const generateQuestion = () => {
    if (questionsUntilExercise <= 0) {
      const randomExercise = exercises[Math.floor(Math.random() * exercises.length)];
      setCurrentExercise(randomExercise);
      setQuestionType("exercise");
      setCurrentQuestion(`Время для физкультуры! ${randomExercise.emoji}`);
      setExerciseCompleted(false);
      setQuestionsUntilExercise(5);
      setAnswer("");
      return;
    }

    const types: QuestionType[] = ["math", "english", "chinese", "german"];
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
      if (numbers[res]) {
        setCurrentQuestion(`Как будет "${res}" на английском?`);
      } else {
        setCurrentQuestion(`${numbers[n1]} × ${numbers[n2]} = ? (ответ числом)`);
      }
    } else if (randomType === "chinese") {
      setCurrentQuestion(`${chineseNumbers[n1].chinese} × ${chineseNumbers[n2].chinese} = ? (ответ числом)`);
    } else if (randomType === "german") {
      setCurrentQuestion(`${germanNumbers[n1]} × ${germanNumbers[n2]} = ? (ответ числом)`);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setQuestionsUntilExercise(5);
    setTimeout(() => generateQuestion(), 100);
  };

  const completeExercise = () => {
    setExerciseCompleted(true);
    toast.success("Отличная работа! 💪", {
      description: "Продолжаем учиться!",
    });
    setTimeout(() => generateQuestion(), 1500);
  };

  const checkAnswer = () => {
    let isCorrect = false;
    const userAnswer = answer.toLowerCase().trim();

    if (questionType === "math") {
      isCorrect = parseInt(userAnswer) === result;
    } else if (questionType === "english") {
      if (numbers[result]) {
        isCorrect = userAnswer === numbers[result];
      } else {
        isCorrect = parseInt(userAnswer) === result;
      }
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
      localStorage.setItem("ultimateGameStats", JSON.stringify(newStats));
      
      let message = "Правильно! 🎉";
      if (newStreak >= 15) message = "Невероятная серия! 🔥🔥🔥";
      else if (newStreak >= 10) message = "Фантастика! 🔥🔥";
      else if (newStreak >= 5) message = "Отлично! 🔥";
      
      toast.success(message, {
        description: `Серия: ${newStreak}`,
      });
      
      setQuestionsUntilExercise(questionsUntilExercise - 1);
      setTimeout(() => generateQuestion(), 500);
    } else {
      const newStats = {
        ...stats,
        incorrect: stats.incorrect + 1,
        streak: 0,
        totalGames: stats.totalGames + 1,
      };
      setStats(newStats);
      localStorage.setItem("ultimateGameStats", JSON.stringify(newStats));
      
      let correctAnswer = result.toString();
      if (questionType === "english" && numbers[result]) {
        correctAnswer = numbers[result];
      }
      
      toast.error("Неправильно 😢", {
        description: `Правильный ответ: ${correctAnswer}`,
      });
      
      setQuestionsUntilExercise(questionsUntilExercise - 1);
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
    localStorage.setItem("ultimateGameStats", JSON.stringify(emptyStats));
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
    if (questionType === "chinese") return "Cherry";
    if (questionType === "german") return "Beer";
    return "Dumbbell";
  };

  const getQuestionColor = () => {
    if (questionType === "math") return "text-blue-600";
    if (questionType === "english") return "text-green-600";
    if (questionType === "chinese") return "text-red-600";
    if (questionType === "german") return "text-yellow-600";
    return "text-orange-600";
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
            <h1 className="text-5xl font-bold mb-4 text-foreground">🌟 Ультимативная игра</h1>
            <p className="text-lg text-muted-foreground">Математика + Языки + Физкультура!</p>
            <p className="text-sm text-muted-foreground mt-2">Полный комплекс обучения для ума и тела</p>
          </div>

          <Card className="border-2 mb-12 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5">
            <CardHeader>
              <CardTitle className="text-2xl text-center">📚 Что включено</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                  <Icon name="Calculator" size={32} className="mx-auto mb-2 text-blue-600" />
                  <div className="font-semibold text-blue-600">Математика</div>
                  <div className="text-sm text-muted-foreground mt-1">5 × 7 = ?</div>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg text-center">
                  <div className="text-3xl mb-2">🇬🇧</div>
                  <div className="font-semibold text-green-600">Английский</div>
                  <div className="text-sm text-muted-foreground mt-1">35 = thirty-five</div>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg text-center">
                  <div className="text-3xl mb-2">🇨🇳</div>
                  <div className="font-semibold text-red-600">Китайский</div>
                  <div className="text-sm text-muted-foreground mt-1">三 × 五 = ?</div>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
                  <div className="text-3xl mb-2">🇩🇪</div>
                  <div className="font-semibold text-yellow-600">Немецкий</div>
                  <div className="text-sm text-muted-foreground mt-1">drei × fünf = ?</div>
                </div>
                <div className="p-4 bg-orange-500/10 rounded-lg text-center">
                  <Icon name="Dumbbell" size={32} className="mx-auto mb-2 text-orange-600" />
                  <div className="font-semibold text-orange-600">Физкультура</div>
                  <div className="text-sm text-muted-foreground mt-1">Каждые 5 вопросов</div>
                </div>
                <div className="p-4 bg-purple-500/10 rounded-lg text-center">
                  <Icon name="Trophy" size={32} className="mx-auto mb-2 text-purple-600" />
                  <div className="font-semibold text-purple-600">Статистика</div>
                  <div className="text-sm text-muted-foreground mt-1">Отслеживай прогресс</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mb-12">
            <Button
              onClick={startGame}
              size="lg"
              className="text-xl px-12 py-8 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 hover:from-purple-700 hover:via-pink-700 hover:to-orange-700"
            >
              <Icon name="Rocket" size={24} className="mr-2" />
              Начать тренировку
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

  if (questionType === "exercise") {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <Button onClick={exitGame} variant="ghost" className="gap-2">
              <Icon name="X" size={20} />
              Выйти
            </Button>
          </div>

          <Card className="border-2 shadow-lg bg-gradient-to-br from-orange-500/10 to-red-500/10">
            <CardHeader className="bg-orange-500/20">
              <CardTitle className="text-center text-orange-600 flex items-center justify-center gap-2">
                <Icon name="Dumbbell" size={28} />
                Перерыв на физкультуру!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-12 pb-12">
              <div className="text-center space-y-8">
                <div className="text-8xl">{currentExercise.emoji}</div>
                <div className="text-4xl font-bold text-foreground">
                  {currentExercise.name}
                </div>
                <div className="text-6xl font-bold text-orange-600">
                  {currentExercise.count} раз
                </div>
                
                {!exerciseCompleted ? (
                  <Button
                    onClick={completeExercise}
                    className="text-xl px-12 py-6 bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    Выполнено! ✓
                  </Button>
                ) : (
                  <div className="text-2xl text-green-600 font-semibold">
                    Отлично! Продолжаем... 🎉
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center text-muted-foreground">
            <p className="text-sm">💡 Физкультура помогает лучше запоминать информацию!</p>
          </div>
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
              {stats.streak >= 15 && <span className="ml-1">🔥</span>}
            </div>
          </div>
        </div>

        <div className="mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 rounded-full">
            <Icon name="Dumbbell" size={16} className="text-orange-600" />
            <span className="text-sm text-muted-foreground">
              До физкультуры: <span className="font-bold text-orange-600">{questionsUntilExercise}</span>
            </span>
          </div>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-primary/5">
            <div className="flex items-center justify-center gap-2">
              <Icon name={getQuestionIcon()} size={24} className={getQuestionColor()} />
              <CardTitle className={`text-center ${getQuestionColor()}`}>
                {questionType === "math" && "Математика"}
                {questionType === "english" && "🇬🇧 Английский"}
                {questionType === "chinese" && "🇨🇳 Китайский"}
                {questionType === "german" && "🇩🇪 Немецкий"}
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

export default UltimateGame;
