import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

interface WordProgress {
  [key: string]: boolean;
}

const chineseWords = {
  numbers: [
    { chinese: "一", pinyin: "yī", translation: "один", number: 1 },
    { chinese: "二", pinyin: "èr", translation: "два", number: 2 },
    { chinese: "三", pinyin: "sān", translation: "три", number: 3 },
    { chinese: "四", pinyin: "sì", translation: "четыре", number: 4 },
    { chinese: "五", pinyin: "wǔ", translation: "пять", number: 5 },
    { chinese: "六", pinyin: "liù", translation: "шесть", number: 6 },
    { chinese: "七", pinyin: "qī", translation: "семь", number: 7 },
    { chinese: "八", pinyin: "bā", translation: "восемь", number: 8 },
    { chinese: "九", pinyin: "jiǔ", translation: "девять", number: 9 },
    { chinese: "十", pinyin: "shí", translation: "десять", number: 10 },
  ],
  greetings: [
    { chinese: "你好", pinyin: "nǐ hǎo", translation: "привет", category: "greeting" },
    { chinese: "再见", pinyin: "zàijiàn", translation: "до свидания", category: "greeting" },
    { chinese: "谢谢", pinyin: "xièxie", translation: "спасибо", category: "greeting" },
    { chinese: "对不起", pinyin: "duìbùqǐ", translation: "извините", category: "greeting" },
    { chinese: "请", pinyin: "qǐng", translation: "пожалуйста", category: "greeting" },
  ],
  basic: [
    { chinese: "水", pinyin: "shuǐ", translation: "вода", category: "basic" },
    { chinese: "饭", pinyin: "fàn", translation: "рис/еда", category: "basic" },
    { chinese: "茶", pinyin: "chá", translation: "чай", category: "basic" },
    { chinese: "书", pinyin: "shū", translation: "книга", category: "basic" },
    { chinese: "家", pinyin: "jiā", translation: "дом", category: "basic" },
    { chinese: "人", pinyin: "rén", translation: "человек", category: "basic" },
    { chinese: "朋友", pinyin: "péngyou", translation: "друг", category: "basic" },
    { chinese: "爱", pinyin: "ài", translation: "любовь", category: "basic" },
  ],
};

const Chinese = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<WordProgress>({});
  const [activeTab, setActiveTab] = useState<"numbers" | "greetings" | "basic">("numbers");

  useEffect(() => {
    const saved = localStorage.getItem("chineseProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  const toggleWord = (key: string) => {
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem("chineseProgress", JSON.stringify(newProgress));
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem("chineseProgress");
  };

  const totalWords = chineseWords.numbers.length + chineseWords.greetings.length + chineseWords.basic.length;
  const learnedWords = Object.values(progress).filter(Boolean).length;
  const progressPercentage = Math.round((learnedWords / totalWords) * 100);

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
          <h1 className="text-5xl font-bold mb-4 text-foreground">🇨🇳 Китайский язык</h1>
          <p className="text-lg text-muted-foreground">Изучай китайские иероглифы и пиньинь</p>
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
            onClick={() => setActiveTab("basic")}
            variant={activeTab === "basic" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="BookOpen" size={20} />
            Базовые слова
          </Button>
        </div>

        {activeTab === "numbers" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {chineseWords.numbers.map((item) => {
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
                    <div className="text-6xl mb-2">{item.chinese}</div>
                    <div className="text-xl font-semibold text-primary">{item.pinyin}</div>
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
            {chineseWords.greetings.map((item, index) => {
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
                    <div className="text-5xl mb-2">{item.chinese}</div>
                    <div className="text-xl font-semibold text-primary">{item.pinyin}</div>
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

        {activeTab === "basic" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {chineseWords.basic.map((item, index) => {
              const key = `basic-${index}`;
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
                    <div className="text-5xl mb-2">{item.chinese}</div>
                    <div className="text-xl font-semibold text-primary">{item.pinyin}</div>
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
      </div>
    </div>
  );
};

export default Chinese;
