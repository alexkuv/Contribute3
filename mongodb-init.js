// Скрипт инициализации MongoDB
// Создаёт базу данных и пользователя с правами на чтение/запись

db = db.getSiblingDB('contribute3');

// Создаём пользователя для приложения
db.createUser({
  user: 'contribute3_user',
  pwd: 'contribute3_pass',
  roles: [
    {
      role: 'readWrite',
      db: 'contribute3'
    }
  ]
});

// Создаём коллекцию contributions если её нет
db.createCollection('contributions');

// Создаём индексы для оптимизации
db.contributions.createIndex({ "from": 1 });
db.contributions.createIndex({ "txHash": 1 }, { unique: true });
db.contributions.createIndex({ "timestamp": -1 });

print('MongoDB initialized successfully!');
print('Database: contribute3');
print('User: contribute3_user');
print('Collections: contributions');






