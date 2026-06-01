import pandas as pd
from run import app
from app.models import db, Task

def load_tasks(filename):

    try:
        df = pd.read_excel(filename)
    except Exception as e:
        print(f"Ошибка при чтении файла: {e}")
        return

    with app.app_context():
        added = 0
        skipped = 0
   
        for index, row in df.iterrows():
            question_text = str(row['question']).strip()
            
  
            raw_answer = row['answer']
            if isinstance(raw_answer, float) and raw_answer.is_integer():
                answer_text = str(int(raw_answer))
            else:
                answer_text = str(raw_answer).strip()

            exists = Task.query.filter_by(question=question_text).first()
   
            if not exists:
                new_task = Task(
                    number=int(row['number']),
                    title=str(row['title']),
                    subtopic=str(row['subtopic']),
                    question=question_text,
                    answer=answer_text
                )
                db.session.add(new_task)
                added += 1
            else:
                skipped += 1

        db.session.commit()
        print(f"Добавлено: {added}, Пропущено: {skipped}")


if __name__ == "__main__":
    load_tasks('tasks.xlsx')