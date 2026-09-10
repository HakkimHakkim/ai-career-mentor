"""Seed database with initial data"""

from app.db import SessionLocal, engine, Base
from app.models.career import Career, Skill, CareerSkill
from app.models.learning import LearningCourse
from app.models.project import Project
from app.models.quiz import Job
import json

def seed_careers():
    """Seed career data"""
    db = SessionLocal()

    careers_data = [
        {
            "title": "Data Analyst",
            "description": "Analyze data and create insights",
            "category": "Analytics",
            "difficulty": "Intermediate",
            "average_learning_time": 180
        },
        {
            "title": "Data Scientist",
            "description": "Build ML models and analyze complex data",
            "category": "AI/ML",
            "difficulty": "Advanced",
            "average_learning_time": 240
        },
        {
            "title": "Full Stack Developer",
            "description": "Develop frontend and backend applications",
            "category": "Software Development",
            "difficulty": "Advanced",
            "average_learning_time": 200
        },
        {
            "title": "Backend Developer",
            "description": "Build server-side applications",
            "category": "Software Development",
            "difficulty": "Intermediate",
            "average_learning_time": 150
        },
        {
            "title": "Frontend Developer",
            "description": "Build user interfaces and experiences",
            "category": "Software Development",
            "difficulty": "Intermediate",
            "average_learning_time": 120
        },
        {
            "title": "DevOps Engineer",
            "description": "Deploy and manage applications",
            "category": "Infrastructure",
            "difficulty": "Advanced",
            "average_learning_time": 180
        },
        {
            "title": "ML Engineer",
            "description": "Design and deploy machine learning systems",
            "category": "AI/ML",
            "difficulty": "Advanced",
            "average_learning_time": 250
        },
        {
            "title": "UI/UX Designer",
            "description": "Design user interfaces and experiences",
            "category": "Design",
            "difficulty": "Intermediate",
            "average_learning_time": 120
        }
    ]

    for career_data in careers_data:
        existing = db.query(Career).filter(Career.title == career_data["title"]).first()
        if not existing:
            career = Career(**career_data)
            db.add(career)

    db.commit()
    print(f"✅ Seeded {len(careers_data)} careers")
    db.close()

def seed_skills():
    """Seed skill data"""
    db = SessionLocal()

    skills_data = [
        {"name": "Python", "category": "Programming", "difficulty": "Beginner"},
        {"name": "SQL", "category": "Database", "difficulty": "Beginner"},
        {"name": "Excel", "category": "Tools", "difficulty": "Beginner"},
        {"name": "Power BI", "category": "Tools", "difficulty": "Intermediate"},
        {"name": "Tableau", "category": "Tools", "difficulty": "Intermediate"},
        {"name": "Statistics", "category": "Analytics", "difficulty": "Intermediate"},
        {"name": "Machine Learning", "category": "AI/ML", "difficulty": "Advanced"},
        {"name": "React", "category": "Frontend", "difficulty": "Intermediate"},
        {"name": "JavaScript", "category": "Programming", "difficulty": "Intermediate"},
        {"name": "Node.js", "category": "Backend", "difficulty": "Intermediate"},
        {"name": "FastAPI", "category": "Backend", "difficulty": "Intermediate"},
        {"name": "Docker", "category": "DevOps", "difficulty": "Intermediate"},
        {"name": "AWS", "category": "Cloud", "difficulty": "Intermediate"},
        {"name": "Git", "category": "Tools", "difficulty": "Beginner"},
        {"name": "Communication", "category": "Soft Skills", "difficulty": "Beginner"},
        {"name": "Problem Solving", "category": "Soft Skills", "difficulty": "Intermediate"},
        {"name": "Leadership", "category": "Soft Skills", "difficulty": "Advanced"},
        {"name": "Data Visualization", "category": "Analytics", "difficulty": "Intermediate"},
        {"name": "Pandas", "category": "Libraries", "difficulty": "Intermediate"},
        {"name": "Scikit-learn", "category": "Libraries", "difficulty": "Advanced"},
    ]

    for skill_data in skills_data:
        existing = db.query(Skill).filter(Skill.name == skill_data["name"]).first()
        if not existing:
            skill = Skill(**skill_data)
            db.add(skill)

    db.commit()
    print(f"✅ Seeded {len(skills_data)} skills")
    db.close()

