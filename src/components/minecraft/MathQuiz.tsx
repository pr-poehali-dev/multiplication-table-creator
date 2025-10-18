import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MathQuestion } from "./types";

interface MathQuizProps {
  question: MathQuestion;
  answer: string;
  onAnswerChange: (value: string) => void;
  onSubmit: () => void;
}

const MathQuiz = ({ question, answer, onAnswerChange, onSubmit }: MathQuizProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="p-8 max-w-md w-full bg-white">
        <h2 className="text-2xl font-bold mb-4 text-center">⏰ Перерыв на математику!</h2>
        <p className="text-center text-lg mb-6">
          Реши пример, чтобы продолжить играть:
        </p>
        <div className="text-4xl font-bold text-center mb-6">
          {question.a} × {question.b} = ?
        </div>
        <Input
          type="number"
          value={answer}
          onChange={(e) => onAnswerChange(e.target.value)}
          className="mb-4 text-2xl text-center"
          placeholder="Твой ответ"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          autoFocus
        />
        <Button onClick={onSubmit} className="w-full text-lg">
          Проверить ответ
        </Button>
      </Card>
    </div>
  );
};

export default MathQuiz;
