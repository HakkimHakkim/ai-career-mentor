from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, ForeignKeyConstraint, Table, Boolean, UniqueConstraint
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

# Association table for course skills
course_skills = Table(
    'course_skills',
    BaseModel.metadata,
    Column('course_id', String(36), ForeignKey('learning_courses.id')),
    Column('skill_id', String(36), ForeignKey('skills.id'))
)

class LearningCourse(BaseModel):
    """Learning course model"""
    __tablename__ = "learning_courses"
    
    title = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    difficulty = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced
    
    instructor = Column(String(255), nullable=True)
    provider = Column(String(100), nullable=True)  # Udemy, Coursera, etc
    provider_url = Column(String(500), nullable=True)
    
    duration_hours = Column(Integer, nullable=True)
    estimated_weeks = Column(Integer, nullable=True)
    rating = Column(Float, nullable=True)
    total_reviews = Column(Integer, default=0)
    
    price = Column(Float, nullable=True)
    is_free = Column(Boolean, default=True)
    
    # Relationships
    lessons = relationship("LearningLesson", back_populates="course", cascade="all, delete-orphan")
    skills = relationship("Skill", secondary=course_skills)
    user_progress = relationship("UserCourseProgress", back_populates="course", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<LearningCourse(id={self.id}, title={self.title})>"


class LearningLesson(BaseModel):
    """Individual lesson model"""
    __tablename__ = "learning_lessons"
    
    course_id = Column(String(36), ForeignKey("learning_courses.id"), nullable=False)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    
    order = Column(Integer, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    
    video_url = Column(String(500), nullable=True)
    resources = Column(Text, nullable=True)  # JSON array
    
    # Relationships
    course = relationship("LearningCourse", back_populates="lessons")
    quiz = relationship("LearningQuiz", uselist=False, back_populates="lesson")
    
    __table_args__ = (
        ForeignKeyConstraint(['course_id'], ['learning_courses.id']),
    )


class LearningQuiz(BaseModel):
    """Quiz for lesson"""
    __tablename__ = "learning_quizzes"
    
    lesson_id = Column(String(36), ForeignKey("learning_lessons.id"), nullable=False, unique=True)
    
    passing_score = Column(Integer, default=70)
    questions_count = Column(Integer, nullable=True)
    
    # Relationships
    lesson = relationship("LearningLesson", back_populates="quiz")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    user_attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class QuizQuestion(BaseModel):
    """Quiz question model"""
    __tablename__ = "quiz_questions"
    
    quiz_id = Column(String(36), ForeignKey("learning_quizzes.id"), nullable=False)
    
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), nullable=False)  # multiple_choice, true_false, short_answer
    options = Column(Text, nullable=True)  # JSON array
    correct_answer = Column(String(500), nullable=True)
    explanation = Column(Text, nullable=True)
    
    order = Column(Integer, nullable=False)
    
    # Relationships
    quiz = relationship("LearningQuiz", back_populates="questions")


class UserCourseProgress(BaseModel):
    """User's progress in a course"""
    __tablename__ = "user_course_progress"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    course_id = Column(String(36), ForeignKey("learning_courses.id"), nullable=False)
    
    total_lessons = Column(Integer, nullable=False)
    lessons_completed = Column(Integer, default=0)
    progress_percentage = Column(Float, default=0.0)
    
    status = Column(String(50), default="not_started")  # not_started, in_progress, completed
    certificate_earned = Column(Boolean, default=False)
    
    # Relationships
    user = relationship("User")
    course = relationship("LearningCourse", back_populates="user_progress")
    lesson_progress = relationship("UserLessonProgress", back_populates="course_progress", cascade="all, delete-orphan")
    
    __table_args__ = (
        ForeignKeyConstraint(['user_id'], ['users.id']),
        ForeignKeyConstraint(['course_id'], ['learning_courses.id']),
        UniqueConstraint('user_id', 'course_id', name='unique_user_course'),
    )


class UserLessonProgress(BaseModel):
    """User's progress in individual lesson"""
    __tablename__ = "user_lesson_progress"
    
    course_progress_id = Column(String(36), ForeignKey("user_course_progress.id"), nullable=False)
    lesson_id = Column(String(36), ForeignKey("learning_lessons.id"), nullable=False)
    
    is_completed = Column(Boolean, default=False)
    time_spent_minutes = Column(Integer, default=0)
    
    # Relationships
    course_progress = relationship("UserCourseProgress", back_populates="lesson_progress")


class QuizAttempt(BaseModel):
    """User's quiz attempt"""
    __tablename__ = "quiz_attempts"
    
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    quiz_id = Column(String(36), ForeignKey("learning_quizzes.id"), nullable=False)
    
    score = Column(Integer, nullable=True)
    passed = Column(Boolean, nullable=True)
    attempt_number = Column(Integer, default=1)
    
    # Relationships
    user = relationship("User")
    quiz = relationship("LearningQuiz", back_populates="user_attempts")
    answers = relationship("QuizAnswer", back_populates="attempt", cascade="all, delete-orphan")


class QuizAnswer(BaseModel):
    """User's answer to quiz question"""
    __tablename__ = "quiz_answers"
    
    attempt_id = Column(String(36), ForeignKey("quiz_attempts.id"), nullable=False)
    question_id = Column(String(36), ForeignKey("quiz_questions.id"), nullable=False)
    
    answer_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    
    # Relationships
    attempt = relationship("QuizAttempt", back_populates="answers")