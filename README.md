# Online Training

### Требования
- Python 3.12+ & Poetry
- Node.js 18+
- Docker & Docker Compose

---
### Быстрый запуск
#### Настройка переменных
```bash
cd backend
cp .env.example .env
cd ..
```
#### Сборка и запуск
```bash
docker-compose up --build -d
```
####  Миграцции и загрузка заданий
```bash
docker-compose exec backend flask db upgrade
docker-compose exec backend python load_tasks.py
```

### Пошаговый запуск
#### База данных
```bash
docker-compose up -d db
```

#### Backend
```bash
cd backend
cp .env.example .env
poetry install
poetry run flask db upgrade
poetry run python load_tasks.py
poetry run python run.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```