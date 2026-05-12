FROM python:3.12-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y libpq-dev gcc curl && rm -rf /var/lib/apt/lists/*

# Установка Poetry
ENV POETRY_HOME="/opt/poetry"
RUN curl -sSL https://install.python-poetry.org | python3 -
ENV PATH="$POETRY_HOME/bin:$PATH"
RUN poetry config virtualenvs.create false

# Копируем файлы конфигурации
COPY pyproject.toml ./

# Генерируем lock-файл внутри контейнера
RUN poetry lock

# Устанавливаем зависимости
RUN poetry install --no-interaction --no-ansi --no-root

# Копируем остальной код
COPY . .

# Команда для запуска
CMD ["python", "run.py"]
