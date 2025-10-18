import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const Phone = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("Привет! Это звонок из твоего приложения.");
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [twilioNumber, setTwilioNumber] = useState<string | null>(null);
  const [callSid, setCallSid] = useState<string | null>(null);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("8") && digits.length === 11) {
      return "+7" + digits.slice(1);
    }
    if (!digits.startsWith("+")) {
      return "+" + digits;
    }
    return digits;
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPhoneNumber(value);
  };

  const makeCall = async () => {
    if (!phoneNumber.trim()) {
      alert("Введи номер телефона!");
      return;
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    
    if (formattedNumber.length < 10) {
      alert("Некорректный номер телефона!");
      return;
    }

    setCalling(true);
    setCallStatus("Соединяем...");

    try {
      const response = await fetch("https://functions.poehali.dev/6133c61a-3ff5-407d-90a2-c3bc5277aaf7", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          message: message || "Привет! Это звонок из твоего приложения.",
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCallStatus(`✅ Звоним на ${formattedNumber}!`);
        setCallSid(data.callSid);
        setTwilioNumber(data.from);
        
        setTimeout(() => {
          checkCallStatus(data.callSid);
        }, 3000);
      } else {
        setCallStatus(`❌ Ошибка: ${data.error || "Не удалось позвонить"}`);
      }
    } catch (error) {
      setCallStatus("❌ Ошибка соединения с сервером");
      console.error(error);
    } finally {
      setCalling(false);
    }
  };

  const checkCallStatus = async (sid: string) => {
    try {
      const response = await fetch(
        `https://functions.poehali.dev/6133c61a-3ff5-407d-90a2-c3bc5277aaf7?callSid=${sid}`
      );
      const data = await response.json();

      if (response.ok) {
        const statusMap: { [key: string]: string } = {
          queued: "⏳ В очереди",
          ringing: "📞 Звоним...",
          "in-progress": "☎️ Разговор",
          completed: "✅ Завершён",
          busy: "📵 Занято",
          failed: "❌ Не удалось",
          "no-answer": "🔇 Не отвечает",
        };

        setCallStatus(
          `Статус: ${statusMap[data.status] || data.status}${
            data.duration ? ` (${data.duration} сек)` : ""
          }`
        );

        if (!["completed", "busy", "failed", "no-answer"].includes(data.status)) {
          setTimeout(() => checkCallStatus(sid), 2000);
        }
      }
    } catch (error) {
      console.error("Ошибка проверки статуса:", error);
    }
  };

  const addDigit = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  const deleteDigit = () => {
    setPhoneNumber((prev) => prev.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={() => navigate("/")} variant="outline" size="icon">
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-indigo-700">📞 Телефон</h1>
        </div>

        <Card className="p-6 mb-4 bg-white/90 backdrop-blur">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Номер телефона
              </label>
              <Input
                type="tel"
                placeholder="+7 900 123-45-67"
                value={phoneNumber}
                onChange={handlePhoneInput}
                className="text-2xl text-center font-mono"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Формат: +7 или 8 для России, +1 для США и т.д.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((digit) => (
                <Button
                  key={digit}
                  onClick={() => addDigit(digit)}
                  variant="outline"
                  className="h-16 text-2xl font-bold hover:bg-indigo-100"
                >
                  {digit}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button onClick={deleteDigit} variant="outline" className="h-12">
                <Icon name="Delete" size={20} />
                Стереть
              </Button>
              <Button
                onClick={() => setPhoneNumber("")}
                variant="outline"
                className="h-12"
              >
                <Icon name="X" size={20} />
                Очистить
              </Button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Сообщение (текст озвучится)
              </label>
              <Input
                type="text"
                placeholder="Привет! Это звонок..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="text-base"
              />
            </div>

            <Button
              onClick={makeCall}
              disabled={calling || !phoneNumber.trim()}
              size="lg"
              className="w-full h-16 text-xl bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
            >
              {calling ? (
                <>
                  <Icon name="Loader2" size={24} className="animate-spin" />
                  Звоним...
                </>
              ) : (
                <>
                  <Icon name="Phone" size={24} />
                  Позвонить
                </>
              )}
            </Button>

            {callStatus && (
              <div
                className={`p-4 rounded-lg text-center font-medium ${
                  callStatus.includes("❌")
                    ? "bg-red-100 text-red-700"
                    : callStatus.includes("✅")
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {callStatus}
              </div>
            )}

            {twilioNumber && (
              <div className="text-sm text-gray-600 text-center">
                Звонок с номера: <strong>{twilioNumber}</strong>
              </div>
            )}

            {callSid && (
              <div className="text-xs text-gray-400 text-center font-mono">
                ID звонка: {callSid}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Icon name="Info" size={20} className="text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Как это работает:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Каждый пользователь получает уникальный Twilio номер</li>
                <li>Звонки совершаются через Twilio API</li>
                <li>Текст сообщения озвучивается голосом</li>
                <li>Поддержка международных номеров</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-4 p-4 bg-white/80 backdrop-blur rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Icon name="Settings" size={18} />
            Быстрые номера
          </h3>
          <div className="space-y-2">
            <Button
              onClick={() => setPhoneNumber("+79001234567")}
              variant="outline"
              className="w-full justify-start"
              size="sm"
            >
              <Icon name="User" size={16} />
              Пример: +7 900 123-45-67
            </Button>
            <Button
              onClick={() => setPhoneNumber("+14155551234")}
              variant="outline"
              className="w-full justify-start"
              size="sm"
            >
              <Icon name="User" size={16} />
              Пример: +1 415 555-1234 (США)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Phone;
