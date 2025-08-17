# Contribute3 - Decentralized Crowdfunding DApp

[![Node.js](https://img.shields.io/badge/Node.js-22.17.0-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red.svg)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)

## 📋 Описание

Contribute3 - это децентрализованное приложение (DApp) для краудфандинга на блокчейне Ethereum. Пользователи могут подключать свои MetaMask кошельки и отправлять пожертвования в ETH, которые автоматически конвертируются в внутренние токены XTK.

## 🏗️ Архитектура

Проект состоит из двух основных частей:

- **Frontend** - React приложение с TypeScript
- **Backend** - NestJS API сервер с MongoDB

### Frontend (React + TypeScript)
- **UI Framework**: React 19.1.1 с TypeScript
- **Styling**: Tailwind CSS 4.1.11
- **Build Tool**: Vite 7.1.0
- **Blockchain**: Ethers.js 6.15.0 для взаимодействия с Ethereum
- **State Management**: React Context API
- **Notifications**: React Toastify

### Backend (NestJS + MongoDB)
- **Framework**: NestJS 11.0.1
- **Database**: MongoDB с Mongoose ODM
- **Language**: TypeScript 5.7.3
- **Process Manager**: PM2 для продакшена

## 🚀 Основные возможности

- 🔐 **Подключение MetaMask кошелька**
- 💰 **Отправка пожертвований в ETH**
- 📊 **История пожертвований пользователя**
- 📈 **Общая статистика пожертвований**
- 🔄 **Автоматическая конвертация ETH → XTK токены**
- 💾 **Сохранение данных в MongoDB**

### Доступ к приложению
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **MongoDB**: localhost:27017

### Режим разработки

### Продакшен развертывание



## 📦 Зависимости

### Frontend Dependencies
```json
{
  "@heroicons/react": "^2.2.0",        // Иконки
  "@tailwindcss/vite": "^4.1.11",      // Tailwind CSS для Vite
  "ethers": "^6.15.0",                 // Ethereum библиотека
  "react": "^19.1.1",                  // React framework
  "react-dom": "^19.1.1",              // React DOM
  "react-hook-form": "^7.62.0",        // Формы
  "react-toastify": "^11.0.5",         // Уведомления
  "dotenv": "^17.2.1"                  // Переменные окружения
}
```

### Backend Dependencies
```json
{
  "@nestjs/common": "^11.0.1",         // NestJS core
  "@nestjs/core": "^11.0.1",           // NestJS framework
  "@nestjs/mongoose": "^11.0.3",       // MongoDB интеграция
  "@nestjs/platform-express": "^11.0.1", // Express сервер
  "mongoose": "^8.17.1",               // MongoDB ODM
  "reflect-metadata": "^0.2.2",        // Metadata reflection
  "rxjs": "^7.8.1"                     // Reactive programming
}
```

### Dev Dependencies
- **TypeScript**: 5.8.3
- **ESLint**: 9.32.0
- **Vite**: 7.1.0
- **Tailwind CLI**: 4.1.11
- **PM2**: 6.0.8 (для продакшена)

## 🛠️ Установка и запуск

### Вариант 1: Локальная установка

#### Предварительные требования
- Node.js 22.17.0+
- MongoDB (локально или в облаке)
- MetaMask браузерное расширение

#### Установка
```bash
# Клонирование репозитория
git clone https://github.com/alexkuv/Contribute3.git
cd Contribute3

# Установка корневых зависимостей
npm install

# Установка backend зависимостей
cd backend && npm install

# Установка frontend зависимостей
cd ../frontend && npm install
```

#### Настройка переменных окружения

##### Frontend (.env)
```bash
cd frontend
echo "VITE_DONATION_WALLET_ADDRESS={адресс кошелька}" > .env
echo "VITE_BACKEND_URL=http://localhost:8000" >> .env
```

##### Backend (.env)
```bash
cd backend
echo "MONGODB_URI=mongodb://localhost:27017/contribute3" > .env
echo "PORT=8000" >> .env
```

#### Запуск MongoDB
```bash
# Локально
mongod
```

#### Запуск приложения
```bash
# Разработка (оба сервера одновременно)
npm run dev

# Или по отдельности
npm run backend    # Backend
npm run frontend   # Frontend
```

## 🌐 Доступ к приложению

### Локальная установка
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **MongoDB**: mongodb://localhost:27017

## 📱 Использование

1. **Подключение кошелька**: Нажмите "Connect Ethereum (MetaMask)"
2. **Отправка пожертвования**: Введите сумму в ETH и нажмите "Send Contribution"
3. **Подтверждение**: Подтвердите транзакцию в MetaMask
4. **Просмотр истории**: Ваши пожертвования отображаются в блоке "Your Contributions"

## 🔧 API Endpoints

### Backend API
- `POST /contributions` - Создание пожертвования
- `GET /contributions/me?address={address}` - История пользователя
- `GET /contributions/total` - Общая статистика
- `GET /health` - Health check

## 🏗️ Структура проекта

```
Contribute3/
├── frontend/                 # React приложение
│   ├── src/
│   │   ├── components/      # React компоненты
│   │   ├── pages/          # Страницы приложения
│   │   ├── services/       # API сервисы
│   │   ├── types/          # TypeScript типы
│   │   └── utils/          # Утилиты
│   ├── nginx.conf          # Nginx конфигурация
│   ├── package.json
│   └── vite.config.ts
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── contributions/   # Модуль пожертвований
│   │   ├── schemas/         # MongoDB схемы
│   │   └── main.ts         # Точка входа
│   └── package.json
├── package.json             # Корневые скрипты
└── README.md
```

## 🚀 Скрипты

### Корневые команды
- `npm run dev` - Запуск в режиме разработки
- `npm run prod` - Сборка для продакшена

## 🔒 Безопасность

- Валидация Ethereum адресов
- Проверка баланса перед отправкой
- Безопасная обработка MetaMask ошибок
- CORS настройки для backend
- Валидация входных данных

## 📊 Мониторинг

- **PM2** для управления процессами в продакшене
- **Логирование** ошибок и транзакций
- **Health check** endpoint для backend
- **Nginx** для reverse proxy и SSL

## 🚀 Развертывание на сервере

### 1. Развертывание
```bash
# Клонирование на сервер
git clone https://github.com/alexkuv/Contribute3.git
cd Contribute3

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env файл
```

### 3. Обновление
```bash
# Pull изменений
git pull origin main

# Пересборка и перезапуск
pm2 delete all
npm run prod
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Проект является приватным и не лицензирован.

## 👨‍💻 Автор

**Alex Kuvaldin**
- Email: kuvaldin.ai95@gmail.com
- GitHub: [@alexkuv](https://github.com/alexkuv)

## 🆘 Поддержка

При возникновении проблем:

### Общие проблемы
1. Проверьте логи в консоли браузера
2. Убедитесь, что MongoDB запущена
3. Проверьте настройки MetaMask
4. Создайте issue в GitHub

---

**Contribute3** - Децентрализованное краудфандинг приложение на Ethereum 🚀
