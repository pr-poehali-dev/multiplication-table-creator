import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

interface PhoneAuthProps {
  onAuth: (user: { phone: string; name: string }) => void;
  onClose?: () => void;
}

const PhoneAuth = ({ onAuth, onClose }: PhoneAuthProps) => {
  const [step, setStep] = useState<'phone' | 'code' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    if (digits.length <= 1) return `+${digits}`;
    if (digits.length <= 4) return `+${digits.slice(0, 1)} (${digits.slice(1)}`;
    if (digits.length <= 7) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
    if (digits.length <= 9) return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    setError('');
  };

  const handleSendCode = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 11) {
      setError('Введите корректный номер телефона');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('https://functions.poehali.dev/4b832390-804f-48e1-889c-a7717a64a5e7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send_code', phone: digits })
      });

      const data = await response.json();
      
      if (response.ok) {
        setStep('code');
      } else {
        setError(data.error || 'Ошибка отправки кода');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 4) {
      setError('Введите 4-значный код');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const digits = phone.replace(/\D/g, '');
      const response = await fetch('https://functions.poehali.dev/4b832390-804f-48e1-889c-a7717a64a5e7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_code', phone: digits, code })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.isNewUser) {
          setStep('name');
        } else {
          onAuth({ phone: digits, name: data.name });
        }
      } else {
        setError(data.error || 'Неверный код');
      }
    } catch (err) {
      setError('Ошибка проверки кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetName = async () => {
    if (name.trim().length < 2) {
      setError('Имя должно быть не менее 2 символов');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const digits = phone.replace(/\D/g, '');
      const response = await fetch('https://functions.poehali.dev/4b832390-804f-48e1-889c-a7717a64a5e7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_name', phone: digits, name: name.trim() })
      });

      const data = await response.json();
      
      if (response.ok) {
        onAuth({ phone: digits, name: name.trim() });
      } else {
        setError(data.error || 'Ошибка сохранения имени');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Вход по телефону</CardTitle>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <Icon name="X" size={20} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Номер телефона</label>
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={handlePhoneChange}
                disabled={isLoading}
                className="text-lg"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button 
              onClick={handleSendCode} 
              disabled={isLoading || phone.replace(/\D/g, '').length < 11}
              className="w-full"
            >
              {isLoading ? 'Отправка...' : 'Получить код'}
            </Button>
          </>
        )}

        {step === 'code' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Код из SMS</label>
              <p className="text-sm text-muted-foreground">
                Отправлен на {phone}
              </p>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="____"
                maxLength={4}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                disabled={isLoading}
                className="text-2xl text-center tracking-widest"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <Button 
                onClick={() => setStep('phone')} 
                variant="outline"
                disabled={isLoading}
                className="flex-1"
              >
                Назад
              </Button>
              <Button 
                onClick={handleVerifyCode} 
                disabled={isLoading || code.length !== 4}
                className="flex-1"
              >
                {isLoading ? 'Проверка...' : 'Подтвердить'}
              </Button>
            </div>
          </>
        )}

        {step === 'name' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ваше имя</label>
              <p className="text-sm text-muted-foreground">
                Как к вам обращаться?
              </p>
              <Input
                type="text"
                placeholder="Введите имя"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                className="text-lg"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button 
              onClick={handleSetName} 
              disabled={isLoading || name.trim().length < 2}
              className="w-full"
            >
              {isLoading ? 'Сохранение...' : 'Продолжить'}
            </Button>
          </>
        )}

        <div className="pt-4 border-t text-center text-sm text-muted-foreground">
          Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
        </div>
      </CardContent>
    </Card>
  );
};

export default PhoneAuth;