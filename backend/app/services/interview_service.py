import json
from typing import List, Dict, Any

from sqlalchemy.orm import Session

from app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
)
from app.models.user import User
from app.services.grok_service import GrokService


class InterviewService:
    """Interview preparation service."""

    # =========================================================
    # INTERVIEW TEMPLATES
    # =========================================================

    INTERVIEW_TEMPLATES = {
        "technical": {
            "title": "Technical Interview",
            "difficulty": "Medium",
            "questions_count": 10,
            "description": "Technical questions related to the candidate's career.",
        },

        "hr": {
            "title": "HR Interview",
            "difficulty": "Easy",
            "questions_count": 10,
            "description": "Behavior, motivation and soft-skill questions.",
        },

        "behavioral": {
            "title": "Behavioral Interview",
            "difficulty": "Medium",
            "questions_count": 10,
            "description": "Past experiences, teamwork and problem-solving.",
        },

        "mock": {
            "title": "Mock Interview",
            "difficulty": "Hard",
            "questions_count": 15,
            "description": "Full interview simulation.",
        },
                "general": {
            "title": "General Interview",
            "difficulty": "Easy",
            "questions_count": 10,
            "description": "Common interview questions to test communication, confidence and clarity.",
        },
    }
    

    # =========================================================
    # CREATE SESSION
    # =========================================================

    @staticmethod
    async def create_session(
        user: User,
        interview_type: str,
        db: Session,
    ) -> InterviewSession:

        template = InterviewService.INTERVIEW_TEMPLATES.get(
            interview_type
        )

        if not template:
            raise ValueError(
                f"Invalid interview type: {interview_type}"
            )

        # -----------------------------------------------------
        # Create interview session
        # -----------------------------------------------------

        session = InterviewSession(
            user_id=user.id,
            interview_type=interview_type,
            title=template["title"],
            difficulty=template["difficulty"],
            total_questions=template["questions_count"],
            questions_answered=0,
            overall_score=None,
            performance_feedback=None,
            status="in_progress",
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        # -----------------------------------------------------
        # Generate questions
        # -----------------------------------------------------

        try:
            questions = await InterviewService.generate_questions(
                user=user,
                interview_type=interview_type,
                count=template["questions_count"],
            )

        except Exception as exc:
            print(
                "Question generation failed:",
                str(exc),
            )

            db.delete(session)
            db.commit()

            raise

        # -----------------------------------------------------
        # Save generated questions
        # -----------------------------------------------------

        for index, question_data in enumerate(questions):

            question = InterviewQuestion(
                session_id=session.id,

                question_text=question_data.get(
                    "question",
                    f"{interview_type.title()} Question {index + 1}",
                ),

                question_type=question_data.get(
                    "type",
                    interview_type,
                ),

                model_answer=question_data.get(
                    "model_answer",
                    "",
                ),

                tips=json.dumps(
                    question_data.get(
                        "tips",
                        [],
                    )
                ),

                order=index + 1,
            )

            db.add(question)

        db.commit()
        db.refresh(session)

        return session

    # =========================================================
    # GENERATE QUESTIONS
    # =========================================================

    @staticmethod
    async def generate_questions(
        user: User,
        interview_type: str,
        count: int,
    ) -> List[Dict[str, Any]]:
        """
        Generate interview questions using AI.

        If AI generation fails, fallback questions are returned.
        """

        # -----------------------------------------------------
        # User profile
        # -----------------------------------------------------

        career = "Software Engineer"
        experience = "beginner"

        profile = getattr(
            user,
            "profile",
            None,
        )

        if profile:

            career = (
                getattr(
                    profile,
                    "career_goal",
                    None,
                )
                or "Software Engineer"
            )

            experience = (
                getattr(
                    profile,
                    "experience_level",
                    None,
                )
                or "beginner"
            )

        # -----------------------------------------------------
        # Prompt
        # -----------------------------------------------------

        prompt = f"""
Generate exactly {count} interview questions.

Interview Type:
{interview_type}

Career:
{career}

Target Experience:
{experience}

Requirements:

1. Questions must be relevant to the career.
2. Questions must match the interview type.
3. Questions must match the experience level.
4. Questions must be realistic interview questions.
5. Avoid duplicate questions.
6. Include a model answer for every question.
7. Include useful interview tips.

Return ONLY a valid JSON array.

Do not use markdown.
Do not use ```json.
Do not add explanations outside JSON.

Each item must follow this format:

{{
    "question": "Question text",
    "type": "{interview_type}",
    "model_answer": "Good model answer",
    "tips": [
        "Tip 1",
        "Tip 2"
    ]
}}
"""

        # -----------------------------------------------------
        # Try AI generation
        # -----------------------------------------------------

        for attempt in range(2):

            try:

                print(
                    f"Generating interview questions "
                    f"(attempt {attempt + 1}/2)"
                )

                response = await GrokService.call_grok(
                    prompt=prompt,

                    system_prompt="""
You are an expert interview question generator.

Return ONLY valid JSON.

Never return markdown.
Never return explanations outside JSON.
Do not duplicate questions.
""",

                    temperature=0.4,

                    max_tokens=max(
                        4000,
                        count * 450,
                    ),

                    timeout=90,
                )

                print("========================================")
                print("INTERVIEW QUESTIONS RAW RESPONSE")
                print(response)
                print("========================================")

                questions = (
                    InterviewService._extract_json_array(
                        response
                    )
                )

                if not isinstance(
                    questions,
                    list,
                ):
                    raise ValueError(
                        "AI response is not a JSON list"
                    )

                valid_questions = []

                for question in questions:

                    if not isinstance(
                        question,
                        dict,
                    ):
                        continue

                    question_text = str(
                        question.get(
                            "question",
                            "",
                        )
                    ).strip()

                    if not question_text:
                        continue

                    question_type = str(
                        question.get(
                            "type",
                            interview_type,
                        )
                    ).strip()

                    if not question_type:
                        question_type = interview_type

                    model_answer = str(
                        question.get(
                            "model_answer",
                            "",
                        )
                    ).strip()

                    tips = question.get(
                        "tips",
                        [],
                    )

                    if not isinstance(
                        tips,
                        list,
                    ):
                        tips = [str(tips)]

                    tips = [
                        str(tip).strip()
                        for tip in tips
                        if str(tip).strip()
                    ]

                    valid_questions.append(
                        {
                            "question": question_text,
                            "type": question_type,
                            "model_answer": model_answer,
                            "tips": tips,
                        }
                    )

                # -------------------------------------------------
                # Check exact count
                # -------------------------------------------------

                if len(valid_questions) >= count:

                    print(
                        f"Successfully generated "
                        f"{len(valid_questions)} questions."
                    )

                    return valid_questions[:count]

                print(
                    f"AI returned "
                    f"{len(valid_questions)}/{count} "
                    f"valid questions."
                )

            except Exception as exc:

                print(
                    f"Question generation error "
                    f"(attempt {attempt + 1}):",
                    str(exc),
                )

        # =====================================================
        # FALLBACK QUESTIONS
        # =====================================================

        print(
            f"Using fallback questions for "
            f"{interview_type}"
        )

        return InterviewService._generate_fallback_questions(
            interview_type=interview_type,
            career=career,
            count=count,
        )

    # =========================================================
    # FALLBACK QUESTIONS
    # =========================================================

    @staticmethod
    def _generate_fallback_questions(
        interview_type: str,
        career: str,
        count: int,
    ) -> List[Dict[str, Any]]:

        # -----------------------------------------------------
        # Technical
        # -----------------------------------------------------

        technical_questions = [
            {
                "question": (
                    "What is the difference between "
                    "synchronous and asynchronous programming "
                    "in JavaScript?"
                ),
                "type": "technical",
                "model_answer": (
                    "Synchronous code executes one operation "
                    "at a time and waits for each operation "
                    "to finish. Asynchronous code allows "
                    "long-running operations to execute "
                    "without blocking the main flow. "
                    "Promises and async/await are commonly "
                    "used for asynchronous programming."
                ),
                "tips": [
                    "Explain blocking versus non-blocking execution.",
                    "Give an async/await example.",
                ],
            },
            {
                "question": (
                    "What is a RESTful API and what are the "
                    "main HTTP methods used in CRUD operations?"
                ),
                "type": "technical",
                "model_answer": (
                    "A RESTful API is an API that follows REST "
                    "principles and uses HTTP methods to work "
                    "with resources. GET is used to retrieve, "
                    "POST to create, PUT or PATCH to update, "
                    "and DELETE to remove resources."
                ),
                "tips": [
                    "Mention resources and HTTP methods.",
                    "Connect the methods to CRUD operations.",
                ],
            },
            {
                "question": (
                    "Write a SQL query to retrieve the top "
                    "three highest-paid employees from an "
                    "employees table."
                ),
                "type": "technical",
                "model_answer": (
                    "SELECT name, salary "
                    "FROM employees "
                    "ORDER BY salary DESC "
                    "LIMIT 3;"
                ),
                "tips": [
                    "Sort salary in descending order.",
                    "Limit the result to three rows.",
                ],
            },
            {
                "question": (
                    "What is the purpose of the useEffect hook "
                    "in React?"
                ),
                "type": "technical",
                "model_answer": (
                    "useEffect is used to perform side effects "
                    "in a React component, such as API calls, "
                    "subscriptions, timers, or updating external "
                    "systems. Its dependency array controls "
                    "when the effect runs."
                ),
                "tips": [
                    "Explain the dependency array.",
                    "Mention API calls as a common example.",
                ],
            },
            {
                "question": (
                    "Implement a Python function that checks "
                    "whether a string is a palindrome while "
                    "ignoring case and non-alphanumeric characters."
                ),
                "type": "technical",
                "model_answer": (
                    "Normalize the string by converting it to "
                    "lowercase and keeping only alphanumeric "
                    "characters. Then compare the normalized "
                    "string with its reverse."
                ),
                "tips": [
                    "Normalize the input first.",
                    "Use string reversal or two pointers.",
                ],
            },
            {
                "question": (
                    "How does the HTTP request-response cycle "
                    "work when a user submits a form?"
                ),
                "type": "technical",
                "model_answer": (
                    "The browser sends an HTTP request to the "
                    "backend API. The server receives and "
                    "validates the request, performs the required "
                    "logic or database operation, and returns "
                    "an HTTP response. The browser then processes "
                    "the response and updates the UI."
                ),
                "tips": [
                    "Mention request and response.",
                    "Explain backend processing.",
                ],
            },
        ]

        # -----------------------------------------------------
        # HR
        # -----------------------------------------------------

        hr_questions = [
            {
                "question": (
                    "Tell me about yourself and your background."
                ),
                "type": "hr",
                "model_answer": (
                    "Give a concise introduction covering "
                    "education, important skills, projects, "
                    "achievements and career goals."
                ),
                "tips": [
                    "Keep the answer around 1-2 minutes.",
                    "Focus on job-relevant information.",
                ],
            },
            {
                "question": (
                    f"Why are you interested in {career}?"
                ),
                "type": "hr",
                "model_answer": (
                    "Explain your interest in the field, "
                    "relevant skills, projects and long-term "
                    "career goals."
                ),
                "tips": [
                    "Connect your skills to the career.",
                    "Show genuine interest.",
                ],
            },
            {
                "question": (
                    "What are your greatest strengths?"
                ),
                "type": "hr",
                "model_answer": (
                    "Mention two or three strengths that are "
                    "relevant to the role and support them "
                    "with short examples."
                ),
                "tips": [
                    "Use real examples.",
                    "Choose strengths relevant to the role.",
                ],
            },
            {
                "question": (
                    "What is one area you are currently "
                    "working to improve?"
                ),
                "type": "hr",
                "model_answer": (
                    "Mention a genuine improvement area and "
                    "explain the specific steps you are taking "
                    "to improve it."
                ),
                "tips": [
                    "Be honest.",
                    "Focus on improvement rather than weakness.",
                ],
            },
            {
                "question": (
                    "Where do you see yourself in the next "
                    "three to five years?"
                ),
                "type": "hr",
                "model_answer": (
                    "Explain realistic career goals, skills "
                    "you want to develop and how you want to "
                    "contribute to the organization."
                ),
                "tips": [
                    "Keep your goals realistic.",
                    "Connect them to the career.",
                ],
            },
        ]

        # -----------------------------------------------------
        # Behavioral
        # -----------------------------------------------------

        behavioral_questions = [
            {
                "question": (
                    "Tell me about a challenging problem "
                    "you solved."
                ),
                "type": "behavioral",
                "model_answer": (
                    "Use the STAR method: explain the Situation, "
                    "Task, Action and Result."
                ),
                "tips": [
                    "Use a real project example.",
                    "Focus on your actions and result.",
                ],
            },
            {
                "question": (
                    "Describe a time when you had to learn "
                    "a new technology quickly."
                ),
                "type": "behavioral",
                "model_answer": (
                    "Explain the situation, why you needed the "
                    "technology, how you learned it quickly, "
                    "and the result."
                ),
                "tips": [
                    "Explain your learning process.",
                    "Mention the final outcome.",
                ],
            },
            {
                "question": (
                    "Tell me about a time you worked as "
                    "part of a team."
                ),
                "type": "behavioral",
                "model_answer": (
                    "Explain the team situation, your role, "
                    "how you collaborated and what the team "
                    "achieved."
                ),
                "tips": [
                    "Focus on collaboration.",
                    "Mention your specific contribution.",
                ],
            },
            {
                "question": (
                    "Tell me about a time you made a mistake "
                    "and how you handled it."
                ),
                "type": "behavioral",
                "model_answer": (
                    "Describe the mistake honestly, explain "
                    "how you corrected it and what you learned."
                ),
                "tips": [
                    "Do not blame others.",
                    "Show what you learned.",
                ],
            },
            {
                "question": (
                    "Describe a situation where you had to "
                    "meet a tight deadline."
                ),
                "type": "behavioral",
                "model_answer": (
                    "Explain how you prioritized tasks, "
                    "managed your time and delivered the result."
                ),
                "tips": [
                    "Explain your prioritization.",
                    "Mention the result.",
                ],
                
            },
            
        ]
        general_questions = [
            {"question": "Tell me about yourself.", "type": "general",
             "model_answer": "Give a short, structured introduction: education, key skills, one or two achievements, and what you're looking for next.",
             "tips": ["Keep it under 2 minutes.", "Structure: present, past, future."]},
            {"question": "Why should we hire you?", "type": "general",
             "model_answer": "Connect your specific skills and past results directly to what the role needs.",
             "tips": ["Be specific, not generic.", "Back claims with an example."]},
            {"question": "What are your strengths?", "type": "general",
             "model_answer": "Pick 2-3 relevant strengths and support each with a short real example.",
             "tips": ["Relevance over quantity.", "Use one example per strength."]},
            {"question": "What is one area you are trying to improve?", "type": "general",
             "model_answer": "Name a genuine, non-critical improvement area and the concrete steps you're taking on it.",
             "tips": ["Be honest, not self-deprecating.", "Show an action plan."]},
            {"question": "Why are you interested in this career?", "type": "general",
             "model_answer": "Explain what drew you to the field and connect it to your skills and goals.",
             "tips": ["Show genuine motivation.", "Link interest to your background."]},
            {"question": "Why do you want to join our company?", "type": "general",
             "model_answer": "Show you've researched the company and explain the specific fit between you and them.",
             "tips": ["Avoid generic answers.", "Mention something specific about the company."]},
            {"question": "Tell me about one of your projects.", "type": "general",
             "model_answer": "Describe the project's goal, your role, the tech/approach used, and the outcome.",
             "tips": ["Focus on your contribution.", "Mention the result or impact."]},
            {"question": "Describe a challenge you faced and how you solved it.", "type": "general",
             "model_answer": "Use STAR: Situation, Task, Action, Result.",
             "tips": ["Use a real example.", "Emphasize your actions and the result."]},
            {"question": "Where do you see yourself in 3-5 years?", "type": "general",
             "model_answer": "Share realistic growth goals aligned with the role and company.",
             "tips": ["Keep it realistic.", "Align with the career path."]},
            {"question": "Do you have any questions for the interviewer?", "type": "general",
             "model_answer": "Ask a thoughtful question about the team, role expectations, or growth opportunities.",
             "tips": ["Always have at least one question ready.", "Avoid asking only about salary."]},
        ]

        # -----------------------------------------------------
        # Select fallback based on type
        # -----------------------------------------------------

        if interview_type == "technical":
            base_questions = technical_questions

        elif interview_type == "hr":
            base_questions = hr_questions

        elif interview_type == "behavioral":
            base_questions = behavioral_questions
        elif interview_type == "general":
            base_questions = general_questions

        else:
            # Mock interview combines different categories.
            base_questions = (
                technical_questions
                + behavioral_questions
                + hr_questions
            )

        # -----------------------------------------------------
        # Generate required count
        # -----------------------------------------------------

        result = []

        for index in range(count):

            original = base_questions[
                index % len(base_questions)
            ]

            question = original.copy()

            # Prevent obvious duplicate wording
            # when fallback count is greater than available questions.
            if index >= len(base_questions):

                question["question"] = (
                    f"{question['question']} "
                    f"(Question {index + 1})"
                )

            result.append(question)

        return result

    # =========================================================
    # EVALUATE ANSWER
    # =========================================================

    @staticmethod
    async def evaluate_answer(
        session_id: str,
        question_id: str,
        answer_text: str,
        db: Session,
    ) -> InterviewAnswer:

        # -----------------------------------------------------
        # Get session
        # -----------------------------------------------------

        session = (
            db.query(InterviewSession)
            .filter(
                InterviewSession.id == session_id
            )
            .first()
        )

        if not session:
            raise ValueError(
                "Interview session not found"
            )

        # -----------------------------------------------------
        # Get question
        # -----------------------------------------------------

        question = (
            db.query(InterviewQuestion)
            .filter(
                InterviewQuestion.id == question_id,
                InterviewQuestion.session_id == session_id,
            )
            .first()
        )

        if not question:
            raise ValueError(
                "Question not found"
            )

        # -----------------------------------------------------
        # Validate answer
        # -----------------------------------------------------

        if not answer_text or not answer_text.strip():

            raise ValueError(
                "Answer cannot be empty"
            )

        clean_answer = answer_text.strip()

        # -----------------------------------------------------
        # Get career
        # -----------------------------------------------------

        career = "Software Engineer"

        session_user = getattr(
            session,
            "user",
            None,
        )

        profile = getattr(
            session_user,
            "profile",
            None,
        )

        if profile:

            career = (
                getattr(
                    profile,
                    "career_goal",
                    None,
                )
                or "Software Engineer"
            )

        # -----------------------------------------------------
        # Evaluate using AI
        # -----------------------------------------------------

        evaluation = await GrokService.evaluate_interview_answer(
            question=question.question_text,
            answer=clean_answer,
            career=career,
        )

        if not isinstance(
            evaluation,
            dict,
        ):
            evaluation = {}

        # -----------------------------------------------------
        # Normalize score
        # -----------------------------------------------------

        raw_score = evaluation.get(
            "score",
            0,
        )

        try:
            score_10 = float(raw_score)

        except (
            ValueError,
            TypeError,
        ):
            score_10 = 0

        # Protect against AI returning 0-100
        if score_10 > 10:
            score_10 = score_10 / 10

        score_10 = max(
            0,
            min(
                10,
                score_10,
            ),
        )

        score_10 = round(
            score_10,
            1,
        )

        # Database score is 0-100
        final_score = round(
            score_10 * 10,
            1,
        )

        acceptable = score_10 >= 5

        # -----------------------------------------------------
        # Check existing answer
        # -----------------------------------------------------

        existing_answer = (
            db.query(InterviewAnswer)
            .filter(
                InterviewAnswer.session_id == session_id,
                InterviewAnswer.question_id == question_id,
            )
            .first()
        )

        # -----------------------------------------------------
        # Update existing answer
        # -----------------------------------------------------

        if existing_answer:

            existing_answer.answer_text = clean_answer

            existing_answer.score = final_score

            existing_answer.feedback = evaluation.get(
                "feedback",
                "Answer evaluated successfully.",
            )

            existing_answer.strengths = json.dumps(
                evaluation.get(
                    "strengths",
                    [],
                )
            )
            existing_answer.missing_points = json.dumps(
                 evaluation.get("missing_points", [])
            )

            existing_answer.improvements = json.dumps(
                evaluation.get(
                    "improvements",
                    [],
                )
            )

            answer = existing_answer

        # -----------------------------------------------------
        # Create new answer
        # -----------------------------------------------------

        else:

            answer = InterviewAnswer(
                session_id=session_id,
                question_id=question_id,
                answer_text=clean_answer,
                score=final_score,

                feedback=evaluation.get(
                    "feedback",
                    "Answer evaluated successfully.",
                ),

                strengths=json.dumps(
                    evaluation.get(
                        "strengths",
                        [],
                    )
                ),
                                missing_points=json.dumps(
                    evaluation.get("missing_points", [])
                ),

                improvements=json.dumps(
                    evaluation.get(
                        "improvements",
                        [],
                    )
                ),
            )

            db.add(answer)

            # Count only first submission
            session.questions_answered = (
                session.questions_answered + 1
            )

        # -----------------------------------------------------
        # Commit
        # -----------------------------------------------------

        db.commit()
        db.refresh(answer)

        return answer

    # =========================================================
    # COMPLETE SESSION
    # =========================================================

    @staticmethod
    def complete_session(
        session_id: str,
        db: Session,
    ) -> InterviewSession:

        session = (
            db.query(InterviewSession)
            .filter(
                InterviewSession.id == session_id
            )
            .first()
        )

        if not session:
            raise ValueError(
                "Interview session not found"
            )

        # -----------------------------------------------------
        # Get all answers
        # -----------------------------------------------------

        answers = (
            db.query(InterviewAnswer)
            .filter(
                InterviewAnswer.session_id == session_id
            )
            .all()
        )

        # -----------------------------------------------------
        # Calculate overall score
        # -----------------------------------------------------

        if answers:

            scores = []

            for answer in answers:

                try:
                    score = float(
                        answer.score or 0
                    )

                except (
                    ValueError,
                    TypeError,
                ):
                    score = 0

                scores.append(score)

            average_score = (
                sum(scores) / len(scores)
            )

            session.overall_score = round(
                average_score,
                1,
            )

        else:

            session.overall_score = 0

        # -----------------------------------------------------
        # Generate performance feedback
        # -----------------------------------------------------

        overall = float(
            session.overall_score or 0
        )

        if overall >= 90:

            feedback = (
                "Excellent interview performance. "
                "Your answers were strong, relevant and "
                "well structured."
            )

        elif overall >= 75:

            feedback = (
                "Very good interview performance. "
                "You demonstrated good knowledge with "
                "some areas for improvement."
            )

        elif overall >= 60:

            feedback = (
                "Good effort. Your fundamentals are present, "
                "but you should improve answer depth and clarity."
            )

        elif overall >= 40:

            feedback = (
                "Your performance needs improvement. "
                "Focus on fundamentals and practice answering "
                "interview questions clearly."
            )

        else:

            feedback = (
                "More preparation is recommended. "
                "Review the core concepts and practice "
                "interview questions regularly."
            )

        session.performance_feedback = feedback

        # -----------------------------------------------------
        # Complete session
        # -----------------------------------------------------

        session.status = "completed"

        session.questions_answered = len(
            answers
        )

        db.commit()
        db.refresh(session)

        return session

    # =========================================================
    # JSON ARRAY PARSER
    # =========================================================

    @staticmethod
    def _extract_json_array(
        text: str,
    ) -> list:

        if not text:
            return []

        try:

            cleaned = text.strip()

            # Remove markdown code block
            if cleaned.startswith("```"):

                lines = cleaned.splitlines()

                if lines:
                    lines = lines[1:]

                if (
                    lines
                    and lines[-1].strip().startswith("```")
                ):
                    lines = lines[:-1]

                cleaned = "\n".join(
                    lines
                ).strip()

            # Find JSON array
            json_start = cleaned.find("[")
            json_end = cleaned.rfind("]") + 1

            if (
                json_start == -1
                or json_end <= json_start
            ):
                return []

            json_string = cleaned[
                json_start:json_end
            ]

            parsed = json.loads(
                json_string
            )

            if isinstance(
                parsed,
                list,
            ):
                return parsed

            return []

        except Exception as exc:

            print(
                "Interview JSON parsing failed:",
                str(exc),
            )

            print(
                "Raw response:",
                text,
            )

            return []