def seed_career_skills():
    """Seed career-skill relationships"""
    db = SessionLocal()

    relationships = {
        "Data Analyst": [
            ("SQL", "HIGH", "INTERMEDIATE"),
            ("Excel", "HIGH", "INTERMEDIATE"),
            ("Python", "MEDIUM", "INTERMEDIATE"),
            ("Data Visualization", "HIGH", "INTERMEDIATE"),
            ("Statistics", "HIGH", "INTERMEDIATE"),
            ("Power BI", "MEDIUM", "INTERMEDIATE"),
        ],
        "Data Scientist": [
            ("Python", "HIGH", "ADVANCED"),
            ("Machine Learning", "HIGH", "ADVANCED"),
            ("Statistics", "HIGH", "ADVANCED"),
            ("SQL", "HIGH", "INTERMEDIATE"),
            ("Pandas", "HIGH", "ADVANCED"),
            ("Scikit-learn", "HIGH", "ADVANCED"),
        ],
        "Full Stack Developer": [
            ("React", "HIGH", "INTERMEDIATE"),
            ("JavaScript", "HIGH", "INTERMEDIATE"),
            ("Python", "HIGH", "INTERMEDIATE"),
            ("Node.js", "HIGH", "INTERMEDIATE"),
            ("SQL", "MEDIUM", "INTERMEDIATE"),
            ("Git", "HIGH", "BEGINNER"),
        ],
        "Backend Developer": [
            ("Python", "HIGH", "INTERMEDIATE"),
            ("FastAPI", "HIGH", "INTERMEDIATE"),
            ("SQL", "HIGH", "INTERMEDIATE"),
            ("Node.js", "MEDIUM", "INTERMEDIATE"),
            ("Docker", "MEDIUM", "INTERMEDIATE"),
            ("Problem Solving", "HIGH", "INTERMEDIATE"),
        ],
        "Frontend Developer": [
            ("React", "HIGH", "ADVANCED"),
            ("JavaScript", "HIGH", "ADVANCED"),
            ("Communication", "MEDIUM", "INTERMEDIATE"),
            ("Problem Solving", "HIGH", "INTERMEDIATE"),
            ("Git", "HIGH", "BEGINNER"),
        ],
        "DevOps Engineer": [
            ("Docker", "HIGH", "ADVANCED"),
            ("AWS", "HIGH", "ADVANCED"),
            ("Linux", "HIGH", "INTERMEDIATE"),
            ("Python", "MEDIUM", "INTERMEDIATE"),
            ("Git", "HIGH", "INTERMEDIATE"),
        ]
    }

    count = 0
    for career_title, skills in relationships.items():
        career = db.query(Career).filter(Career.title == career_title).first()
        if career:
            for skill_name, importance, level in skills:
                skill = db.query(Skill).filter(Skill.name == skill_name).first()
                if skill:
                    existing = db.query(CareerSkill).filter(
                        CareerSkill.career_id == career.id,
                        CareerSkill.skill_id == skill.id
                    ).first()
                    if not existing:
                        cs = CareerSkill(
                            career_id=career.id,
                            skill_id=skill.id,
                            importance=importance,
                            required_level=level
                        )
                        db.add(cs)
                        count += 1

    db.commit()
    print(f"✅ Seeded {count} career-skill relationships")
    db.close()

