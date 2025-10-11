import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AIWriter = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [type, setType] = useState<"essay" | "report" | "story" | "poem">("essay");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const generateText = async () => {
    if (!topic.trim()) {
      toast.error("Введите тему!");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const response = await fetch("https://functions.poehali.dev/62a855d4-339b-4a03-a964-e21c858b9015", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          type,
          length,
        }),
      });

      if (!response.ok) {
        throw new Error("Ошибка генерации");
      }

      const data = await response.json();
      setResult(data.text);
      toast.success("Текст успешно сгенерирован! ✨");
    } catch (error) {
      toast.error("Не удалось сгенерировать текст. Попробуй ещё раз.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success("Текст скопирован в буфер обмена!");
  };

  const downloadText = () => {
    const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic.slice(0, 30)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Файл загружен!");
  };

  const typeNames = {
    essay: "Сочинение",
    report: "Реферат",
    story: "Рассказ",
    poem: "Стихотворение",
  };

  const lengthNames = {
    short: "Короткий (1-2 абзаца)",
    medium: "Средний (3-5 абзацев)",
    long: "Длинный (6+ абзацев)",
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
          <h1 className="text-5xl font-bold mb-4 text-foreground">🤖 AI Помощник</h1>
          <p className="text-lg text-muted-foreground">Генерация рефератов, сочинений и текстов с помощью ИИ</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="border-2">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-2xl">⚙️ Настройки генерации</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Тема текста</label>
                <Input
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Например: Космос и его изучение"
                  className="text-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Тип текста</label>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(typeNames) as Array<keyof typeof typeNames>).map((t) => (
                    <Button
                      key={t}
                      onClick={() => setType(t)}
                      variant={type === t ? "default" : "outline"}
                      className="h-auto py-4"
                    >
                      {typeNames[t]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Размер текста</label>
                <div className="grid gap-3">
                  {(Object.keys(lengthNames) as Array<keyof typeof lengthNames>).map((l) => (
                    <Button
                      key={l}
                      onClick={() => setLength(l)}
                      variant={length === l ? "default" : "outline"}
                      className="h-auto py-3 text-left justify-start"
                    >
                      {lengthNames[l]}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={generateText}
                disabled={loading || !topic.trim()}
                className="w-full text-lg py-6"
                size="lg"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Генерирую...
                  </>
                ) : (
                  <>
                    <Icon name="Sparkles" size={20} className="mr-2" />
                    Сгенерировать текст
                  </>
                )}
              </Button>

              <div className="p-4 bg-blue-500/10 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Совет:</strong> Чем точнее тема, тем лучше результат. Например: "История древнего Рима" вместо просто "Рим".
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="bg-green-500/5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">📝 Результат</CardTitle>
                {result && (
                  <div className="flex gap-2">
                    <Button
                      onClick={copyToClipboard}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Icon name="Copy" size={16} />
                      Копировать
                    </Button>
                    <Button
                      onClick={downloadText}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <Icon name="Download" size={16} />
                      Скачать
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {!result && !loading && (
                <div className="text-center py-20 text-muted-foreground">
                  <Icon name="FileText" size={64} className="mx-auto mb-4 opacity-20" />
                  <p>Здесь появится сгенерированный текст</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-20">
                  <Icon name="Loader2" size={64} className="mx-auto mb-4 animate-spin text-primary" />
                  <p className="text-lg font-semibold">Генерирую текст...</p>
                  <p className="text-sm text-muted-foreground mt-2">Это может занять до 30 секунд</p>
                </div>
              )}

              {result && (
                <Textarea
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="min-h-[500px] text-base leading-relaxed"
                  placeholder="Сгенерированный текст появится здесь..."
                />
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8 border-2 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-yellow-600" />
              Важно знать
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 mt-0.5" />
                <span>AI-помощник создаёт уникальный текст, но проверяй его на точность</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 mt-0.5" />
                <span>Используй как основу для своей работы, добавляй свои мысли</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="Check" size={20} className="text-green-600 mt-0.5" />
                <span>Можешь редактировать текст прямо в окне результата</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="AlertCircle" size={20} className="text-orange-600 mt-0.5" />
                <span>Не забывай указывать источники при использовании в школьных работах</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIWriter;