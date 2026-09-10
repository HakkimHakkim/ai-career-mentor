from app.db import SessionLocal
from app.models.career import Career, CareerSkill
from app.models.skill import Skill


# ---------------------------------------------------------
# CAREERS
# ---------------------------------------------------------

careers_data = [
    {
        "title": "Data Analyst",
        "description": "Analyzes data to find insights and trends.",
        "category": "Data",
        "difficulty": "beginner",
        "average_learning_time": 135,
    },
    {
        "title": "Data Scientist",
        "description": "Builds models and extracts insights from complex data.",
        "category": "Data",
        "difficulty": "intermediate",
        "average_learning_time": 270,
    },
    {
        "title": "Full Stack Developer",
        "description": "Builds both frontend and backend of web applications.",
        "category": "Development",
        "difficulty": "intermediate",
        "average_learning_time": 225,
    },
    {
        "title": "DevOps Engineer",
        "description": "Manages deployment, infrastructure, and CI/CD pipelines.",
        "category": "Operations",
        "difficulty": "intermediate",
        "average_learning_time": 225,
    },
    {
        "title": "UI/UX Designer",
        "description": "Designs user interfaces and experiences.",
        "category": "Design",
        "difficulty": "beginner",
        "average_learning_time": 135,
    },
    {
        "title": "Backend Developer",
        "description": "Builds server-side logic and APIs.",
        "category": "Development",
        "difficulty": "intermediate",
        "average_learning_time": 225,
    },
    {
        "title": "Product Manager",
        "description": "Leads product strategy and roadmap.",
        "category": "Management",
        "difficulty": "intermediate",
        "average_learning_time": 315,
    },
    {
        "title": "Business Analyst",
        "description": "Bridges business needs and technical solutions.",
        "category": "Business",
        "difficulty": "beginner",
        "average_learning_time": 135,
    },
    {
        "title": "ML Engineer",
        "description": "Builds and deploys machine learning models.",
        "category": "Data",
        "difficulty": "advanced",
        "average_learning_time": 315,
    },
    {
        "title": "Frontend Developer",
        "description": "Builds user-facing web interfaces.",
        "category": "Development",
        "difficulty": "beginner",
        "average_learning_time": 135,
    },
]


# ---------------------------------------------------------
# SKILLS
# ---------------------------------------------------------

skills_data = [
    {
        "name": "Python",
        "description": "Programming language used for software development and data science.",
        "category": "Programming",
        "difficulty": "beginner",
    },
    {
        "name": "SQL",
        "description": "Language used to query and manage relational databases.",
        "category": "Database",
        "difficulty": "beginner",
    },
    {
        "name": "Excel",
        "description": "Spreadsheet tool used for data analysis and reporting.",
        "category": "Data",
        "difficulty": "beginner",
    },
    {
        "name": "Statistics",
        "description": "Statistical methods used to analyze data and build insights.",
        "category": "Data",
        "difficulty": "intermediate",
    },
    {
        "name": "Communication",
        "description": "Ability to communicate technical and business information clearly.",
        "category": "Soft Skill",
        "difficulty": "beginner",
    },
    {
        "name": "Problem Solving",
        "description": "Ability to analyze problems and develop effective solutions.",
        "category": "Soft Skill",
        "difficulty": "beginner",
    },
    {
        "name": "Web Development",
        "description": "Development of websites and web applications.",
        "category": "Development",
        "difficulty": "beginner",
    },
]


# ---------------------------------------------------------
# CAREER → SKILLS
# ---------------------------------------------------------