def seed_courses():
    """Seed learning courses"""
    db = SessionLocal()

    courses_data = [
        {
            "title": "Python for Beginners",
            "description": "Learn Python basics",
            "category": "Programming",
            "difficulty": "Beginner",
            "duration_hours": 20,
            "is_free": True,
            "provider": "Udemy"
        },
        {
            "title": "SQL Mastery",
            "description": "Learn advanced SQL",
            "category": "Database",
            "difficulty": "Intermediate",
            "duration_hours": 30,
            "is_free": False,
            "provider": "Coursera"
        },
        {
            "title": "React.js Complete Guide",
            "description": "Master React",
            "category": "Frontend",
            "difficulty": "Intermediate",
            "duration_hours": 40,
            "is_free": False,
            "provider": "Udemy"
        },
        {
            "title": "Machine Learning Basics",
            "description": "Introduction to ML",
            "category": "AI/ML",
            "difficulty": "Intermediate",
            "duration_hours": 50,
            "is_free": True,
            "provider": "Coursera"
        }
    ]

    for course_data in courses_data:
        existing = db.query(LearningCourse).filter(LearningCourse.title == course_data["title"]).first()
        if not existing:
            course = LearningCourse(**course_data)
            db.add(course)

    db.commit()
    print(f"✅ Seeded {len(courses_data)} courses")
    db.close()

def seed_projects():
    """Seed project templates"""
    db = SessionLocal()

    projects_data = [
        {
            "title": "Sales Analytics Dashboard",
            "description": "Build an analytics dashboard",
            "difficulty": "Intermediate",
            "estimated_hours": 30,
            "overview": "Create a dashboard to analyze sales data"
        },
        {
            "title": "Todo Web Application",
            "description": "Build a full-stack todo app",
            "difficulty": "Beginner",
            "estimated_hours": 20,
            "overview": "Frontend with React, Backend with FastAPI"
        },
        {
            "title": "Movie Recommendation System",
            "description": "Build an ML recommendation engine",
            "difficulty": "Advanced",
            "estimated_hours": 50,
            "overview": "Use ML to recommend movies based on user preferences"
        }
    ]

    for project_data in projects_data:
        existing = db.query(Project).filter(Project.title == project_data["title"]).first()
        if not existing:
            project = Project(**project_data)
            db.add(project)

    db.commit()
    print(f"✅ Seeded {len(projects_data)} projects")
    db.close()

def seed_jobs():
    """Seed job listings"""
    db = SessionLocal()

    jobs_data = [
        {
            "title": "Junior Data Analyst",
            "company": "Tech Corp",
            "location": "Remote",
            "remote_type": "remote",
            "experience_level": "Entry",
            "salary_min": 50000,
            "salary_max": 70000,
            "is_active": True
        },
        {
            "title": "Senior Python Developer",
            "company": "StartUp Inc",
            "location": "San Francisco",
            "remote_type": "hybrid",
            "experience_level": "Senior",
            "salary_min": 120000,
            "salary_max": 160000,
            "is_active": True
        },
        {
            "title": "React Frontend Engineer",
            "company": "Web Design Studio",
            "location": "New York",
            "remote_type": "on-site",
            "experience_level": "Mid",
            "salary_min": 80000,
            "salary_max": 120000,
            "is_active": True
        }
    ]

    for job_data in jobs_data:
        existing = db.query(Job).filter(
            Job.title == job_data["title"],
            Job.company == job_data["company"]
        ).first()
        if not existing:
            job = Job(**job_data)
            db.add(job)

    db.commit()
    print(f"✅ Seeded {len(jobs_data)} jobs")
    db.close()

def main():
    """Run all seeds"""
    print("\n🌱 Starting database seed...\n")

    try:
        seed_careers()
        seed_skills()
        seed_career_skills()
        seed_courses()
        seed_projects()
        seed_jobs()

        print("\n✨ Database seeded successfully!\n")

    except Exception as e:
        print(f"\n❌ Error seeding database: {e}\n")

if __name__ == "__main__":
    main()