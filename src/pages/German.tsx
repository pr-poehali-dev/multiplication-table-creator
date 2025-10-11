import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

interface WordProgress {
  [key: string]: boolean;
}

const germanWords = {
  numbers: [
    { german: "eins", translation: "один", number: 1 },
    { german: "zwei", translation: "два", number: 2 },
    { german: "drei", translation: "три", number: 3 },
    { german: "vier", translation: "четыре", number: 4 },
    { german: "fünf", translation: "пять", number: 5 },
    { german: "sechs", translation: "шесть", number: 6 },
    { german: "sieben", translation: "семь", number: 7 },
    { german: "acht", translation: "восемь", number: 8 },
    { german: "neun", translation: "девять", number: 9 },
    { german: "zehn", translation: "десять", number: 10 },
  ],
  greetings: [
    { german: "Hallo", translation: "привет", article: "" },
    { german: "Guten Morgen", translation: "доброе утро", article: "" },
    { german: "Guten Tag", translation: "добрый день", article: "" },
    { german: "Guten Abend", translation: "добрый вечер", article: "" },
    { german: "Tschüss", translation: "пока", article: "" },
    { german: "Auf Wiedersehen", translation: "до свидания", article: "" },
    { german: "Danke", translation: "спасибо", article: "" },
    { german: "Bitte", translation: "пожалуйста", article: "" },
  ],
  nouns: [
    { german: "Wasser", translation: "вода", article: "das" },
    { german: "Brot", translation: "хлеб", article: "das" },
    { german: "Milch", translation: "молоко", article: "die" },
    { german: "Kaffee", translation: "кофе", article: "der" },
    { german: "Tee", translation: "чай", article: "der" },
    { german: "Haus", translation: "дом", article: "das" },
    { german: "Auto", translation: "машина", article: "das" },
    { german: "Buch", translation: "книга", article: "das" },
    { german: "Schule", translation: "школа", article: "die" },
    { german: "Freund", translation: "друг", article: "der" },
    { german: "Familie", translation: "семья", article: "die" },
    { german: "Liebe", translation: "любовь", article: "die" },
  ],
  verbs: [
    { german: "sein", translation: "быть", form: "глагол" },
    { german: "haben", translation: "иметь", form: "глагол" },
    { german: "machen", translation: "делать", form: "глагол" },
    { german: "gehen", translation: "идти", form: "глагол" },
    { german: "kommen", translation: "приходить", form: "глагол" },
    { german: "essen", translation: "есть/кушать", form: "глагол" },
    { german: "trinken", translation: "пить", form: "глагол" },
    { german: "sprechen", translation: "говорить", form: "глагол" },
    { german: "lernen", translation: "учить", form: "глагол" },
    { german: "arbeiten", translation: "работать", form: "глагол" },
  ],
};

