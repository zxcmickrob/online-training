from run import app
from app.models import db, Task
import random

def generate_math_tasks(count=50):
    tasks = []
    topics = [
        ("Планиметрия", "В треугольнике ABC угол C равен 90°, AC = {a}, BC = {b}. Найдите гипотенузу AB.", lambda a,b: (a**2 + b**2)**0.5, 3, 15),
        ("Стереометрия", "Найдите объем куба, если его диагональ равна ${a}\\sqrt{{3}}$.", lambda a,b: a**3, 2, 10),
        ("Логарифмические уравнения", "Найдите корень уравнения $\\log_2(x - {a}) = {b}$", lambda a,b: 2**b + a, 1, 6),
        ("Производная", "Найдите точку минимума функции $y = x^2 - {a}x + 7$", lambda a,b: a/2, 4, 20, 2),
        ("Текстовые задачи", "Скорость лодки по течению реки {a} км/ч, а против течения {b} км/ч. Найдите скорость течения реки.", lambda a,b: (a-b)/2, 10, 30, 2),
    ]

    for i in range(count):
        topic_name, q_template, solver, min_val, max_val, *step_val = random.choice(topics)
        step = step_val[0] if step_val else 1
        
        # To ensure integer solutions for simple generators, we pick values carefully.
        a = random.randrange(min_val, max_val, step)
        
        # specific logic for pythagorean triples if it's the first topic
        if topic_name == "Планиметрия":
            triples = [(3,4,5), (5,12,13), (6,8,10), (8,15,17), (9,12,15)]
            t_a, t_b, t_c = random.choice(triples)
            q = q_template.format(a=t_a, b=t_b)
            ans = str(t_c)
            number = 1
        elif topic_name == "Стереометрия":
            q = q_template.format(a=a)
            ans = str(solver(a, 0))
            number = 3
        elif topic_name == "Логарифмические уравнения":
            b = random.randint(2, 6)
            q = q_template.format(a=a, b=b)
            ans = str(solver(a, b))
            number = 6
        elif topic_name == "Производная":
            q = q_template.format(a=a)
            ans = str(int(solver(a, 0)))
            number = 11
        elif topic_name == "Текстовые задачи":
            river = random.randint(2, 5)
            boat = random.randint(10, 20)
            t_a = boat + river
            t_b = boat - river
            q = q_template.format(a=t_a, b=t_b)
            ans = str(int(solver(t_a, t_b)))
            number = 9
            
        tasks.append({
            "number": number,
            "title": topic_name + f" (Вариант {i+1})",
            "question": q,
            "answer": ans
        })
    return tasks

with app.app_context():
    print("Генерирую и загружаю 50 новых задач в базу данных...")
    tasks_data = generate_math_tasks(50)
    added = 0
    for data in tasks_data:
        existing = Task.query.filter_by(question=data['question']).first()
        if not existing:
            task = Task(**data)
            db.session.add(task)
            added += 1
    
    db.session.commit()
    print(f"Готово! Успешно добавлено уникальных задач: {added}.")
