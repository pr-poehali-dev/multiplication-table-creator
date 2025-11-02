import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TelegramAuthProps {
  onAuth: (user: TelegramUser) => void;
}

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    onTelegramAuth: (user: TelegramUser) => void;
  }
}

const TelegramAuth = ({ onAuth }: TelegramAuthProps) => {
  useEffect(() => {
    window.onTelegramAuth = (user: TelegramUser) => {
      onAuth(user);
    };

    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'your_bot_username';
    
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.innerHTML = '';
      container.appendChild(script);
    }

    return () => {
      delete window.onTelegramAuth;
    };
  }, [onAuth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">🚀 Вход на сайт</CardTitle>
          <CardDescription className="text-lg mt-2">
            Войди через Telegram, чтобы продолжить
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div className="text-center text-gray-600 text-sm">
            <p>✅ Быстрая авторизация</p>
            <p>✅ Безопасно через Telegram</p>
            <p>✅ Не нужно запоминать пароль</p>
          </div>
          <div id="telegram-login-container" className="flex justify-center w-full" />
        </CardContent>
      </Card>
    </div>
  );
};

export default TelegramAuth;