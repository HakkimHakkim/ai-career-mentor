from app.ml.train import CareerMLModel
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.career import (
    Career,
    CareerRecommendation,
    CareerSkill,
    UserSkill
)
from app.models.user import User
import json


class MLService:
    """Machine Learning service"""

    _model_instance = None

    @classmethod
    def get_model(cls) -> CareerMLModel:
        """Get or load ML model (singleton pattern)"""

        if cls._model_instance is None:
            cls._model_instance = CareerMLModel()

            try:
                cls._model_instance.load()
            except Exception:
                print(
                    "Warning: ML model not found. "
                    "Train the model first."
                )

        return cls._model_instance

    @staticmethod
    def prepare_features(
        user: User,
        db: Session,
        request=None
    ) -> Dict:
        """Prepare features for ML prediction"""

        # Default features
        features = {
            "python": 0,
            "sql": 0,
            "excel": 0,
            "statistics": 0,
            "communication": 0,
            "problem_solving": 0,
            "web_development": 0,
            "data_interest": 0,
            "ai_interest": 0,
            "cloud_interest": 0,
            "design_interest": 0,
            "experience_level": "beginner",
            "education": "bachelors"
        }

        # -------------------------------------------------
        # 1. Use request data from API
        # -------------------------------------------------

        if request:

            # Skills from request
            for skill in request.skills:
                skill_name = skill.lower().strip()

                if skill_name in features:
                    features[skill_name] = 1

            # Interests from request
            for interest in request.interests:
                interest_name = interest.lower().strip()

                if interest_name in features:
                    features[interest_name] = 1

            # Experience level
            if request.experience_level:
                features["experience_level"] = (
                    request.experience_level.lower().strip()
                )

             # Education
            if request.education:
                features["education"] = (
                    request.education.lower().strip()
                )

            # Assessment answers are authoritative — skip stale
            # profile/DB data so it can't override what the
            # user just answered
            return features

        # -------------------------------------------------
        # 2. Also check user's saved profile
        # -------------------------------------------------
        if user.profile:

            if user.profile.experience_level:
                features["experience_level"] = (
                    user.profile.experience_level.lower().strip()
                )

            if user.profile.education:
                features["education"] = (
                    user.profile.education.lower().strip()
                )

        # -------------------------------------------------
        # 3. Check user's database skills
        # -------------------------------------------------

        user_skills = db.query(UserSkill).filter(
            UserSkill.user_id == user.id
        ).all()

        skill_mapping = {
            "Python": "python",
            "SQL": "sql",
            "Excel": "excel",
            "Statistics": "statistics",
            "Communication": "communication",
            "Problem Solving": "problem_solving",
            "Web Development": "web_development"
        }

        for user_skill in user_skills:

            if not user_skill.skill:
                continue

            skill_name = user_skill.skill.name

            if skill_name in skill_mapping:
                features[skill_mapping[skill_name]] = 1

        # -------------------------------------------------
        # 4. Check user's saved interests
        # -------------------------------------------------

        if user.profile and user.profile.interests:

            interests_text = user.profile.interests.lower()

            if "data" in interests_text:
                features["data_interest"] = 1

            if "ai" in interests_text:
                features["ai_interest"] = 1

            if "cloud" in interests_text:
                features["cloud_interest"] = 1

            if "design" in interests_text:
                features["design_interest"] = 1

        return features

    @staticmethod
    def get_skill_gap(
        user: User,
        career: Career,
        db: Session,
        request=None
    ) -> tuple:
        """Calculate matched and missing skills"""

        # -------------------------------------------------
        # Get skills from database
        # -------------------------------------------------

        user_skill_ids = db.query(
            UserSkill.skill_id
        ).filter(
            UserSkill.user_id == user.id
        ).all()

        user_skill_ids = [skill_id[0] for skill_id in user_skill_ids]

        # -------------------------------------------------
        # Get skills from API request
        # -------------------------------------------------

        request_skill_names = set()

        if request:

            for skill in request.skills:
                request_skill_names.add(
                    skill.lower().strip()
                )

        # -------------------------------------------------
        # Get career required skills
        # -------------------------------------------------

        career_skills = db.query(CareerSkill).filter(
            CareerSkill.career_id == career.id
        ).all()

        matched_skills = []
        missing_skills = []

        for career_skill in career_skills:

            skill = career_skill.skill

            if not skill:
                continue

            skill_name = skill.name

            # Check DB skill
            db_match = career_skill.skill_id in user_skill_ids

            # Check request skill
            request_match = (
                skill_name.lower().strip()
                in request_skill_names
            )

            if db_match or request_match:
                matched_skills.append(skill_name)
            else:
                missing_skills.append(skill_name)

        return matched_skills, missing_skills

    @staticmethod
    def predict_careers(
        user: User,
        db: Session,
        top_n: int = 10,
        request=None
    ) -> List[Dict]:
        """Predict top N career matches"""

        model = MLService.get_model()

        # -------------------------------------------------
        # Prepare ML features
        # -------------------------------------------------

        features = MLService.prepare_features(
            user,
            db,
            request
        )

        print("====================================")
        print("ML INPUT FEATURES")
        print(features)
        print("====================================")

        # -------------------------------------------------
        # Get ML predictions
        # -------------------------------------------------

        predicted_career, confidence, career_scores = (
            model.predict(features)
        )

        recommendations = []

        # -------------------------------------------------
        # Build recommendations
        # -------------------------------------------------

        for i, career_score in enumerate(
            career_scores[:top_n]
        ):

            career = db.query(Career).filter(
                Career.title == career_score["career"]
            ).first()

            if not career:
                continue

            # Calculate skill gap
            matched_skills, missing_skills = (
                MLService.get_skill_gap(
                    user,
                    career,
                    db,
                    request
                )
            )

            total_required = (
                len(matched_skills)
                + len(missing_skills)
            )

            if total_required > 0:
                skill_match_percentage = (
                    len(matched_skills)
                    / total_required
                ) * 100
            else:
                skill_match_percentage = 0

            reasons = [
                (
                    f"Your skills match "
                    f"{len(matched_skills)} of "
                    f"{total_required} required skills"
                ),
                (
                    f"{career_score['score']:.0f}% "
                    f"match based on ML analysis"
                ),
                (
                    f"Good growth potential in "
                    f"{career.category if career.category else 'this field'}"
                )
            ]

            recommendations.append({
                "career": career,
                "score": career_score["score"],
                "rank": i + 1,
                "matched_skills": matched_skills,
                "missing_skills": missing_skills,
                "reasons": reasons
            })

        return recommendations

    @staticmethod
    def save_recommendations(
        user: User,
        recommendations: List[Dict],
        db: Session
    ):
        """Save recommendations to database"""

        # Delete previous recommendations
        db.query(
            CareerRecommendation
        ).filter(
            CareerRecommendation.user_id == user.id
        ).delete()

        # Save new recommendations
        for rec in recommendations:

            career_rec = CareerRecommendation(
                user_id=user.id,
                career_id=rec["career"].id,
                match_score=rec["score"],
                rank=rec["rank"],
                matched_skills=json.dumps(
                    rec["matched_skills"]
                ),
                missing_skills=json.dumps(
                    rec["missing_skills"]
                ),
                reasons=json.dumps(
                    rec["reasons"]
                )
            )

            db.add(career_rec)

        db.commit()