import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const vocabularyData = [
  { russian: "Привет", english: "Hello", category: "Приветствия" },
  { russian: "До свидания", english: "Goodbye", category: "Приветствия" },
  { russian: "Спасибо", english: "Thank you", category: "Приветствия" },
  { russian: "Пожалуйста", english: "Please", category: "Приветствия" },
  { russian: "Дом", english: "House", category: "Слова" },
  { russian: "Кот", english: "Cat", category: "Животные" },
  { russian: "Собака", english: "Dog", category: "Животные" },
  { russian: "Яблоко", english: "Apple", category: "Еда" },
  { russian: "Вода", english: "Water", category: "Еда" },
  { russian: "Книга", english: "Book", category: "Слова" },
  { russian: "Стол", english: "Table", category: "Слова" },
  { russian: "Стул", english: "Chair", category: "Слова" },
  { russian: "Солнце", english: "Sun", category: "Природа" },
  { russian: "Луна", english: "Moon", category: "Природа" },
  { russian: "Дерево", english: "Tree", category: "Природа" },
];

const English = () => {
  const navigate = useNavigate();
  const [learnedWords, setLearnedWords] = useState<{ [key: string]: boolean }>({});
  const [testMode, setTestMode] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const saved = localStorage.getItem("learnedWords");
    if (saved) {
      setLearnedWords(JSON.parse(saved));
    }
  }, []);

  const speakWord = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new window.SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleWord = (word: string, englishText: string) => {
    speakWord(englishText);
    const newLearned = { ...learnedWords, [word]: !learnedWords[word] };
    setLearnedWords(newLearned);
    localStorage.setItem("learnedWords", JSON.stringify(newLearned));
  };

  const totalWords = vocabularyData.length;
  const learnedCount = Object.values(learnedWords).filter(Boolean).length;
  const progressPercentage = Math.round((learnedCount / totalWords) * 100);

  const handleTestAnswer = () => {
    const currentWord = vocabularyData[currentWordIndex];
    const isCorrect = userAnswer.toLowerCase().trim() === currentWord.english.toLowerCase();
    
    if (isCorrect) {
      setScore({ ...score, correct: score.correct + 1, total: score.total + 1 });
    } else {
      setScore({ ...score, total: score.total + 1 });
    }
    
    setShowAnswer(true);
  };

  const nextWord = () => {
    if (currentWordIndex < vocabularyData.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
      setUserAnswer("");
      setShowAnswer(false);
    } else {
      setTestMode(false);
      setCurrentWordIndex(0);
      setUserAnswer("");
      setShowAnswer(false);
    }
  };

  const startTest = () => {
    setTestMode(true);
    setScore({ correct: 0, total: 0 });
    setCurrentWordIndex(0);
    setUserAnswer("");
    setShowAnswer(false);
  };

  const categories = Array.from(new Set(vocabularyData.map(word => word.category)));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              size="icon"
            >
              <Icon name="ArrowLeft" size={20} />
            </Button>
            <h1 className="text-5xl font-bold text-foreground">Английский язык</h1>
          </div>
          <p className="text-lg text-muted-foreground">Учи новые слова и фразы</p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setTestMode(!testMode)}
            variant={testMode ? "default" : "outline"}
            className="gap-2"
          >
            <Icon name={testMode ? "BookOpen" : "GraduationCap"} size={20} />
            {testMode ? "Учить слова" : "Проверить знания"}
          </Button>
        </div>

        {!testMode ? (
          <div className="space-y-8">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Твой прогресс</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-3">
                  <div className="text-5xl font-bold text-primary">
                    {progressPercentage}%
                  </div>
                  <Progress value={progressPercentage} className="h-4" />
                  <p className="text-lg text-muted-foreground">
                    Выучено: {learnedCount} из {totalWords} слов
                  </p>
                </div>
              </CardContent>
            </Card>

            {categories.map((category) => (
              <Card key={category} className="border-2">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="text-2xl text-primary">{category}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    {vocabularyData
                      .filter((word) => word.category === category)
                      .map((word, index) => {
                        const isLearned = learnedWords[word.russian];
                        return (
                          <div
                            key={index}
                            onClick={() => toggleWord(word.russian, word.english)}
                            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer transition-all ${
                              isLearned
                                ? "bg-secondary/20 border-2 border-secondary"
                                : "bg-muted/30 hover:bg-muted/50 border-2 border-transparent"
                            }`}
                          >
                            <div className="flex flex-col gap-1">
                              <span className="text-lg font-medium">{word.russian}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{word.english}</span>
                                <Icon name="Volume2" size={16} className="text-primary" />
                              </div>
                            </div>
                            {isLearned && (
                              <Icon name="CheckCircle2" size={24} className="text-secondary" />
                            )}
                          </div>
                        );
                      })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Тест знаний</CardTitle>
              <div className="text-center text-muted-foreground">
                Слово {currentWordIndex + 1} из {vocabularyData.length}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {score.total === 0 ? (
                <div className="text-center space-y-6">
                  <p className="text-lg">Переведи слово на английский</p>
                  <div className="text-4xl font-bold text-primary">
                    {vocabularyData[currentWordIndex].russian}
                  </div>
                  <Input
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Введи перевод"
                    className="text-center text-xl"
                    onKeyDown={(e) => e.key === "Enter" && handleTestAnswer()}
                  />
                  <Button onClick={handleTestAnswer} className="w-full">
                    Проверить
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {!showAnswer ? (
                    <>
                      <p className="text-lg text-center">Переведи слово на английский</p>
                      <div className="text-4xl font-bold text-primary text-center">
                        {vocabularyData[currentWordIndex].russian}
                      </div>
                      <Input
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Введи перевод"
                        className="text-center text-xl"
                        onKeyDown={(e) => e.key === "Enter" && handleTestAnswer()}
                      />
                      <Button onClick={handleTestAnswer} className="w-full">
                        Проверить
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="text-center space-y-4">
                        {userAnswer.toLowerCase().trim() === vocabularyData[currentWordIndex].english.toLowerCase() ? (
                          <div className="text-secondary text-xl font-semibold flex items-center justify-center gap-2">
                            <Icon name="CheckCircle2" size={28} />
                            Правильно!
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-destructive text-xl font-semibold flex items-center justify-center gap-2">
                              <Icon name="XCircle" size={28} />
                              Неправильно
                            </div>
                            <p className="text-lg">
                              Правильный ответ: <span className="font-bold text-secondary">{vocabularyData[currentWordIndex].english}</span>
                            </p>
                          </div>
                        )}
                        <div className="pt-4">
                          <p className="text-muted-foreground">
                            Правильно: {score.correct} из {score.total}
                          </p>
                        </div>
                      </div>
                      <Button onClick={nextWord} className="w-full">
                        {currentWordIndex < vocabularyData.length - 1 ? "Следующее слово" : "Завершить тест"}
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default English;