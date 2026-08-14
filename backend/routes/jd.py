import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google import genai
from database import get_db
from auth import get_current_user
import models, schemas
router = APIRouter(prefix="/job-descriptions", tags=["Job Descriptions"])

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@router.post("", response_model=schemas.JDOut, status_code=status.HTTP_201_CREATED)
def analyze_jd(
    jd_in: schemas.JDCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not jd_in.title.strip() or not jd_in.text.strip():
        raise HTTPException(status_code=400, detail="Job Title and Description body text are required.")

    extracted_skills = []
    try:
        prompt = f"""
        Extract the core professional, programming, framework, database, cloud,
        tools and soft skills required for this job.

        Return ONLY valid JSON in this format:

        {{
            "extractedSkills": [
                "Python",
                "React",
                "Docker"
            ]
        }}

        Job Title:
        {jd_in.title}

        Job Description:
        {jd_in.text[:10000]}
        """

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )

        text_response = response.text.strip()

        if text_response.startswith("```"):
            lines = text_response.splitlines()
            if lines[0].startswith("```json"):
                text_response = "\n".join(lines[1:-1])
            else:
                text_response = "\n".join(lines[1:-1])

        parsed = json.loads(text_response)

        extracted_skills = parsed.get("extractedSkills", [])

    except Exception as e:
        print("Gemini JD extraction fail:", e)

        extracted_skills = []

        keywords = [
            "Python",
            "FastAPI",
            "SQL",
            "PostgreSQL",
            "Docker",
            "Git",
            "REST APIs",
            "AWS",
            "React",
            "TypeScript",
            "JavaScript",
            "Node.js"
        ]

        for skill in keywords:
            if skill.lower() in jd_in.text.lower():
                extracted_skills.append(skill)

    new_jd = models.JobDescription(
    user_id=current_user.id,
    title=jd_in.title,
    raw_text=jd_in.text,
    extracted_skills=extracted_skills
)

    db.add(new_jd)
    db.commit()
    db.refresh(new_jd)
    return new_jd


@router.get("", response_model=list[schemas.JDOut])
def get_job_descriptions(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.JobDescription).filter(models.JobDescription.user_id == current_user.id).all()
