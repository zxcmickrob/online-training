from run import app
from app.models import db

with app.app_context():
    print("Создаю таблицы в базе данных...")
    db.create_all()
    print("Таблицы успешно созданы!")
