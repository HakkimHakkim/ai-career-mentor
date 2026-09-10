from app.db import SessionLocal
from app.models.learning import (
    LearningCourse,
    LearningLesson,
    LearningQuiz,
    QuizQuestion
)


courses_data = [
    {
        "title": "Python for Data Analysis",
        "description": "Learn Python fundamentals and use Python for practical data analysis.",
        "category": "Data",
        "difficulty": "beginner",
        "instructor": "AI Career Mentor",
        "provider": "AI Career Mentor",
        "duration_hours": 20,
        "estimated_weeks": 4,
        "rating": 4.7,
        "total_reviews": 0,
        "price": 0,
        "is_free": True,

        "lessons": [
            {
                "title": "Python Basics",
                "description": "Learn Python syntax, variables and basic programming concepts.",
                "content": "Learn variables, data types, operators and basic Python syntax.",
                "order": 1,
                "duration_minutes": 30,
                "quiz": [
                    {
                        "question_text": "Which keyword is used to define a function in Python?",
                        "question_type": "multiple_choice",
                        "options": ["func", "define", "def", "function"],
                        "correct_answer": "def",
                        "explanation": "Python uses the def keyword to define functions.",
                        "order": 1
                    },
                    {
                        "question_text": "Which data type stores text in Python?",
                        "question_type": "multiple_choice",
                        "options": ["int", "str", "float", "bool"],
                        "correct_answer": "str",
                        "explanation": "The str type is used for text.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "Variables and Data Types",
                "description": "Understand Python variables and common data types.",
                "content": "Learn strings, integers, floats, booleans and lists.",
                "order": 2,
                "duration_minutes": 35,
                "quiz": [
                    {
                        "question_text": "Which type represents whole numbers?",
                        "question_type": "multiple_choice",
                        "options": ["str", "int", "float", "list"],
                        "correct_answer": "int",
                        "explanation": "int represents whole numbers.",
                        "order": 1
                    },
                    {
                        "question_text": "Which value represents True or False?",
                        "question_type": "multiple_choice",
                        "options": ["int", "str", "bool", "list"],
                        "correct_answer": "bool",
                        "explanation": "bool represents True or False.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "Python Lists and Dictionaries",
                "description": "Learn how to store collections of data.",
                "content": "Learn lists, tuples and dictionaries.",
                "order": 3,
                "duration_minutes": 40,
                "quiz": [
                    {
                        "question_text": "Which data structure stores key-value pairs?",
                        "question_type": "multiple_choice",
                        "options": ["List", "Tuple", "Dictionary", "Set"],
                        "correct_answer": "Dictionary",
                        "explanation": "A dictionary stores data as key-value pairs.",
                        "order": 1
                    },
                    {
                        "question_text": "Which symbol creates a list?",
                        "question_type": "multiple_choice",
                        "options": ["()", "[]", "{}", "<>"],
                        "correct_answer": "[]",
                        "explanation": "Square brackets create a Python list.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "Pandas Fundamentals",
                "description": "Learn Pandas for working with datasets.",
                "content": "Learn DataFrames, Series and basic Pandas operations.",
                "order": 4,
                "duration_minutes": 45,
                "quiz": [
                    {
                        "question_text": "Which library is commonly used for data analysis in Python?",
                        "question_type": "multiple_choice",
                        "options": ["Pandas", "Flask", "FastAPI", "Django"],
                        "correct_answer": "Pandas",
                        "explanation": "Pandas is widely used for data manipulation and analysis.",
                        "order": 1
                    },
                    {
                        "question_text": "What is a Pandas DataFrame?",
                        "question_type": "multiple_choice",
                        "options": ["2D data structure", "Function", "String", "Model"],
                        "correct_answer": "2D data structure",
                        "explanation": "A DataFrame is a two-dimensional labeled data structure.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "Data Cleaning with Python",
                "description": "Learn how to clean and prepare datasets.",
                "content": "Learn missing values, duplicates and basic data cleaning.",
                "order": 5,
                "duration_minutes": 50,
                "quiz": [
                    {
                        "question_text": "Which method can detect missing values in Pandas?",
                        "question_type": "multiple_choice",
                        "options": ["isnull()", "missing()", "empty()", "nullcheck()"],
                        "correct_answer": "isnull()",
                        "explanation": "isnull() identifies missing values.",
                        "order": 1
                    },
                    {
                        "question_text": "Which operation removes duplicate rows?",
                        "question_type": "multiple_choice",
                        "options": ["drop_duplicates()", "remove()", "delete_rows()", "clear()"],
                        "correct_answer": "drop_duplicates()",
                        "explanation": "drop_duplicates() removes duplicate rows.",
                        "order": 2
                    }
                ]
            }
        ]
    },

    {
        "title": "SQL Fundamentals",
        "description": "Learn SQL from basics to practical database queries.",
        "category": "Data",
        "difficulty": "beginner",
        "instructor": "AI Career Mentor",
        "provider": "AI Career Mentor",
        "duration_hours": 18,
        "estimated_weeks": 3,
        "rating": 4.8,
        "total_reviews": 0,
        "price": 0,
        "is_free": True,

        "lessons": [
            {
                "title": "Introduction to SQL",
                "description": "Understand databases and SQL fundamentals.",
                "content": "Learn databases, tables, rows, columns and SQL basics.",
                "order": 1,
                "duration_minutes": 30,
                "quiz": [
                    {
                        "question_text": "What does SQL stand for?",
                        "question_type": "multiple_choice",
                        "options": [
                            "Structured Query Language",
                            "Simple Query Language",
                            "System Query Language",
                            "Structured Question Language"
                        ],
                        "correct_answer": "Structured Query Language",
                        "explanation": "SQL stands for Structured Query Language.",
                        "order": 1
                    },
                    {
                        "question_text": "Where is data commonly stored in a relational database?",
                        "question_type": "multiple_choice",
                        "options": ["Tables", "Images", "Folders", "Files only"],
                        "correct_answer": "Tables",
                        "explanation": "Relational databases organize data into tables.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "SELECT and WHERE",
                "description": "Learn how to retrieve and filter data.",
                "content": "Learn SELECT, FROM and WHERE clauses.",
                "order": 2,
                "duration_minutes": 35,
                "quiz": [
                    {
                        "question_text": "Which keyword retrieves data?",
                        "question_type": "multiple_choice",
                        "options": ["GET", "SELECT", "FETCHDATA", "READ"],
                        "correct_answer": "SELECT",
                        "explanation": "SELECT is used to retrieve data.",
                        "order": 1
                    },
                    {
                        "question_text": "Which clause filters rows?",
                        "question_type": "multiple_choice",
                        "options": ["WHERE", "FILTER", "IF", "CHECK"],
                        "correct_answer": "WHERE",
                        "explanation": "WHERE filters rows based on conditions.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "ORDER BY and GROUP BY",
                "description": "Learn sorting and grouping data.",
                "content": "Learn ORDER BY, GROUP BY and aggregate functions.",
                "order": 3,
                "duration_minutes": 40,
                "quiz": [
                    {
                        "question_text": "Which clause sorts query results?",
                        "question_type": "multiple_choice",
                        "options": ["SORT BY", "ORDER BY", "GROUP BY", "ARRANGE"],
                        "correct_answer": "ORDER BY",
                        "explanation": "ORDER BY sorts query results.",
                        "order": 1
                    },
                    {
                        "question_text": "Which clause groups rows?",
                        "question_type": "multiple_choice",
                        "options": ["GROUP BY", "ORDER BY", "WHERE", "JOIN"],
                        "correct_answer": "GROUP BY",
                        "explanation": "GROUP BY groups rows with similar values.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "SQL JOINs",
                "description": "Learn how to combine data from multiple tables.",
                "content": "Learn INNER JOIN, LEFT JOIN and relationships.",
                "order": 4,
                "duration_minutes": 45,
                "quiz": [
                    {
                        "question_text": "Which JOIN returns matching rows from both tables?",
                        "question_type": "multiple_choice",
                        "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN"],
                        "correct_answer": "INNER JOIN",
                        "explanation": "INNER JOIN returns matching records from both tables.",
                        "order": 1
                    },
                    {
                        "question_text": "Which JOIN keeps all rows from the left table?",
                        "question_type": "multiple_choice",
                        "options": ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "CROSS JOIN"],
                        "correct_answer": "LEFT JOIN",
                        "explanation": "LEFT JOIN keeps all rows from the left table.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "SQL Aggregate Functions",
                "description": "Learn COUNT, SUM, AVG, MIN and MAX.",
                "content": "Learn aggregate functions for data analysis.",
                "order": 5,
                "duration_minutes": 40,
                "quiz": [
                    {
                        "question_text": "Which function counts rows?",
                        "question_type": "multiple_choice",
                        "options": ["SUM()", "COUNT()", "TOTAL()", "ROWS()"],
                        "correct_answer": "COUNT()",
                        "explanation": "COUNT() counts rows or values.",
                        "order": 1
                    },
                    {
                        "question_text": "Which function calculates an average?",
                        "question_type": "multiple_choice",
                        "options": ["AVG()", "MEAN()", "AVERAGE()", "MID()"],
                        "correct_answer": "AVG()",
                        "explanation": "AVG() calculates the average value.",
                        "order": 2
                    }
                ]
            }
        ]
    },

    {
        "title": "Excel for Data Analytics",
        "description": "Learn Excel formulas and analysis techniques for data analytics.",
        "category": "Data",
        "difficulty": "beginner",
        "instructor": "AI Career Mentor",
        "provider": "AI Career Mentor",
        "duration_hours": 15,
        "estimated_weeks": 3,
        "rating": 4.6,
        "total_reviews": 0,
        "price": 0,
        "is_free": True,

        "lessons": [
            {
                "title": "Excel Basics",
                "description": "Learn spreadsheets, cells and basic operations.",
                "content": "Learn rows, columns, cells and basic spreadsheet operations.",
                "order": 1,
                "duration_minutes": 30,
                "quiz": [
                    {
                        "question_text": "What is the intersection of a row and column called?",
                        "question_type": "multiple_choice",
                        "options": ["Cell", "Table", "Sheet", "Range"],
                        "correct_answer": "Cell",
                        "explanation": "The intersection of a row and column is a cell.",
                        "order": 1
                    },
                    {
                        "question_text": "Which symbol starts an Excel formula?",
                        "question_type": "multiple_choice",
                        "options": ["#", "=", "$", "@"],
                        "correct_answer": "=",
                        "explanation": "Excel formulas begin with =.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "Excel Formulas",
                "description": "Learn SUM, AVERAGE, MIN and MAX.",
                "content": "Learn common Excel formulas.",
                "order": 2,
                "duration_minutes": 35,
                "quiz": [
                    {
                        "question_text": "Which function adds values?",
                        "question_type": "multiple_choice",
                        "options": ["SUM()", "ADD()", "TOTAL()", "PLUS()"],
                        "correct_answer": "SUM()",
                        "explanation": "SUM() adds values together.",
                        "order": 1
                    },
                    {
                        "question_text": "Which function calculates average?",
                        "question_type": "multiple_choice",
                        "options": ["AVG()", "AVERAGE()", "MEAN()", "MID()"],
                        "correct_answer": "AVERAGE()",
                        "explanation": "AVERAGE() calculates the arithmetic mean.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "IF and COUNTIF",
                "description": "Learn logical and conditional Excel formulas.",
                "content": "Learn IF, COUNTIF and SUMIF.",
                "order": 3,
                "duration_minutes": 40,
                "quiz": [
                    {
                        "question_text": "Which function checks a condition?",
                        "question_type": "multiple_choice",
                        "options": ["IF()", "CHECK()", "CONDITION()", "TEST()"],
                        "correct_answer": "IF()",
                        "explanation": "IF() checks a condition and returns different results.",
                        "order": 1
                    },
                    {
                        "question_text": "Which function counts cells matching a condition?",
                        "question_type": "multiple_choice",
                        "options": ["COUNT()", "COUNTIF()", "IFCOUNT()", "MATCHCOUNT()"],
                        "correct_answer": "COUNTIF()",
                        "explanation": "COUNTIF() counts cells that meet a condition.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "Lookup Functions",
                "description": "Learn VLOOKUP and modern lookup concepts.",
                "content": "Learn how to search and retrieve values from tables.",
                "order": 4,
                "duration_minutes": 45,
                "quiz": [
                    {
                        "question_text": "Which function is traditionally used to search vertically?",
                        "question_type": "multiple_choice",
                        "options": ["VLOOKUP()", "VSEARCH()", "VERTICAL()", "SEARCHV()"],
                        "correct_answer": "VLOOKUP()",
                        "explanation": "VLOOKUP() searches vertically in a table.",
                        "order": 1
                    },
                    {
                        "question_text": "What is a lookup function used for?",
                        "question_type": "multiple_choice",
                        "options": [
                            "Finding and retrieving data",
                            "Deleting data",
                            "Formatting cells only",
                            "Creating charts only"
                        ],
                        "correct_answer": "Finding and retrieving data",
                        "explanation": "Lookup functions find and return related data.",
                        "order": 2
                    }
                ]
            },
            {
                "title": "Pivot Tables",
                "description": "Learn how to summarize and analyze large datasets.",
                "content": "Learn Pivot Tables for data summarization and reporting.",
                "order": 5,
                "duration_minutes": 50,
                "quiz": [
                    {
                        "question_text": "What is a Pivot Table mainly used for?",
                        "question_type": "multiple_choice",
                        "options": [
                            "Summarizing data",
                            "Writing Python",
                            "Creating databases",
                            "Installing software"
                        ],
                        "correct_answer": "Summarizing data",
                        "explanation": "Pivot Tables summarize and analyze datasets.",
                        "order": 1
                    },
                    {
                        "question_text": "Can Pivot Tables group and summarize data?",
                        "question_type": "multiple_choice",
                        "options": ["Yes", "No", "Only text", "Only numbers"],
                        "correct_answer": "Yes",
                        "explanation": "Pivot Tables can group and summarize data.",
                        "order": 2
                    }
                ]
            }
        ]
    }
]


def seed_learning():
    db = SessionLocal()

    try:
        course_count = 0
        lesson_count = 0
        quiz_count = 0
        question_count = 0

        for course_data in courses_data:

            existing_course = db.query(LearningCourse).filter(
                LearningCourse.title == course_data["title"]
            ).first()

            if existing_course:
                course = existing_course
                print(f"ℹ️ Course already exists: {course.title}")
            else:
                course = LearningCourse(
                    title=course_data["title"],
                    description=course_data["description"],
                    category=course_data["category"],
                    difficulty=course_data["difficulty"],
                    instructor=course_data["instructor"],
                    provider=course_data["provider"],
                    duration_hours=course_data["duration_hours"],
                    estimated_weeks=course_data["estimated_weeks"],
                    rating=course_data["rating"],
                    total_reviews=course_data["total_reviews"],
                    price=course_data["price"],
                    is_free=course_data["is_free"]
                )

                db.add(course)
                db.flush()

                course_count += 1
                print(f"✅ Course added: {course.title}")

            for lesson_data in course_data["lessons"]:

                existing_lesson = db.query(LearningLesson).filter(
                    LearningLesson.course_id == course.id,
                    LearningLesson.order == lesson_data["order"]
                ).first()

                if existing_lesson:
                    lesson = existing_lesson
                else:
                    lesson = LearningLesson(
                        course_id=course.id,
                        title=lesson_data["title"],
                        description=lesson_data["description"],
                        content=lesson_data["content"],
                        order=lesson_data["order"],
                        duration_minutes=lesson_data["duration_minutes"]
                    )

                    db.add(lesson)
                    db.flush()

                    lesson_count += 1

                existing_quiz = db.query(LearningQuiz).filter(
                    LearningQuiz.lesson_id == lesson.id
                ).first()

                if existing_quiz:
                    quiz = existing_quiz
                else:
                    quiz = LearningQuiz(
                        lesson_id=lesson.id,
                        passing_score=70,
                        questions_count=len(lesson_data["quiz"])
                    )

                    db.add(quiz)
                    db.flush()

                    quiz_count += 1

                for question_data in lesson_data["quiz"]:

                    existing_question = db.query(QuizQuestion).filter(
                        QuizQuestion.quiz_id == quiz.id,
                        QuizQuestion.order == question_data["order"]
                    ).first()

                    if existing_question:
                        continue

                    question = QuizQuestion(
                        quiz_id=quiz.id,
                        question_text=question_data["question_text"],
                        question_type=question_data["question_type"],
                        options=str(question_data["options"]),
                        correct_answer=question_data["correct_answer"],
                        explanation=question_data["explanation"],
                        order=question_data["order"]
                    )

                    db.add(question)
                    question_count += 1

        db.commit()

        print()
        print("====================================")
        print("✅ Learning database seeding completed")
        print(f"✅ Courses added: {course_count}")
        print(f"✅ Lessons added: {lesson_count}")
        print(f"✅ Quizzes added: {quiz_count}")
        print(f"✅ Questions added: {question_count}")
        print("====================================")

    except Exception as e:
        db.rollback()
        print(f"❌ Learning seed failed: {e}")
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_learning()