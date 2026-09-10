from sqlalchemy.orm import Session
from app.models.career import Career, Skill, CareerSkill, UserSkill
from app.models.user import User
from typing import List, Dict, Tuple
import json

class CareerService:
    """Career management service"""
    
    @staticmethod
    def get_all_careers(db: Session, skip: int = 0, limit: int = 20) -> Tuple[List[Career], int]:
        """Get all careers with pagination"""
        total = db.query(Career).count()
        careers = db.query(Career).offset(skip).limit(limit).all()
        return careers, total
    
    @staticmethod
    def get_career_by_id(db: Session, career_id: str) -> Career:
        """Get career by ID"""
        return db.query(Career).filter(Career.id == career_id).first()
    
    @staticmethod
    def get_career_by_title(db: Session, title: str) -> Career:
        """Get career by title"""
        return db.query(Career).filter(Career.title == title).first()
    
    @staticmethod
    def get_career_skills(db: Session, career_id: str) -> List[CareerSkill]:
        """Get all required skills for a career"""
        return db.query(CareerSkill).filter(
            CareerSkill.career_id == career_id
        ).order_by(CareerSkill.importance.desc()).all()
    
    @staticmethod
    def search_careers(db: Session, query: str, skip: int = 0, limit: int = 10) -> Tuple[List[Career], int]:
        """Search careers by title or description"""
        q = db.query(Career).filter(
            (Career.title.ilike(f"%{query}%")) |
            (Career.description.ilike(f"%{query}%"))
        )
        total = q.count()
        careers = q.offset(skip).limit(limit).all()
        return careers, total
    
    @staticmethod
    def get_similar_careers(db: Session, career_id: str, limit: int = 5) -> List[Career]:
        """Get similar careers based on skills"""
        career = CareerService.get_career_by_id(db, career_id)
        if not career:
            return []
        
        # Get skills for this career
        career_skills = db.query(CareerSkill).filter(
            CareerSkill.career_id == career_id
        ).all()
        skill_ids = [cs.skill_id for cs in career_skills]
        
        if not skill_ids:
            return []
        
        # Find other careers with similar skills
        similar = db.query(Career).filter(
            Career.id != career_id
        ).join(CareerSkill).filter(
            CareerSkill.skill_id.in_(skill_ids)
        ).group_by(Career.id).order_by(
            func.count(CareerSkill.id).desc()
        ).limit(limit).all()
        
        return similar
    
    @staticmethod
    def get_user_career_fit(db: Session, user: User, career: Career) -> Dict:
        """Calculate user's fit for a specific career"""
        
        # Get user skills
        user_skill_ids = db.query(UserSkill.skill_id).filter(
            UserSkill.user_id == user.id
        ).all()
        user_skill_ids = set([s[0] for s in user_skill_ids])
        
        # Get career required skills
        career_skills = CareerService.get_career_skills(db, career.id)
        
        matched = []
        missing = []
        weak = []
        
        for cs in career_skills:
            if cs.skill_id in user_skill_ids:
                matched.append(cs.skill.name)
            else:
                if cs.importance == "HIGH":
                    missing.append(cs.skill.name)
                else:
                    weak.append(cs.skill.name)
        
        # Calculate fit score
        if career_skills:
            fit_score = (len(matched) / len(career_skills)) * 100
        else:
            fit_score = 0
        
        # Adjust for experience
        exp_adjustment = 0
        if user.profile:
            if user.profile.experience_level == "beginner" and career.difficulty == "Beginner":
                exp_adjustment = 10
            elif user.profile.experience_level == "intermediate" and career.difficulty == "Intermediate":
                exp_adjustment = 10
            elif user.profile.experience_level == "advanced" and career.difficulty == "Advanced":
                exp_adjustment = 10
        
        final_score = min(fit_score + exp_adjustment, 100)
        
        return {
            "career_id": career.id,
            "career_title": career.title,
            "fit_score": final_score,
            "matched_skills": matched,
            "missing_skills": missing,
            "weak_skills": weak,
            "learning_time": career.average_learning_time,
            "difficulty": career.difficulty
        }
    
    @staticmethod
    def get_career_roadmap_info(db: Session, career_id: str) -> Dict:
        """Get roadmap information for a career"""
        career = CareerService.get_career_by_id(db, career_id)
        if not career:
            return {}
        
        skills = CareerService.get_career_skills(db, career_id)
        
        # Organize skills by importance
        high_priority = [s for s in skills if s.importance == "HIGH"]
        medium_priority = [s for s in skills if s.importance == "MEDIUM"]
        low_priority = [s for s in skills if s.importance == "LOW"]
        
        return {
            "career_id": career.id,
            "career_title": career.title,
            "description": career.description,
            "difficulty": career.difficulty,
            "estimated_duration": career.average_learning_time,
            "high_priority_skills": [
                {"id": s.skill_id, "name": s.skill.name, "level": s.required_level}
                for s in high_priority
            ],
            "medium_priority_skills": [
                {"id": s.skill_id, "name": s.skill.name, "level": s.required_level}
                for s in medium_priority
            ],
            "low_priority_skills": [
                {"id": s.skill_id, "name": s.skill.name, "level": s.required_level}
                for s in low_priority
            ]
        }
    
    @staticmethod
    def create_career(db: Session, career_data: Dict) -> Career:
        """Create new career"""
        career = Career(**career_data)
        db.add(career)
        db.commit()
        db.refresh(career)
        return career
    
    @staticmethod
    def add_skill_to_career(db: Session, career_id: str, skill_id: str, importance: str, level: str) -> CareerSkill:
        """Add skill requirement to career"""
        cs = CareerSkill(
            career_id=career_id,
            skill_id=skill_id,
            importance=importance,
            required_level=level
        )
        db.add(cs)
        db.commit()
        db.refresh(cs)
        return cs

from sqlalchemy import func