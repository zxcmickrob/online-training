from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='student')

    solved_tasks = db.relationship('SolvedTask', backref='user', lazy=True)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(100), nullable=False)
    subtopic = db.Column(db.String(100), nullable=True)
    question = db.Column(db.Text, nullable=True)
    answer = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "number": self.number,
            "title": self.title,
            "subtopic": self.subtopic,
            "question": self.question,
            "answer": self.answer
        }

class SolvedTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('task.id'), nullable=False)
    solved_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

