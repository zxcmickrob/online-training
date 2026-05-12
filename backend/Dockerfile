FROM python:3.12-slim

WORKDIR /app

# Установка системных зависимостей для psycopg2
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Команда для запуска
CMD ["python", "run.py"]
