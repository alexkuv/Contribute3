// Получаем параметры из переменных окружения
const DB_NAME = process.env.MONGO_DATABASE;
const APP_USER = process.env.MONGO_APP_USER;
const APP_PASS = process.env.MONGO_APP_PASSWORD;

// Создаём базу данных и пользователя
db = db.getSiblingDB(DB_NAME);

db.createUser({
  user: APP_USER,
  pwd: APP_PASS,
  roles: [{
    role: 'readWrite',
    db: DB_NAME
  }]
});

// Создаём коллекции и индексы
db.createCollection('contributions');
db.contributions.createIndex({ "from": 1 });
db.contributions.createIndex({ "txHash": 1 }, { unique: true });
db.contributions.createIndex({ "timestamp": -1 });

print(`MongoDB initialized successfully!
Database: ${DB_NAME}
User: ${APP_USER}
Collections: contributions`);