career_skills_data = {
    "Data Analyst": [
        ("Python", "HIGH", "INTERMEDIATE"),
        ("SQL", "HIGH", "INTERMEDIATE"),
        ("Excel", "HIGH", "BEGINNER"),
        ("Statistics", "HIGH", "INTERMEDIATE"),
        ("Problem Solving", "MEDIUM", "BEGINNER"),
        ("Communication", "MEDIUM", "BEGINNER"),
    ],

    "Data Scientist": [
        ("Python", "HIGH", "INTERMEDIATE"),
        ("SQL", "HIGH", "INTERMEDIATE"),
        ("Statistics", "HIGH", "ADVANCED"),
        ("Problem Solving", "HIGH", "INTERMEDIATE"),
    ],

    "Full Stack Developer": [
        ("Python", "MEDIUM", "INTERMEDIATE"),
        ("Web Development", "HIGH", "INTERMEDIATE"),
        ("Problem Solving", "HIGH", "INTERMEDIATE"),
    ],

    "DevOps Engineer": [
        ("Python", "MEDIUM", "INTERMEDIATE"),
        ("SQL", "LOW", "BEGINNER"),
        ("Problem Solving", "HIGH", "INTERMEDIATE"),
    ],

    "UI/UX Designer": [
        ("Communication", "HIGH", "BEGINNER"),
        ("Problem Solving", "MEDIUM", "BEGINNER"),
    ],

    "Backend Developer": [
        ("Python", "HIGH", "INTERMEDIATE"),
        ("SQL", "HIGH", "INTERMEDIATE"),
        ("Web Development", "HIGH", "INTERMEDIATE"),
        ("Problem Solving", "HIGH", "INTERMEDIATE"),
    ],

    "Product Manager": [
        ("Communication", "HIGH", "INTERMEDIATE"),
        ("Problem Solving", "HIGH", "INTERMEDIATE"),
        ("SQL", "MEDIUM", "BEGINNER"),
    ],

    "Business Analyst": [
        ("SQL", "HIGH", "BEGINNER"),
        ("Excel", "HIGH", "BEGINNER"),
        ("Statistics", "MEDIUM", "BEGINNER"),
        ("Communication", "HIGH", "INTERMEDIATE"),
        ("Problem Solving", "HIGH", "BEGINNER"),
    ],

    "ML Engineer": [
        ("Python", "HIGH", "ADVANCED"),
        ("Statistics", "HIGH", "INTERMEDIATE"),
        ("SQL", "MEDIUM", "INTERMEDIATE"),
        ("Problem Solving", "HIGH", "INTERMEDIATE"),
    ],

    "Frontend Developer": [
        ("Web Development", "HIGH", "INTERMEDIATE"),
        ("Problem Solving", "HIGH", "BEGINNER"),
        ("Communication", "MEDIUM", "BEGINNER"),
    ],
}


# ---------------------------------------------------------
# SEED DATABASE
# ---------------------------------------------------------

def seed():
    db = SessionLocal()

    try:

        # -------------------------
        # 1. Seed Careers
        # -------------------------

        career_objects = {}

        for career_data in careers_data:

            career = (
                db.query(Career)
                .filter(Career.title == career_data["title"])
                .first()
            )

            if not career:
                career = Career(**career_data)
                db.add(career)
                db.flush()

            career_objects[career.title] = career


        # -------------------------
        # 2. Seed Skills
        # -------------------------

        skill_objects = {}

        for skill_data in skills_data:

            skill = (
                db.query(Skill)
                .filter(Skill.name == skill_data["name"])
                .first()
            )

            if not skill:
                skill = Skill(**skill_data)
                db.add(skill)
                db.flush()

            skill_objects[skill.name] = skill


        # -------------------------
        # 3. Seed Career Skills
        # -------------------------

        mapping_count = 0

        for career_title, skill_list in career_skills_data.items():

            career = career_objects[career_title]

            for skill_name, importance, required_level in skill_list:

                skill = skill_objects[skill_name]

                exists = (
                    db.query(CareerSkill)
                    .filter(
                        CareerSkill.career_id == career.id,
                        CareerSkill.skill_id == skill.id,
                    )
                    .first()
                )

                if not exists:

                    career_skill = CareerSkill(
                        career_id=career.id,
                        skill_id=skill.id,
                        importance=importance,
                        required_level=required_level,
                        category=skill.category,
                    )

                    db.add(career_skill)
                    mapping_count += 1


        # -------------------------
        # Commit
        # -------------------------

        db.commit()

        print("====================================")
        print("✅ Database seeding completed")
        print(f"✅ Careers: {len(careers_data)}")
        print(f"✅ Skills: {len(skills_data)}")
        print(f"✅ Career-Skill mappings added: {mapping_count}")
        print("====================================")

    except Exception as e:

        db.rollback()

        print("❌ Seed failed:")
        print(e)

        raise

    finally:

        db.close()


if __name__ == "__main__":
    seed()