import httpx
import json
import asyncio
from typing import Optional

from app.config import get_settings


settings = get_settings()


class GrokService:
    """AI service using Groq API"""

    API_BASE_URL = "https://api.groq.com/openai/v1"

    # =========================================================
    # COMMON AI CALL
    # =========================================================

    @classmethod
    async def call_grok(
        cls,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
        timeout: int = 60
    ) -> str:
        """Call Groq API"""

        if not settings.GROK_API_KEY:
            raise ValueError("GROK_API_KEY not configured")

        headers = {
            "Authorization": f"Bearer {settings.GROK_API_KEY}",
            "Content-Type": "application/json"
        }

        messages = []

        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })

        messages.append({
            "role": "user",
            "content": prompt
        })

        payload = {
            "model": settings.GROK_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False
        }

        try:
            async with httpx.AsyncClient(timeout=timeout) as client:

                response = await client.post(
                    f"{cls.API_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload
                )

                if response.status_code != 200:
                    raise Exception(
                        f"Groq API error {response.status_code}: "
                        f"{response.text}"
                    )

                data = response.json()

                if (
                    "choices" in data
                    and len(data["choices"]) > 0
                    and data["choices"][0].get("message")
                ):
                    content = data["choices"][0]["message"].get("content")

                    if content:
                        return content.strip()

                raise Exception("No response content from Groq API")

        except httpx.TimeoutException:
            raise Exception("Groq API request timeout")

        except httpx.ConnectError:
            raise Exception("Could not connect to Groq API")

        except Exception as e:
            raise Exception(f"Groq API error: {str(e)}")

    # =========================================================
    # CAREER EXPLANATION
    # =========================================================

    @classmethod
    async def get_career_explanation(
        cls,
        career_title: str,
        user_skills: list,
        missing_skills: list,
        user_experience: str
    ) -> str:

        system_prompt = """
You are an expert career advisor.

Give personalized, practical and encouraging career advice.
Keep the explanation clear and actionable.
"""

        prompt = f"""
Career: {career_title}

Current Skills:
{', '.join(user_skills)}

Missing Skills:
{', '.join(missing_skills)}

Experience Level:
{user_experience}

Explain:

1. Why this career is a good match
2. How current skills are useful
3. What skills should be learned
4. Expected learning timeline
5. Career growth opportunities

Keep the response practical and encouraging.
"""

        return await cls.call_grok(
            prompt,
            system_prompt=system_prompt
        )

    # =========================================================
    # LEARNING SUGGESTION
    # =========================================================

    @classmethod
    async def get_learning_suggestion(
        cls,
        career: str,
        current_skills: list,
        learning_hours: int
    ) -> str:

        system_prompt = """
You are an expert learning advisor.

Create practical learning plans for students and freshers.
"""

        prompt = f"""
Target Career:
{career}

Current Skills:
{', '.join(current_skills)}

Available Hours Per Week:
{learning_hours}

Create a 3-month learning plan.

Week 1-4:
Focus areas and projects

Week 5-8:
Focus areas and projects

Week 9-12:
Focus areas and projects

Include practical projects and recommended resources.
"""

        return await cls.call_grok(
            prompt,
            system_prompt=system_prompt
        )

    # =========================================================
    # RESUME ANALYSIS
    # =========================================================

    @classmethod
    async def analyze_resume_for_career(
        cls,
        resume_text: str,
        target_career: str
    ) -> dict:

        system_prompt = """
You are an expert resume reviewer.

Return ONLY valid JSON.
Do not use markdown.
"""

        prompt = f"""
Resume:
{resume_text}

Target Career:
{target_career}

Return JSON in exactly this structure:

{{
    "strengths": [],
    "improvements": [],
    "missing_keywords": [],
    "suggested_summary": "",
    "score_out_of_100": 0
}}
"""

        response = await cls.call_grok(
            prompt,
            system_prompt=system_prompt,
            temperature=0.2,
            max_tokens=2000
        )

        result = cls._extract_json_object(response)

        if result:
            return result

        return {
            "strengths": [],
            "improvements": ["Could not parse AI response"],
            "missing_keywords": [],
            "suggested_summary": "",
            "score_out_of_100": 0
        }

    # =========================================================
    # INTERVIEW QUESTION
    # =========================================================

    @classmethod
    async def generate_interview_question(
        cls,
        career: str,
        difficulty: str,
        question_type: str = "technical"
    ) -> str:

        system_prompt = f"""
You are an expert interview coach.

Generate realistic interview questions for:
Career: {career}
Difficulty: {difficulty}
"""

        prompt = f"""
Generate one {question_type} interview question.

Also explain:

1. What makes a good answer
2. Common mistakes
3. Possible follow-up questions
"""

        return await cls.call_grok(
            prompt,
            system_prompt=system_prompt
        )

    # =========================================================
    # INTERVIEW ANSWER EVALUATION
    # =========================================================

    @classmethod
    async def evaluate_interview_answer(
        cls,
        question: str,
        answer: str,
        career: str
    ) -> dict:
        """
        Evaluate interview answer fairly.

        AI score:
        0 - 10

        Database/frontend score:
        0 - 100
        """

        system_prompt = """
You are an expert technical and HR interview evaluator.

Your job is to evaluate candidate answers fairly.

IMPORTANT RULES:

1. Understand exactly what the question asks.
2. Do not reject an answer just because it is short.
3. Correct answers must receive appropriate credit.
4. Partial answers should receive partial credit.
5. For coding/output questions, a correct output deserves significant credit.
6. If the candidate gives only the result but misses the explanation,
   give partial credit instead of automatically failing.
7. Only score 0-2 when the answer is clearly incorrect, irrelevant,
   or completely empty.
8. Score must be a number from 0 to 10.
9. "acceptable" should be true when score >= 5.
10. Return ONLY valid JSON.
11. Do not return markdown.
"""

        prompt = f"""
Candidate Career:
{career}

Interview Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer carefully.

SCORING GUIDE:

9-10:
Excellent answer.
Correct, clear and complete.

7-8:
Good answer.
Mostly correct with only minor missing details.

5-6:
Partially correct.
Main idea or result is correct but explanation/details are missing.

3-4:
Weak answer.
Some relevant information but important mistakes or missing concepts.

0-2:
Incorrect, irrelevant or empty answer.

IMPORTANT EXAMPLE:

Question:
"What is the output of [x*x for x in range(5)]?"

Candidate Answer:
"[0, 1, 4, 9, 16]"

This answer is CORRECT.
It should receive a high score because the requested output is correct.

Another example:

Question:
"What is list comprehension and give an example?"

Candidate Answer:
"[0, 1, 4, 9, 16]"

This answer is PARTIALLY CORRECT because the output is correct,
but the definition and Python expression are missing.

Therefore it should receive partial credit, not 0.

Return EXACTLY this JSON structure:

{{
    "score": 0,
    "acceptable": false,
    "strengths": [],
    "missing_points": [],
    "improvements": [],
    "sample_better_answer": "",
    "feedback": ""
}}

Field meanings:

"strengths": what the candidate did well
"missing_points": important points/concepts the question expected but the answer did NOT cover
"improvements": how to phrase/structure the answer better next time
"""

        try:

            response = await cls.call_grok(
                prompt=prompt,
                system_prompt=system_prompt,
                temperature=0.1,
                max_tokens=1200
            )

            print("========================================")
            print("INTERVIEW AI RAW RESPONSE")
            print(response)
            print("========================================")

            result = cls._extract_json_object(response)

            if not result:
                raise ValueError("AI returned invalid JSON")

            # -------------------------------------------------
            # SCORE NORMALIZATION
            # -------------------------------------------------

            raw_score = result.get("score", 0)

            try:
                score = float(raw_score)
            except (ValueError, TypeError):
                score = 0

            # AI should return 0-10
            # But protect against AI returning 0-100
            if score > 10:
                score = score / 10

            score = max(0, min(10, score))

            # Round score
            score = round(score, 1)

            result["score"] = score

            # -------------------------------------------------
            # ACCEPTABLE
            # -------------------------------------------------

            result["acceptable"] = score >= 5

            # -------------------------------------------------
            # DEFAULT ARRAYS / TEXT
            # -------------------------------------------------

            if not isinstance(result.get("strengths"), list):
                result["strengths"] = []

            if not isinstance(result.get("missing_points"), list):
                result["missing_points"] = []

            if not isinstance(result.get("improvements"), list):
                result["improvements"] = []

            if not result.get("sample_better_answer"):
                result["sample_better_answer"] = ""

            if not result.get("feedback"):
                result["feedback"] = "Answer evaluated successfully."

            return result

        except Exception as e:

            print("Interview answer evaluation error:")
            print(str(e))

            # Safe fallback
            return {
                "score": 0,
                "acceptable": False,
                "strengths": [],
                "missing_points": [],
                "improvements": [
                    "AI evaluation failed. Please try again."
                ],
                "sample_better_answer": "",
                "feedback": "Unable to evaluate the answer right now."
            }

    # =========================================================
    # SKILL QUIZ GENERATION
    # =========================================================

    @classmethod
    async def generate_quiz(
        cls,
        skill_name: str,
        difficulty: str = "beginner",
        num_questions: int = 5
    ) -> list:
        """
        Generate MCQ quiz questions for a skill at a given difficulty.

        difficulty progression: beginner -> intermediate -> advanced
        """

        system_prompt = """
You are an expert technical quiz creator.

Return ONLY a valid JSON array.
Do not use markdown.
"""

        prompt = f"""
Create {num_questions} multiple choice questions to test knowledge of: {skill_name}

Difficulty level: {difficulty}

Difficulty guide:
- beginner: basic definitions, core concepts, simple syntax
- intermediate: applied usage, reading small code snippets, comparing approaches
- advanced: edge cases, performance/optimization, real-world scenario problems

Return JSON array in EXACTLY this structure:

[
  {{
    "question": "",
    "options": ["", "", "", ""],
    "correct_index": 0,
    "explanation": ""
  }}
]

Rules:
- Exactly 4 options per question
- correct_index is the 0-based index of the correct option
- explanation should briefly justify the correct answer
- Do not repeat the same question twice
"""

        response = await cls.call_grok(
            prompt,
            system_prompt=system_prompt,
            temperature=0.4,
            max_tokens=2000
        )

        result = cls._extract_json_array(response)

        return result or []

    # =========================================================
    # JSON OBJECT PARSER
    # =========================================================

    @staticmethod
    def _extract_json_object(text: str) -> Optional[dict]:
        """Safely extract JSON object from AI response"""

        if not text:
            return None

        try:

            cleaned = text.strip()

            # Remove ```json
            if cleaned.startswith("```"):

                lines = cleaned.splitlines()

                # Remove first line
                if lines:
                    lines = lines[1:]

                # Remove last ```
                if lines and lines[-1].strip().startswith("```"):
                    lines = lines[:-1]

                cleaned = "\n".join(lines).strip()

            # Find JSON object
            json_start = cleaned.find("{")
            json_end = cleaned.rfind("}") + 1

            if json_start == -1 or json_end <= json_start:
                return None

            json_string = cleaned[json_start:json_end]

            return json.loads(json_string)

        except Exception as e:

            print("JSON parsing failed:")
            print(str(e))
            print("Raw response:")
            print(text)

            return None

    # =========================================================
    # JSON ARRAY PARSER
    # =========================================================

    @staticmethod
    def _extract_json_array(text: str) -> Optional[list]:
        """Safely extract JSON array from AI response"""

        if not text:
            return None

        try:

            cleaned = text.strip()

            if cleaned.startswith("```"):

                lines = cleaned.splitlines()

                if lines:
                    lines = lines[1:]

                if lines and lines[-1].strip().startswith("```"):
                    lines = lines[:-1]

                cleaned = "\n".join(lines).strip()

            json_start = cleaned.find("[")
            json_end = cleaned.rfind("]") + 1

            if json_start == -1 or json_end <= json_start:
                return None

            json_string = cleaned[json_start:json_end]

            return json.loads(json_string)

        except Exception as e:

            print("JSON array parsing failed:")
            print(str(e))
            print("Raw response:")
            print(text)

            return None


# =============================================================
# SYNCHRONOUS WRAPPER
# =============================================================

def sync_get_career_explanation(
    career_title: str,
    user_skills: list,
    missing_skills: list,
    user_experience: str
) -> str:

    try:

        return asyncio.run(
            GrokService.get_career_explanation(
                career_title,
                user_skills,
                missing_skills,
                user_experience
            )
        )

    except Exception as e:

        return f"Error: {str(e)}"