const German = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<WordProgress>({});
  const [activeTab, setActiveTab] = useState<"numbers" | "greetings" | "nouns" | "verbs">("numbers");

  useEffect(() => {
    const saved = localStorage.getItem("germanProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  const toggleWord = (key: string) => {
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem("germanProgress", JSON.stringify(newProgress));
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem("germanProgress");
  };

  const totalWords = 
    germanWords.numbers.length + 
    germanWords.greetings.length + 
    germanWords.nouns.length + 
    germanWords.verbs.length;
  const learnedWords = Object.values(progress).filter(Boolean).length;
  const progressPercentage = Math.round((learnedWords / totalWords) * 100);

  const getArticleColor = (article: string) => {
    if (article === "der") return "text-blue-600 bg-blue-100";
    if (article === "die") return "text-red-600 bg-red-100";
    if (article === "das") return "text-green-600 bg-green-100";
    return "";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-8 gap-2"
        >
          <Icon name="ArrowLeft" size={20} />
          Назад
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">🇩🇪 Немецкий язык</h1>
          <p className="text-lg text-muted-foreground">Изучай немецкие слова и артикли</p>
        </div>

        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">📊 Твой прогресс</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">{progressPercentage}%</div>
              <Progress value={progressPercentage} className="h-3 mb-2" />
              <p className="text-muted-foreground">Выучено: {learnedWords} из {totalWords} слов</p>
            </div>
            <div className="flex justify-center">
              <Button onClick={resetProgress} variant="outline" size="sm" className="gap-2">
                <Icon name="RotateCcw" size={16} />
                Сбросить прогресс
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <Button
            onClick={() => setActiveTab("numbers")}
            variant={activeTab === "numbers" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="Hash" size={20} />
            Цифры
          </Button>
          <Button
            onClick={() => setActiveTab("greetings")}
            variant={activeTab === "greetings" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="Hand" size={20} />
            Приветствия
          </Button>
          <Button
            onClick={() => setActiveTab("nouns")}
            variant={activeTab === "nouns" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="BookOpen" size={20} />
            Существительные
          </Button>
          <Button
            onClick={() => setActiveTab("verbs")}
            variant={activeTab === "verbs" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="Zap" size={20} />
            Глаголы
          </Button>
        </div>

        {activeTab === "numbers" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {germanWords.numbers.map((item) => {
              const key = `number-${item.number}`;
              const isLearned = progress[key];
              return (
                <Card
                  key={key}
                  onClick={() => toggleWord(key)}
                  className={`cursor-pointer transition-all border-2 ${
                    isLearned
                      ? "bg-secondary/20 border-secondary shadow-md"
                      : "hover:shadow-lg hover:border-primary/50"
                  }`}
                >
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="text-5xl font-bold text-primary mb-2">{item.number}</div>
                    <div className="text-2xl font-semibold">{item.german}</div>
                    <div className="text-lg text-muted-foreground">{item.translation}</div>
                    {isLearned && (
                      <Icon name="CheckCircle2" size={24} className="mx-auto text-secondary" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "greetings" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {germanWords.greetings.map((item, index) => {
              const key = `greeting-${index}`;
              const isLearned = progress[key];
              return (
                <Card
                  key={key}
                  onClick={() => toggleWord(key)}
                  className={`cursor-pointer transition-all border-2 ${
                    isLearned
                      ? "bg-secondary/20 border-secondary shadow-md"
                      : "hover:shadow-lg hover:border-primary/50"
                  }`}
                >
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="text-3xl font-bold text-primary">{item.german}</div>
                    <div className="text-lg text-muted-foreground">{item.translation}</div>
                    {isLearned && (
                      <Icon name="CheckCircle2" size={24} className="mx-auto text-secondary" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "nouns" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {germanWords.nouns.map((item, index) => {
              const key = `noun-${index}`;
              const isLearned = progress[key];
              return (
                <Card
                  key={key}
                  onClick={() => toggleWord(key)}
                  className={`cursor-pointer transition-all border-2 ${
                    isLearned
                      ? "bg-secondary/20 border-secondary shadow-md"
                      : "hover:shadow-lg hover:border-primary/50"
                  }`}
                >
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getArticleColor(item.article)}`}>
                      {item.article}
                    </div>
                    <div className="text-3xl font-bold text-primary">{item.german}</div>
                    <div className="text-lg text-muted-foreground">{item.translation}</div>
                    {isLearned && (
                      <Icon name="CheckCircle2" size={24} className="mx-auto text-secondary" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "verbs" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {germanWords.verbs.map((item, index) => {
              const key = `verb-${index}`;
              const isLearned = progress[key];
              return (
                <Card
                  key={key}
                  onClick={() => toggleWord(key)}
                  className={`cursor-pointer transition-all border-2 ${
                    isLearned
                      ? "bg-secondary/20 border-secondary shadow-md"
                      : "hover:shadow-lg hover:border-primary/50"
                  }`}
                >
                  <CardContent className="pt-6 text-center space-y-3">
                    <div className="text-3xl font-bold text-primary">{item.german}</div>
                    <div className="text-lg text-muted-foreground">{item.translation}</div>
                    {isLearned && (
                      <Icon name="CheckCircle2" size={24} className="mx-auto text-secondary" />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === "nouns" && (
          <Card className="mt-8 border-2 bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center gap-6 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-600"></div>
                  <span className="text-sm">der - мужской род</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-600"></div>
                  <span className="text-sm">die - женский род</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-600"></div>
                  <span className="text-sm">das - средний род</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default German;
