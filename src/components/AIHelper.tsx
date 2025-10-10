import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Icon from "@/components/ui/icon";

interface AIHelperProps {
  question: string;
  onClose: () => void;
}

const AIHelper = ({ question, onClose }: AIHelperProps) => {
  const [answer, setAnswer] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const askAI = async () => {
    setLoading(true);
    setError("");
    setAnswer("");

    try {
      const response = await fetch("https://functions.poehali.dev/fb0197c7-e211-42bc-8d9b-dfd4d4f82792", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ошибка при получении ответа");
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Произошла ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-primary/30 shadow-lg">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Sparkles" size={24} className="text-primary" />
            <h3 className="text-xl font-bold">AI Помощник</h3>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="bg-muted/30 p-4 rounded-lg">
          <p className="text-lg font-medium">{question}</p>
        </div>

        {!answer && !loading && !error && (
          <Button onClick={askAI} className="w-full gap-2" size="lg">
            <Icon name="Brain" size={20} />
            Попросить помощи
          </Button>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Думаю...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border-2 border-destructive/30 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Icon name="AlertCircle" size={20} className="text-destructive mt-1" />
              <div>
                <p className="font-medium text-destructive">Ошибка</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {answer && (
          <div className="space-y-3">
            <div className="bg-secondary/10 border-2 border-secondary/30 p-4 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <Icon name="Lightbulb" size={20} className="text-secondary mt-1" />
                <p className="font-medium text-secondary">Решение:</p>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{answer}</p>
              </div>
            </div>
            <Button onClick={askAI} variant="outline" className="w-full gap-2">
              <Icon name="RefreshCw" size={16} />
              Спросить ещё раз
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIHelper;
