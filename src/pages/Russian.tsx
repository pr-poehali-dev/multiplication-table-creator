import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

interface WordProgress {
  [key: string]: boolean;
}

const russianWords = {
  grammar: [
    { word: "Существительное", definition: "Часть речи, обозначающая предмет", example: "дом, книга, собака" },
    { word: "Глагол", definition: "Часть речи, обозначающая действие", example: "бегать, читать, писать" },
    { word: "Прилагательное", definition: "Часть речи, обозначающая признак", example: "красивый, большой, умный" },
    { word: "Наречие", definition: "Часть речи, обозначающая признак действия", example: "быстро, медленно, хорошо" },
    { word: "Местоимение", definition: "Слово, указывающее на предмет", example: "я, ты, он, она, оно" },
    { word: "Предлог", definition: "Служебная часть речи", example: "в, на, под, над, около" },
  ],
  punctuation: [
    { word: "Точка (.)", definition: "Завершает повествовательное предложение", example: "Я иду в школу." },
    { word: "Запятая (,)", definition: "Разделяет части предложения", example: "Я люблю читать, писать, рисовать." },
    { word: "Восклицательный знак (!)", definition: "Выражает эмоции", example: "Какой красивый день!" },
    { word: "Вопросительный знак (?)", definition: "Завершает вопрос", example: "Как тебя зовут?" },
    { word: "Тире (—)", definition: "Разделяет части предложения", example: "Москва — столица России." },
    { word: "Двоеточие (:)", definition: "Указывает на пояснение", example: "Он сказал: «Привет»." },
  ],
  spelling: [
    { word: "ЖИ-ШИ", definition: "Пишется с буквой И", example: "жизнь, машина, шило" },
    { word: "ЧА-ЩА", definition: "Пишется с буквой А", example: "чаша, роща, туча" },
    { word: "ЧУ-ЩУ", definition: "Пишется с буквой У", example: "чудо, щука, ищу" },
    { word: "ЧК-ЧН", definition: "Пишется без Ь", example: "точка, ночной, речка" },
    { word: "НЕ с глаголами", definition: "Пишется раздельно", example: "не знаю, не хочу, не буду" },
    { word: "Безударные гласные", definition: "Проверяй ударением", example: "вода́ — во́ды, леса́ — лес" },
  ],
  literary: [
    { word: "Эпитет", definition: "Образное определение", example: "золотая осень, синее море" },
    { word: "Метафора", definition: "Скрытое сравнение", example: "горит костёр рябины красной" },
    { word: "Сравнение", definition: "Сопоставление с помощью КАК", example: "лёгкий как пёрышко" },
    { word: "Олицетворение", definition: "Наделение предметов человеческими качествами", example: "ветер воет, солнце смеётся" },
    { word: "Гипербола", definition: "Художественное преувеличение", example: "сто лет не виделись" },
    { word: "Антонимы", definition: "Слова с противоположным значением", example: "день — ночь, добрый — злой" },
  ],
};

const Russian = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<WordProgress>({});
  const [activeTab, setActiveTab] = useState<"grammar" | "punctuation" | "spelling" | "literary">("grammar");

  useEffect(() => {
    const saved = localStorage.getItem("russianProgress");
    if (saved) {
      setProgress(JSON.parse(saved));
    }
  }, []);

  const toggleWord = (key: string) => {
    const newProgress = { ...progress, [key]: !progress[key] };
    setProgress(newProgress);
    localStorage.setItem("russianProgress", JSON.stringify(newProgress));
  };

  const resetProgress = () => {
    setProgress({});
    localStorage.removeItem("russianProgress");
  };

  const totalWords = 
    russianWords.grammar.length + 
    russianWords.punctuation.length + 
    russianWords.spelling.length + 
    russianWords.literary.length;
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
          <h1 className="text-5xl font-bold mb-4 text-foreground">🇷🇺 Русский язык</h1>
          <p className="text-lg text-muted-foreground">Грамматика, пунктуация и литературные приёмы</p>
        </div>

        <Card className="mb-8 border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-center">📊 Твой прогресс</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-5xl font-bold text-primary mb-2">{progressPercentage}%</div>
              <Progress value={progressPercentage} className="h-3 mb-2" />
              <p className="text-muted-foreground">Выучено: {learnedWords} из {totalWords} правил</p>
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
            onClick={() => setActiveTab("grammar")}
            variant={activeTab === "grammar" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="BookOpen" size={20} />
            Грамматика
          </Button>
          <Button
            onClick={() => setActiveTab("punctuation")}
            variant={activeTab === "punctuation" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="Type" size={20} />
            Пунктуация
          </Button>
          <Button
            onClick={() => setActiveTab("spelling")}
            variant={activeTab === "spelling" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="PenTool" size={20} />
            Орфография
          </Button>
          <Button
            onClick={() => setActiveTab("literary")}
            variant={activeTab === "literary" ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name="Sparkles" size={20} />
            Литература
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {russianWords[activeTab].map((item, index) => {
            const key = `${activeTab}-${index}`;
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
                <CardHeader>
                  <CardTitle className="text-xl text-primary">{item.word}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-muted-foreground">{item.definition}</p>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium">Примеры:</p>
                    <p className="text-sm italic">{item.example}</p>
                  </div>
                  {isLearned && (
                    <div className="flex justify-center pt-2">
                      <Icon name="CheckCircle2" size={24} className="text-secondary" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Russian;
