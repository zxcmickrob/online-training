import os
import requests
from flask import request, jsonify
from .models import db, User, Task, SolvedTask
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, get_jwt

def setup_routes(app):

    @app.route('/register', methods=['POST'])
    def register():
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '')
        role = data.get('role', 'student') # Теперь берем из запроса

        if not username or not password: 
            return jsonify({"message": "Заполните все поля"}), 400

        unique = User.query.filter_by(username=username).first()
        if unique: 
            return jsonify({"message": "Аккаунт с таким логином уже существует"}), 409

        password_hash = generate_password_hash(password)

        new_user = User(username=username, password_hash=password_hash, role=role)
        db.session.add(new_user)
        db.session.commit()

        return jsonify({"message": "Регистрация прошла успешно"}), 201


    @app.route('/login', methods=['POST'])
    def login():
        data = request.json
        username = data.get('username')
        password = data.get('password')

        user = User.query.filter_by(username=username).first()

        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({"message": "Неверный логин или пароль"}), 401

        access_token = create_access_token(identity=str(user.id), additional_claims={"role": user.role})

        return jsonify({"access_token": access_token, "role": user.role})


    @app.route('/tasks', methods=['GET'])
    def get_tasks():
        tasks = Task.query.all()
        return jsonify([task.to_dict() for task in tasks]), 200

    @app.route('/tasks/<int:task_id>', methods=['GET'])
    def get_task(task_id):
        task = Task.query.get_or_404(task_id)
        return jsonify(task.to_dict()), 200


    @app.route('/tasks', methods=['POST'])
    @jwt_required()
    def create_task():
        claims = get_jwt()
        if claims.get("role") != 'admin':
            return jsonify({"message": "Доступ запрещен: требуется роль администратора"}), 403

        data = request.get_json()

        new_task = Task(
            number=data.get('number'),
            title=data.get('title'),
            subtopic=data.get('subtopic'),
            question=data.get('question'),
            answer=data.get('answer')
        )

        db.session.add(new_task)
        db.session.commit()

        return jsonify({"message": "Задача успешно создана!"}), 201

    @app.route('/tasks/<int:task_id>', methods=['PUT'])
    @jwt_required()
    def update_task(task_id):
        claims = get_jwt()
        if claims.get("role") != 'admin':
            return jsonify({"message": "Доступ запрещен"}), 403

        task = Task.query.get_or_404(task_id)
        data = request.get_json()

        task.number = data.get('number', task.number)
        task.title = data.get('title', task.title)
        task.subtopic = data.get('subtopic', task.subtopic)
        task.question = data.get('question', task.question)
        task.answer = data.get('answer', task.answer)

        db.session.commit()
        return jsonify({"message": "Задача успешно обновлена"}), 200

    @app.route('/tasks/<int:task_id>', methods=['DELETE'])
    @jwt_required()
    def delete_task(task_id):
        claims = get_jwt()
        if claims.get("role") != 'admin':
            return jsonify({"message": "Доступ запрещен"}), 403

        task = Task.query.get_or_404(task_id)

        SolvedTask.query.filter_by(task_id=task_id).delete()

        db.session.delete(task)
        db.session.commit()
        return jsonify({"message": "Задача удалена"}), 200

    @app.route('/tasks/<int:task_id>/solve', methods=['POST'])
    @jwt_required()
    def solve_task(task_id):
        user_id = get_jwt_identity()
        data = request.get_json()
        user_answer = data.get('answer', '').strip()

        if not user_answer:
            return jsonify({"message": "Введите ответ"}), 400

        task = Task.query.get_or_404(task_id)

        if str(user_answer).lower() != str(task.answer).lower():
            return jsonify({"message": "Неверный ответ. Попробуйте еще раз!"}), 400

        already_solved = SolvedTask.query.filter_by(user_id=int(user_id), task_id=task_id).first()
        if already_solved:
            return jsonify({"message": "Задача уже была решена ранее"}), 200

        new_solve = SolvedTask(user_id=int(user_id), task_id=task_id)
        db.session.add(new_solve)
        db.session.commit()

        return jsonify({"message": "Верно! Задача решена!"}), 201

    @app.route('/statistics', methods=['GET'])
    @jwt_required()
    def get_statistics():
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))

        solved = SolvedTask.query.filter_by(user_id=int(user_id)).all()

        return jsonify({
            "username": user.username,
            "role": user.role,
            "solved_count": len(solved),
            "solved_tasks_ids": [s.task_id for s in solved]
        }), 200

    @app.route('/users', methods=['GET'])
    @jwt_required()
    def get_users():
        claims = get_jwt()
        if claims.get("role") != 'admin':
            return jsonify({"message": "Доступ запрещен"}), 403
            
        users = User.query.all()
        result = []
        for u in users:
            solved_count = SolvedTask.query.filter_by(user_id=u.id).count()
            result.append({
                "id": u.id,
                "username": u.username,
                "role": u.role,
                "solved_count": solved_count
            })
        return jsonify(result), 200

    @app.route('/users/<int:user_id>', methods=['DELETE'])
    @jwt_required()
    def delete_user(user_id):
        claims = get_jwt()
        if claims.get("role") != 'admin':
            return jsonify({"message": "Доступ запрещен"}), 403

        user = User.query.get_or_404(user_id)
        
        # Don't let admin delete themselves
        if str(user.id) == get_jwt_identity():
             return jsonify({"message": "Нельзя удалить самого себя"}), 400

        # Delete associated solved tasks first
        SolvedTask.query.filter_by(user_id=user_id).delete()
        
        db.session.delete(user)
        db.session.commit()
        return jsonify({"message": "Пользователь удален"}), 200

    @app.route('/tasks/<int:task_id>/ai-hint', methods=['POST'])
    def ai_hint(task_id):
        # We don't require jwt here for demo purposes so it works even in demo mode if backend is up
        data = request.get_json()
        user_answer = data.get('answer', '').strip()
        
        if not user_answer:
            return jsonify({"message": "Нет ответа для анализа"}), 400

        task = Task.query.get_or_404(task_id)
        
        yandex_api_key = os.environ.get("YANDEX_API_KEY")
        yandex_folder_id = os.environ.get("YANDEX_FOLDER_ID")
        
        if not yandex_api_key or not yandex_folder_id or yandex_api_key == "your_yandex_api_key_here":
            return jsonify({"hint": "Для умных подсказок нужно указать ключи YANDEX_API_KEY и YANDEX_FOLDER_ID в файле .env бэкенда."}), 200
            
        try:
            prompt = f"""
            Задача: {task.question}
            Правильный ответ: {task.answer}
            Ученик ввел неправильный ответ: {user_answer}
            
            Пожалуйста, выступи в роли опытного репетитора. Твоя задача — дать глубокую, но лаконичную подсказку (2-4 предложения).
            1. Проанализируй ошибку ученика (если она очевидна из его ответа).
            2. Напиши конкретную формулу или теорему, которую нужно применить.
            3. Подскажи первый шаг решения или логический ход, который приведет к ответу.
            
            Важно: НЕ пиши само решение до конца и НЕ называй правильный ответ. 
            Общайся на "ты", будь вовлекающим и профессиональным.
            Используй LaTeX для математических символов (например, $x^2$).
            """
            
            url = "https://llm.api.cloud.yandex.net/foundationModels/v1/completion"
            headers = {
                "Authorization": f"Api-Key {yandex_api_key}",
                "x-folder-id": yandex_folder_id,
                "Content-Type": "application/json"
            }
            payload = {
                "modelUri": f"gpt://{yandex_folder_id}/yandexgpt-lite",
                "completionOptions": {
                    "stream": False,
                    "temperature": 0.6,
                    "maxTokens": "200"
                },
                "messages": [
                    {
                        "role": "system",
                        "text": "Ты - добрый и умный репетитор по математике (профильный уровень)."
                    },
                    {
                        "role": "user",
                        "text": prompt
                    }
                ]
            }
            
            response = requests.post(url, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
            
            result = response.json()
            hint_text = result['result']['alternatives'][0]['message']['text']
            
            return jsonify({"hint": hint_text}), 200
        except Exception as e:
            print("AI Hint Error:", str(e))
            import traceback
            traceback.print_exc()
            return jsonify({"hint": "Яндекс ИИ сейчас отдыхает, попробуй стандартные методы решения."}), 500