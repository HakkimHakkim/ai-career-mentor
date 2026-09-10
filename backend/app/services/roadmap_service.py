from sqlalchemy.orm import Session

from app.models.roadmap import Roadmap, RoadmapStep
from app.models.user import User
from app.models.career import Career, CareerSkill

import json


class RoadmapService:
    """Roadmap generation and management service"""


    # ==========================================================
    # GENERATE ROADMAP
    # ==========================================================

    @staticmethod
    def generate_roadmap(
        user: User,
        career: Career,
        db: Session,
        matched_skills: list = None
    ) -> Roadmap:
        """Generate a personalized career roadmap"""

        # ------------------------------------------------------
        # Normalize matched skills
        # ------------------------------------------------------

        matched_lower = {
            (skill or "").lower().strip()
            for skill in (matched_skills or [])
        }


        # ------------------------------------------------------
        # Get career skills
        # ------------------------------------------------------

        career_skills = (
            db.query(CareerSkill)
            .filter(
                CareerSkill.career_id == career.id
            )
            .order_by(
                CareerSkill.importance.desc()
            )
            .all()
        )


        # ------------------------------------------------------
        # Get learning hours safely
        # ------------------------------------------------------

        learning_hours = 10

        try:

            if (
                user.profile
                and user.profile.learning_hours_per_week
            ):

                learning_hours = int(
                    user.profile.learning_hours_per_week
                )

                if learning_hours <= 0:
                    learning_hours = 10

        except (
            AttributeError,
            TypeError,
            ValueError
        ):

            learning_hours = 10


        # ------------------------------------------------------
        # Calculate duration
        # ------------------------------------------------------

        total_hours = len(career_skills) * 15

        if career_skills:

            estimated_days = max(
                1,
                int(
                    (total_hours / learning_hours) * 7
                )
            )

        else:

            estimated_days = 0


        # ======================================================
        # PAUSE OLD ACTIVE ROADMAPS
        # ======================================================

        old_roadmaps = (
            db.query(Roadmap)
            .filter(
                Roadmap.user_id == user.id,
                Roadmap.status == "active"
            )
            .all()
        )

        for old_roadmap in old_roadmaps:

            old_roadmap.status = "paused"

        db.commit()


        # ======================================================
        # CREATE NEW ROADMAP
        # ======================================================

        roadmap = Roadmap(

            user_id=user.id,

            career_id=career.id,

            title=(
                f"{career.title} Learning Roadmap"
            ),

            description=(
                f"Personalized learning path "
                f"to become a {career.title}"
            ),

            estimated_duration_days=estimated_days,

            learning_hours_per_week=learning_hours,

            total_steps=len(career_skills),

            completed_steps=0,

            overall_progress=0.0,

            status="active"
        )


        db.add(roadmap)

        db.commit()

        db.refresh(roadmap)


        # ------------------------------------------------------
        # Roadmap progress variables
        # ------------------------------------------------------

        completed_count = 0

        in_progress_set = False


        # ======================================================
        # CREATE ROADMAP STEPS
        # ======================================================

        for index, career_skill in enumerate(career_skills):


            # --------------------------------------------------
            # Skill name
            # --------------------------------------------------

            if career_skill.skill:

                skill_name = career_skill.skill.name

            else:

                skill_name = "Unknown Skill"


            # --------------------------------------------------
            # Check matched skill
            # --------------------------------------------------

            is_matched = (
                skill_name.lower().strip()
                in matched_lower
            )


            # --------------------------------------------------
            # Set step status
            # --------------------------------------------------

            if is_matched:

                step_status = "completed"

                progress = 100.0

                completed_count += 1


            elif not in_progress_set:

                step_status = "in_progress"

                progress = 0.0

                in_progress_set = True


            else:

                step_status = "pending"

                progress = 0.0


            # --------------------------------------------------
            # Estimated hours
            # --------------------------------------------------

            importance = (
                career_skill.importance or ""
            ).upper()


            if importance == "HIGH":

                estimated_hours = 20


            elif importance == "MEDIUM":

                estimated_hours = 15


            else:

                estimated_hours = 10


            # ==================================================
            # CREATE STEP
            # ==================================================

            step = RoadmapStep(

                roadmap_id=roadmap.id,

                skill_id=career_skill.skill_id,

                title=f"Master {skill_name}",

                description=(
                    f"Learn {skill_name} at "
                    f"{career_skill.required_level or 'INTERMEDIATE'} level"
                ),

                order=index + 1,

                estimated_hours=estimated_hours,

                status=step_status,

                completion_percentage=progress,

                resources=json.dumps([

                    {
                        "type": "course",
                        "name": f"{skill_name} Fundamentals"
                    },

                    {
                        "type": "project",
                        "name": (
                            f"Build a project using "
                            f"{skill_name}"
                        )
                    },

                    {
                        "type": "practice",
                        "name": (
                            f"Practice {skill_name} daily"
                        )
                    }

                ])
            )


            db.add(step)


        # ======================================================
        # UPDATE INITIAL ROADMAP PROGRESS
        # ======================================================

        roadmap.completed_steps = completed_count


        if career_skills:

            roadmap.overall_progress = (
                completed_count
                / len(career_skills)
            ) * 100

        else:

            roadmap.overall_progress = 0.0


        db.commit()

        db.refresh(roadmap)


        return roadmap


    # ==========================================================
    # GET USER ROADMAP
    # ==========================================================

    @staticmethod
    def get_roadmap(
        user_id: str,
        db: Session
    ) -> Roadmap:
        """Get user's current active roadmap"""


        # Get latest active roadmap

        roadmap = (
            db.query(Roadmap)
            .filter(
                Roadmap.user_id == user_id,
                Roadmap.status == "active"
            )
            .order_by(
                Roadmap.created_at.desc()
            )
            .first()
        )


        if roadmap:

            return roadmap


        # If no active roadmap exists,
        # return latest roadmap

        roadmap = (
            db.query(Roadmap)
            .filter(
                Roadmap.user_id == user_id
            )
            .order_by(
                Roadmap.created_at.desc()
            )
            .first()
        )


        return roadmap


    # ==========================================================
    # COMPLETE STEP
    # ==========================================================

    @staticmethod
    def complete_step(
        roadmap_id: str,
        step_id: str,
        db: Session
    ) -> RoadmapStep:
        """Mark roadmap step as completed"""


        # ------------------------------------------------------
        # Get step
        # ------------------------------------------------------

        step = (
            db.query(RoadmapStep)
            .filter(
                RoadmapStep.id == step_id,
                RoadmapStep.roadmap_id == roadmap_id
            )
            .first()
        )


        if not step:

            return None


        # ------------------------------------------------------
        # Complete current step
        # ------------------------------------------------------

        step.status = "completed"

        step.completion_percentage = 100.0


        # ------------------------------------------------------
        # Get roadmap
        # ------------------------------------------------------

        roadmap = (
            db.query(Roadmap)
            .filter(
                Roadmap.id == roadmap_id
            )
            .first()
        )


        if roadmap:


            # Get all steps

            steps = (
                db.query(RoadmapStep)
                .filter(
                    RoadmapStep.roadmap_id == roadmap_id
                )
                .order_by(
                    RoadmapStep.order.asc()
                )
                .all()
            )


            # --------------------------------------------------
            # Unlock next pending step
            # --------------------------------------------------

            for roadmap_step in steps:

                if roadmap_step.status == "pending":

                    roadmap_step.status = "in_progress"

                    roadmap_step.completion_percentage = 0.0

                    break


            # --------------------------------------------------
            # Count completed steps
            # --------------------------------------------------

            completed_steps = sum(

                1

                for roadmap_step in steps

                if roadmap_step.status == "completed"

            )


            roadmap.completed_steps = completed_steps


            # --------------------------------------------------
            # Calculate overall progress
            # --------------------------------------------------

            if steps:

                roadmap.overall_progress = (

                    sum(

                        float(
                            roadmap_step.completion_percentage or 0
                        )

                        for roadmap_step in steps

                    )

                    / len(steps)

                )

            else:

                roadmap.overall_progress = 0.0


            # --------------------------------------------------
            # Update roadmap status
            # --------------------------------------------------

            if (

                roadmap.total_steps > 0

                and completed_steps >= roadmap.total_steps

            ):

                roadmap.status = "completed"

                roadmap.overall_progress = 100.0


            else:

                roadmap.status = "active"


        db.commit()

        db.refresh(step)


        return step


    # ==========================================================
    # UPDATE STEP PROGRESS
    # ==========================================================

    @staticmethod
    def update_step_progress(
        step_id: str,
        progress: float,
        db: Session
    ) -> RoadmapStep:
        """Update roadmap step progress and unlock next step"""


        # ------------------------------------------------------
        # Get step
        # ------------------------------------------------------

        step = (
            db.query(RoadmapStep)
            .filter(
                RoadmapStep.id == step_id
            )
            .first()
        )


        if not step:

            return None


        # ------------------------------------------------------
        # Keep progress between 0 and 100
        # ------------------------------------------------------

        progress = max(
            0.0,
            min(
                float(progress),
                100.0
            )
        )


        # ------------------------------------------------------
        # Update progress
        # ------------------------------------------------------

        step.completion_percentage = progress


        if progress >= 100:

            step.status = "completed"


        elif progress > 0:

            step.status = "in_progress"


        else:

            step.status = "pending"


        # ------------------------------------------------------
        # Get parent roadmap
        # ------------------------------------------------------

        roadmap = (
            db.query(Roadmap)
            .filter(
                Roadmap.id == step.roadmap_id
            )
            .first()
        )


        if roadmap:


            # --------------------------------------------------
            # Get all roadmap steps
            # --------------------------------------------------

            steps = (
                db.query(RoadmapStep)
                .filter(
                    RoadmapStep.roadmap_id == roadmap.id
                )
                .order_by(
                    RoadmapStep.order.asc()
                )
                .all()
            )


            # ==================================================
            # UNLOCK NEXT STEP
            # ==================================================

            if step.status == "completed":


                current_index = next(

                    (

                        index

                        for index, roadmap_step
                        in enumerate(steps)

                        if roadmap_step.id == step.id

                    ),

                    None

                )


                if (

                    current_index is not None

                    and current_index + 1 < len(steps)

                ):

                    next_step = (
                        steps[current_index + 1]
                    )


                    if next_step.status == "pending":

                        next_step.status = "in_progress"

                        next_step.completion_percentage = 0.0


            # ==================================================
            # CALCULATE OVERALL PROGRESS
            # ==================================================

            if steps:

                roadmap.overall_progress = (

                    sum(

                        float(
                            step_item.completion_percentage or 0
                        )

                        for step_item in steps

                    )

                    / len(steps)

                )


                roadmap.completed_steps = sum(

                    1

                    for step_item in steps

                    if step_item.status == "completed"

                )


                # ----------------------------------------------
                # Update roadmap status
                # ----------------------------------------------

                if (

                    roadmap.total_steps > 0

                    and roadmap.completed_steps
                    >= roadmap.total_steps

                ):

                    roadmap.status = "completed"

                    roadmap.overall_progress = 100.0


                else:

                    roadmap.status = "active"


        # ------------------------------------------------------
        # Save changes
        # ------------------------------------------------------

        db.commit()

        db.refresh(step)


        return step