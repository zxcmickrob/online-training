Online Training


# Установка:
- [Docker](https://www.docker.com/products/docker-desktop/)
- [Python 3.12+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)

# Клонирование и настройка
```bash
git clone <url-репозитория>
cd online-training
```

# Запуск базы данных
```bash
docker-compose up -d
```
Это запустит PostgreSQL на порту `5432`.

# Настройка Backend
```bash
cd backend
# Создание виртуального окружения
python -m venv venv
source venv/bin/scripts/activate

# Установка зависимостей
pip install flask flask-sqlalchemy flask-cors flask-jwt-extended psycopg2-binary python-dotenv flask-migrate

# Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env

# Примените миграции (создание таблиц)
flask db upgrade

# Запуск сервера
python run.py
```
Сервер будет доступен по адресу: `http://127.0.0.1:5000`

Frontend

```bash
cd frontend
npm install
npm run dev
```
Приложение будет доступно по адресу: `http://localhost:5173`


