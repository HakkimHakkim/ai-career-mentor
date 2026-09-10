import json
from sqlalchemy.orm import Session
from app.models.skill_quiz import SkillQuizSession, SkillQuizAttempt
from app.models.roadmap import Roadmap, RoadmapStep
from app.services.grok_service import GrokService

DIFFICULTY_ORDER = ["beginner", "intermediate", "advanced"]


class QuizService:
    """Skill quiz generation, submission, and beginner->advanced progression"""

    @staticmethod
    def get_roadmap_skills(user_id: str, db: Session) -> list:
        """Get skill names from the user's active roadmap"""
        roadmap = (
            db.query(Roadmap)
            .filter(Roadmap.user_id == user_id, Roadmap.status == "active")
            .order_by(Roadmap.created_at.desc())
            .first()
        )

        if not roadmap:
            return []

        steps = (
            db.query(RoadmapStep)
            .filter(RoadmapStep.roadmap_id == roadmap.id)
            .order_by(RoadmapStep.order.asc())
            .all()
        )

        skills = []
        for step in steps:
            skill_name = step.title.replace("Master ", "").strip()
            skills.append(skill_name)

        return skills

    @staticmethod
    def get_next_difficulty(user_id: str, skill_name: str, db: Session) -> str:
        """
        beginner -> intermediate -> advanced.
        Level up only if the last attempt on that skill scored >= 80%.
        """
        last_attempt = (
            db.query(SkillQuizAttempt)
            .filter(
                SkillQuizAttempt.user_id == user_id,
                SkillQuizAttempt.skill_name == skill_name
            )
            .order_by(SkillQuizAttempt.created_at.desc())
            .first()
        )

        if not last_attempt:
            return "beginner"

        current_index = DIFFICULTY_ORDER.index(last_attempt.difficulty)

        if last_attempt.score >= 80 and current_index + 1 < len(DIFFICULTY_ORDER):
            return DIFFICULTY_ORDER[current_index + 1]

        return last_attempt.difficulty

    @staticmethod
    async def generate_quiz_session(
        user_id: str,
        skill_name: str,
        db: Session,
        num_questions: int = 15
    ) -> SkillQuizSession:
        """Generate a new quiz at the user's current difficulty for this skill"""
        difficulty = QuizService.get_next_difficulty(user_id, skill_name, db)

        questions = await GrokService.generate_quiz(
            skill_name,
            difficulty,
            num_questions
        )

        if not questions:
            raise ValueError("AI failed to generate quiz questions")

        session = SkillQuizSession(
            user_id=user_id,
            skill_name=skill_name,
            difficulty=difficulty,
            questions=json.dumps(questions)
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return session

    @staticmethod
    def submit_quiz(
        quiz_session_id: str,
        user_id: str,
        answers: list,
        db: Session
    ) -> dict:
        """Grade submitted answers against the stored quiz session"""
        session = (
            db.query(SkillQuizSession)
            .filter(
                SkillQuizSession.id == quiz_session_id,
                SkillQuizSession.user_id == user_id
            )
            .first()
        )

        if not session:
            raise ValueError("Quiz session not found")

        questions = json.loads(session.questions)
        total = len(questions)
        correct_count = 0
        review = []

        for index, q in enumerate(questions):
            selected = answers[index] if index < len(answers) else None
            is_correct = selected == q.get("correct_index")

            if is_correct:
                correct_count += 1

            review.append({
                "question": q.get("question"),
                "options": q.get("options"),
                "correct_index": q.get("correct_index"),
                "selected_index": selected,
                "is_correct": is_correct,
                "explanation": q.get("explanation")
            })

        score = round((correct_count / total) * 100, 1) if total else 0

        attempt = SkillQuizAttempt(
            quiz_session_id=session.id,
            user_id=user_id,
            skill_name=session.skill_name,
            difficulty=session.difficulty,
            score=score,
            correct_count=correct_count,
            total_questions=total
        )

        db.add(attempt)
        db.commit()
        db.refresh(attempt)

        return {
            "score": score,
            "correct_count": correct_count,
            "total_questions": total,
            "difficulty": session.difficulty,
            "skill_name": session.skill_name,
            "review": review,
            "leveled_up": score >= 80
        }

    @staticmethod
    def get_my_scores(user_id: str, db: Session) -> list:
        """Best score + most recent attempt per skill, with latest difficulty reached"""
        attempts = (
            db.query(SkillQuizAttempt)
            .filter(SkillQuizAttempt.user_id == user_id)
            .order_by(SkillQuizAttempt.created_at.desc())
            .all()
        )

        best_by_skill = {}
        for attempt in attempts:
            if attempt.skill_name not in best_by_skill:
                best_by_skill[attempt.skill_name] = {
                    "skill_name": attempt.skill_name,
                    "best_score": attempt.score,
                    "latest_difficulty": attempt.difficulty,
                    "attempts": 1,
                    "recent_score": attempt.score,
                    "recent_difficulty": attempt.difficulty,
                    "recent_attempted_at": attempt.created_at.isoformat() if attempt.created_at else None
                }
            else:
                entry = best_by_skill[attempt.skill_name]
                entry["attempts"] += 1
                if attempt.score > entry["best_score"]:
                    entry["best_score"] = attempt.score

        return list(best_by_skill.values())