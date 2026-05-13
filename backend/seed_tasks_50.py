from run import app
from app.models import db, Task, SolvedTask
import random

def generate_math_tasks(count=50):
    tasks = []
    
    # Using $...$ for math parts specifically to allow text parsing on frontend
    topics = [
        {"name": "Планиметрия", 
         "template": "В треугольнике ABC угол C равен 90°, катет AC = {a}, катет BC = {b}. Найдите гипотенузу AB.", 
         "solver": lambda a,b: round((a**2 + b**2)**0.5, 2), "number": 1, "type": "pythagorean"},
        
        {"name": "Стереометрия", 
         "template": "Найдите объем куба, если его диагональ равна ${a}\\sqrt{{3}}$.", 
         "solver": lambda a,b: a**3, "number": 3, "type": "cube_diagonal"},
        
        {"name": "Логарифмические уравнения", 
         "template": "Найдите корень уравнения $\\log_{{{base_log}}}(x - {a}) = {b}$", 
         "solver": lambda base_log, a, b: base_log**b + a, "number": 6, "type": "log_eq"},
        
        {"name": "Производная", 
         "template": "Найдите точку минимума функции $y = x^2 - {a}x + 7$", 
         "solver": lambda a,b: a/2, "number": 11, "type": "quadratic_min"},
        
        {"name": "Текстовые задачи", 
         "template": "Скорость лодки по течению реки {a} км/ч, а против течения {b} км/ч. Найдите скорость течения реки.", 
         "solver": lambda a,b: (a-b)/2, "number": 9, "type": "river_boat"},
    ]

    topic_counts = {topic["name"]: 0 for topic in topics}
    generated_questions = set()

    while len(tasks) < count:
        topic_info = random.choice(topics)
        question_text = ""
        answer_val = ""
        
        if topic_info["type"] == "pythagorean":
            a = random.randint(3, 10)
            b = random.randint(4, 15)
            question_text = topic_info["template"].format(a=a, b=b)
            answer_val = topic_info["solver"](a,b)
            if answer_val != int(answer_val): continue
            answer_val = int(answer_val)

        elif topic_info["type"] == "cube_diagonal":
            side = random.randint(2, 8)
            question_text = topic_info["template"].format(a=side)
            answer_val = topic_info["solver"](side,0)

        elif topic_info["type"] == "log_eq":
            base_log = random.randint(2,5)
            exp_val = random.randint(2,6)
            sub_val = random.randint(1,10)
            question_text = topic_info["template"].format(base_log=base_log, a=sub_val, b=exp_val)
            answer_val = topic_info["solver"](base_log, sub_val, exp_val)

        elif topic_info["type"] == "quadratic_min":
            coeff_a = random.randrange(4, 20, 2)
            question_text = topic_info["template"].format(a=coeff_a)
            answer_val = int(topic_info["solver"](coeff_a, 0))

        elif topic_info["type"] == "river_boat":
            river_speed = random.randrange(2, 6, 2)
            boat_speed_base = random.randint(10, 20)
            speed_down = boat_speed_base + river_speed
            speed_up = boat_speed_base - river_speed
            question_text = topic_info["template"].format(a=speed_down, b=speed_up)
            answer_val = int(topic_info["solver"](speed_down, speed_up))
        
        if question_text in generated_questions:
            continue
            
        topic_counts[topic_info["name"]] += 1
        tasks.append({
            "number": topic_counts[topic_info["name"]],
            "title": topic_info["name"],
            "question": question_text,
            "answer": str(answer_val)
        })
        generated_questions.add(question_text)

    return tasks

with app.app_context():
    print("Удаляю старые записи о решенных задачах из базы данных...")
    db.session.query(SolvedTask).delete()
    db.session.commit()
    print("Старые записи о решенных задачах удалены.")

    print("Удаляю старые задачи из базы данных...")
    db.session.query(Task).delete()
    db.session.commit()
    print("Старые задачи удалены.")

    print("Генерирую и загружаю 50 новых задач в базу данных...")
    tasks_data = generate_math_tasks(50)
    added = 0
    for data in tasks_data:
        task = Task(**data)
        db.session.add(task)
        added += 1
    
    db.session.commit()
    print(f"Готово! Успешно добавлено новых задач: {added}.")
