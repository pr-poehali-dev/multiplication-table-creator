# Настройка Telegram авторизации

## Шаг 1: Создание бота

1. Открой **@BotFather** в Telegram
2. Отправь команду `/newbot`
3. Придумай название бота (например: "Мой Сайт Авторизация")
4. Придумай username бота (должен заканчиваться на "bot", например: `mysite_auth_bot`)
5. BotFather пришлёт токен в формате: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

## Шаг 2: Настройка домена

1. Отправь BotFather команду `/setdomain`
2. Выбери своего бота
3. Введи домен сайта (например: `mysite.com` или `preview--multiplication-table-creator.poehali.dev`)

## Шаг 3: Добавление секрета

1. В интерфейсе poehali.dev добавь секрет `TELEGRAM_BOT_TOKEN`
2. Вставь токен, который прислал BotFather

## Шаг 4: Обновление кода

Замени в файле `src/components/TelegramAuth.tsx` строку:
```
data-telegram-login="your_bot_username"
```
на:
```
data-telegram-login="ваш_username_бота"
```

## Готово! 🚀

Теперь пользователи смогут авторизоваться через Telegram.
