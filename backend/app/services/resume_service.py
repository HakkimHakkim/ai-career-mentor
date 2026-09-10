import os
import shutil
from pathlib import Path
from datetime import datetime
import PyPDF2
from docx import Document
from sqlalchemy.orm import Session
from app.models.resume import Resume, ResumeAnalysis
from app.config import get_settings
import json
from typing import Tuple
import re

settings = get_settings()


class ResumeService:
    """Resume processing and analysis service"""

    ALLOWED_EXTENSIONS = settings.ALLOWED_EXTENSIONS
    MAX_FILE_SIZE = settings.MAX_UPLOAD_SIZE
    UPLOAD_DIR = settings.UPLOAD_DIR

    @staticmethod
    def validate_file(filename: str, file_size: int) -> tuple:
        """Validate file"""
        if file_size > ResumeService.MAX_FILE_SIZE:
            return False, "File size exceeds maximum limit"

        ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
        if ext not in ResumeService.ALLOWED_EXTENSIONS:
            return False, f"File type not allowed. Allowed: {', '.join(ResumeService.ALLOWED_EXTENSIONS)}"

        return True, "File is valid"

    @staticmethod
    def save_file(file_content: bytes, original_filename: str) -> str:
        """Save uploaded file"""
        os.makedirs(ResumeService.UPLOAD_DIR, exist_ok=True)

        ext = original_filename.rsplit('.', 1)[1].lower()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        stored_filename = f"resume_{timestamp}_{Path(original_filename).stem}.{ext}"

        filepath = os.path.join(ResumeService.UPLOAD_DIR, stored_filename)

        with open(filepath, 'wb') as f:
            f.write(file_content)

        return stored_filename

    @staticmethod
    def extract_text_from_pdf(filepath: str) -> str:
        """Extract text from PDF"""
        text = ""
        try:
            with open(filepath, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text()
        except Exception as e:
            print(f"Error extracting PDF: {e}")

        return text

    @staticmethod
    def extract_text_from_docx(filepath: str) -> str:
        """Extract text from DOCX"""
        text = ""
        try:
            doc = Document(filepath)
            for para in doc.paragraphs:
                text += para.text + "\n"
        except Exception as e:
            print(f"Error extracting DOCX: {e}")

        return text

    @staticmethod
    def extract_text(filepath: str, file_type: str) -> str:
        """Extract text from resume"""
        if file_type == 'pdf':
            return ResumeService.extract_text_from_pdf(filepath)
        elif file_type == 'docx':
            return ResumeService.extract_text_from_docx(filepath)

        return ""

    @staticmethod
    def extract_contact_info(text: str) -> dict:
        """Extract contact information"""
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        phone_pattern = r'(?:\+\d{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}'

        email = re.search(email_pattern, text)
        phone = re.search(phone_pattern, text)

        lines = text.split('\n')
        name = lines[0] if lines else ""

        return {
            "name": name.strip(),
            "email": email.group() if email else None,
            "phone": phone.group() if phone else None
        }

    @staticmethod
    def detect_skills(text: str) -> list:
        """Detect skills in resume text"""
        skill_keywords = [
            'python', 'sql', 'excel', 'power bi', 'tableau', 'statistics',
            'r', 'java', 'javascript', 'react', 'node.js', 'aws', 'azure',
            'docker', 'kubernetes', 'git', 'linux', 'communication',
            'leadership', 'problem solving', 'project management', 'agile',
            'scrum', 'pandas', 'numpy', 'scikit-learn', 'tensorflow'
        ]

        text_lower = text.lower()
        detected_skills = []

        for skill in skill_keywords:
            if skill in text_lower:
                detected_skills.append(skill.title())

        return list(set(detected_skills))

    @staticmethod
    def calculate_career_fit(detected_skills: list, required_skills: list) -> dict:
        """Compare resume skills vs selected career's required skills"""
        detected_lower = [s.lower() for s in detected_skills]
        matched = [s for s in required_skills if s.lower() in detected_lower]
        missing = [s for s in required_skills if s.lower() not in detected_lower]
        fit_score = round((len(matched) / len(required_skills)) * 100, 1) if required_skills else 0
        return {"fit_score": fit_score, "matched": matched, "missing": missing}

    @staticmethod
    def save_resume(
        user_id: str,
        original_filename: str,
        stored_filename: str,
        file_type: str,
        db: Session
    ) -> Resume:
        """Save resume to database"""
        resume = Resume(
            user_id=user_id,
            original_filename=original_filename,
            stored_filename=stored_filename,
            file_type=file_type,
            is_primary=True
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return resume

    @staticmethod
    async def analyze_resume(
        resume: Resume,
        db: Session,
        career_goal: str = "Software Engineer",
        required_skills: list = None,
        career_title: str = None
    ) -> ResumeAnalysis:
        """Analyze resume using Grok AI + career fit scoring"""
        from app.services.grok_service import GrokService

        filepath = os.path.join(ResumeService.UPLOAD_DIR, resume.stored_filename)

        text = ResumeService.extract_text(filepath, resume.file_type)
        resume.extracted_text = text

        contact_info = ResumeService.extract_contact_info(text)
        skills = ResumeService.detect_skills(text)

        career_fit = None
        if required_skills:
            career_fit = ResumeService.calculate_career_fit(skills, required_skills)

        try:
            print(f"DEBUG: Calling Grok with career_goal={career_goal}")
            ai_analysis = await GrokService.analyze_resume_for_career(text, career_goal)

            overall_score = int(ai_analysis.get("score_out_of_100", 70))
            missing_skills = ai_analysis.get("missing_keywords", [])
            improvements = ai_analysis.get("improvements", [])

        except Exception as e:
            print(f"Grok analysis failed: {e}, using fallback")
            overall_score = 70 + (len(skills) * 2)
            overall_score = min(overall_score, 100)
            missing_skills = []
            improvements = []

        analysis = ResumeAnalysis(
            resume_id=resume.id,
            overall_score=overall_score,
            skill_match_score=min(75 + len(skills) * 2, 100),
            keyword_score=70 + len([s for s in skills if s]),
            projects_score=65 + (10 if 'project' in text.lower() else 0),
            experience_score=75 + (10 if 'year' in text.lower() else 0),
            extracted_name=contact_info['name'],
            extracted_email=contact_info['email'],
            extracted_phone=contact_info['phone'],
            detected_skills=json.dumps(skills),
            missing_skills=json.dumps(missing_skills if missing_skills else []),
            recommendations=json.dumps(improvements if improvements else [
                "Add more keywords related to your target career",
                "Highlight your projects and achievements",
                "Use action verbs in your bullet points"
            ]),
            career_title=career_title,
            career_fit_score=career_fit["fit_score"] if career_fit else None,
            career_matched_skills=json.dumps(career_fit["matched"] if career_fit else []),
            career_missing_skills=json.dumps(career_fit["missing"] if career_fit else [])
        )

        db.add(analysis)
        db.commit()
        db.refresh(analysis)

        return analysis

    @staticmethod
    def get_resume(user_id: str, db: Session) -> Resume:
        """Get user's primary resume"""
        resume = db.query(Resume).filter(
            Resume.user_id == user_id,
            Resume.is_primary == True
        ).first()

        return resume

    @staticmethod
    def delete_resume(resume_id: str, db: Session) -> bool:
        """Delete resume"""
        resume = db.query(Resume).filter(Resume.id == resume_id).first()

        if resume:
            filepath = os.path.join(ResumeService.UPLOAD_DIR, resume.stored_filename)
            if os.path.exists(filepath):
                os.remove(filepath)

            db.delete(resume)
            db.commit()

            return True

        return False