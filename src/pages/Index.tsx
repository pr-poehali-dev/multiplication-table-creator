import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<{ [key: string]: boolean }>({});
  const [masteredTables, setMasteredTables] = useState<{ [key: number]: boolean }>({});
  const [showProgress, setShowProgress] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("multiplicationProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
    const savedMastered = localStorage.getItem("masteredTables");
    if (savedMastered) {
      setMasteredTables(JSON.parse(savedMastered));
    }
  }, []);

  const toggleCell = (key: string) => {
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem("multiplicationProgress", JSON.stringify(newProgress));
  };

  const totalCells = 81;
  const completedCells = Object.values(progress).filter(Boolean).length;
  const progressPercentage = Math.round((completedCells / totalCells) * 100);

  const toggleMastered = (tableNum: number) => {
    const newMastered = { ...masteredTables, [tableNum]: !masteredTables[tableNum] };
    setMasteredTables(newMastered);
    localStorage.setItem("masteredTables", JSON.stringify(newMastered));
  };

  const resetProgress = () => {
    setProgress({});
    setMasteredTables({});
    localStorage.removeItem("multiplicationProgress");
    localStorage.removeItem("masteredTables");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Таблица умножения</h1>
          <p className="text-lg text-muted-foreground">Изучай и отслеживай свой прогресс</p>
        </div>

        <div className="flex justify-center gap-3 mb-4 flex-wrap">
          <Button
            onClick={() => setShowProgress(!showProgress)}
            variant={showProgress ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name={showProgress ? "Grid3x3" : "BarChart3"} size={20} />
            {showProgress ? "Таблица" : "Прогресс"}
          </Button>
          <Button
            onClick={() => navigate("/game")}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20"
          >
            <Icon name="Gamepad2" size={20} />
            Игра: Математика
          </Button>
          <Button
            onClick={() => navigate("/mixed-game")}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20"
          >
            <Icon name="Sparkles" size={20} />
            Супер-игра
          </Button>
          <Button
            onClick={() => navigate("/ultimate-game")}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-orange-500/10 via-pink-500/10 to-purple-500/10 hover:from-orange-500/20 hover:via-pink-500/20 hover:to-purple-500/20 border-2 border-orange-500/50"
          >
            <Icon name="Rocket" size={20} />
            Ультимативная игра 🌟
          </Button>
        </div>

        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Button
            onClick={() => navigate("/english")}
            variant="outline"
            className="gap-2"
          >
            🇬🇧 Английский
          </Button>
          <Button
            onClick={() => navigate("/chinese")}
            variant="outline"
            className="gap-2"
          >
            🇨🇳 Китайский
          </Button>
          <Button
            onClick={() => navigate("/german")}
            variant="outline"
            className="gap-2"
          >
            🇩🇪 Немецкий
          </Button>
          <Button
            onClick={() => navigate("/russian")}
            variant="outline"
            className="gap-2"
          >
            🇷🇺 Русский
          </Button>
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={() => navigate("/ai-writer")}
            variant="outline"
            className="gap-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border-2 border-cyan-500/50 text-lg px-6 py-6"
          >
            <Icon name="Sparkles" size={24} />
            AI Помощник - Генерация текстов 🤖
          </Button>
        </div>

        {!showProgress ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <Card key={num} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="bg-primary/5 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl text-center text-primary flex-1">
                      Таблица {num}
                    </CardTitle>
                    <button
                      onClick={() => toggleMastered(num)}
                      className={`ml-2 p-2 rounded-full transition-all ${
                        masteredTables[num]
                          ? "bg-secondary text-white"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Icon name="Check" size={20} />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((multiplier) => {
                    const key = `${num}-${multiplier}`;
                    const isLearned = progress[key];
                    return (
                      <div
                        key={key}
                        onClick={() => toggleCell(key)}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                          isLearned
                            ? "bg-secondary/20 border-2 border-secondary"
                            : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                        }`}
                      >
                        <span className="text-lg font-medium">
                          {num} × {multiplier} =
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-primary">
                            {num * multiplier}
                          </span>
                          {isLearned && (
                            <Icon name="CheckCircle2" size={20} className="text-secondary" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-3xl text-center">Твой прогресс</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-primary">
                    {progressPercentage}%
                  </div>
                  <Progress value={progressPercentage} className="h-4" />
                  <p className="text-lg text-muted-foreground">
                    Выучено: {completedCells} из {totalCells} примеров
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-center">Выученные таблицы</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                        <div
                          key={num}
                          onClick={() => toggleMastered(num)}
                          className={`p-6 rounded-lg border-2 text-center cursor-pointer transition-all ${
                            masteredTables[num]
                              ? "bg-secondary text-white border-secondary"
                              : "bg-muted/30 hover:bg-muted/50 border-border"
                          }`}
                        >
                          <div className="text-3xl font-bold mb-2">
                            {num}
                          </div>
                          {masteredTables[num] && (
                            <Icon name="CheckCircle2" size={24} className="mx-auto" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-center">Детальный прогресс</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                        const learned = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
                          (m) => progress[`${num}-${m}`]
                        ).length;
                        const percent = Math.round((learned / 9) * 100);
                        return (
                          <div
                            key={num}
                            className="p-4 rounded-lg border-2 text-center space-y-2"
                          >
                            <div className="text-2xl font-bold text-primary">
                              Таблица {num}
                            </div>
                            <Progress value={percent} className="h-2" />
                            <div className="text-sm text-muted-foreground">
                              {learned}/9
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={resetProgress}
                    variant="outline"
                    className="gap-2"
                  >
                    <Icon name="RotateCcw" size={20} />
                    Сбросить прогресс
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;