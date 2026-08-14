import os
import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from google import genai
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/analyses", tags=["Gap Analyses"])

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@router.post("", response_model=schemas.AnalysisOut, status_code=status.HTTP_201_CREATED)
def perform_gap_analysis(
    req: schemas.GapAnalysisCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == req.resumeId, models.Resume.user_id == current_user.id).first()
    jd = db.query(models.JobDescription).filter(models.JobDescription.id == req.jdId, models.JobDescription.user_id == current_user.id).first()

    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or unauthorized")
    if not jd:
        raise HTTPException(status_code=404, detail="Job description not found or unauthorized")
    # Debug prints
    print("=" * 60)
    print("Resume Text:")
    print("Resume:", resume.extracted_text)

    print("=" * 60)
    print("Resume Skills:")
    print(resume.skills)

    print("=" * 60)
    print("Job Description:")
    print("JD:", jd.raw_text)

    print("=" * 60)
    print("JD Skills:")
    print(jd.extracted_skills)
    

    # Match gap evaluation
    resume_skills_lower = [s.lower().strip() for s in resume.skills]
    matched_skills = []
    missing_skills = []

    for skill in jd.extracted_skills:
        clean_skill = skill.strip()
        if clean_skill.lower() in resume_skills_lower:
            matched_skills.append(clean_skill)
        else:
            missing_skills.append(clean_skill)

    total_skills_count = len(jd.extracted_skills) or 1
    match_score = round((len(matched_skills) / total_skills_count) * 100)

    # Call Gemini for weekly visual Roadmap and Free courses
    weeks_roadmap = []
    courses_recommendations = []

    if missing_skills:
    
        try:
            prompt = f"""
            You are an expert ATS Resume Analyzer.

            Candidate Resume

            {resume.extracted_text}

            Job Title

            {jd.title}

            Job Description

            {jd.raw_text}

            Candidate Skills

            {", ".join(resume.skills)}

            Required Skills

            {", ".join(jd.extracted_skills)}

            Compare both.

            Return ONLY valid JSON.

            {{
                "match_score": 0,
                "matched_skills": [],
                "missing_skills": [],
                "weeks": [
                    {{
                        "weekNumber": 1,
                        "focus": "",
                        "topics": [],
                        "exercises": []
                    }}
                ],
                "courses": [
                    {{
                        "skill": "",
                        "recommendations": [
                            {{
                                "title": "",
                                "platform": "",
                                "url": "",
                                "description": ""
                            }}
                        ]
                    }}
                ]
            }}
            """

            response = client.models.generate_content(
                model="gemini-3.5-flash",
                contents=prompt
            )

            print("========== Gemini Response ==========")
            print(response.text)

            text_response = response.text.strip()

            # Remove markdown code block if present
            if text_response.startswith("```"):
                lines = text_response.splitlines()
                if lines[0].startswith("```json"):
                    text_response = "\n".join(lines[1:-1])
                else:
                    text_response = "\n".join(lines[1:-1])

            parsed = json.loads(text_response)

            # AI analysis
            match_score = parsed.get("match_score", match_score)
            matched_skills = parsed.get("matched_skills", matched_skills)
            missing_skills = parsed.get("missing_skills", missing_skills)

            # AI roadmap
            weeks_roadmap = parsed.get("weeks", [])
            courses_recommendations = parsed.get("courses", [])

        except Exception as e:
            import traceback

            traceback.print_exc()
            print("Gemini Error :", e)
    else:
        # Perfect profile clearance
        weeks_roadmap = [
            {
                "weekNumber": 1,
                "focus": "Career Readiness & Portfolio Reviews",
                "topics": ["Architecture patterns", "Technical interviews coding review"],
                "exercises": ["Apply immediately for role"]
            }
        ]
        courses_recommendations = []

    new_analysis = models.AnalysisResult(
    user_id=current_user.id,
    resume_id=resume.id,
    jd_id=jd.id,
    match_score=float(match_score),
    matched_skills=matched_skills,
    missing_skills=missing_skills,
    roadmap=weeks_roadmap,
    courses=courses_recommendations
)

    db.add(new_analysis)
    db.commit()
    db.refresh(new_analysis)
    return new_analysis


@router.get("", response_model=list[schemas.AnalysisOut])
def get_analyses(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.AnalysisResult).filter(models.AnalysisResult.user_id == current_user.id).all()

@router.delete("", status_code=status.HTTP_200_OK)
def delete_all_analyses(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(models.AnalysisResult).filter(
        models.AnalysisResult.user_id == current_user.id
    ).delete()

    db.commit()

    return {
        "message": "All analyses deleted successfully"
    }

@router.delete("/{analysis_id}", status_code=status.HTTP_200_OK)
def delete_analysis(
    analysis_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = db.query(models.AnalysisResult).filter(
        models.AnalysisResult.id == analysis_id,
        models.AnalysisResult.user_id == current_user.id
    ).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis result not found or unauthorized")
    
    db.delete(analysis)
    db.commit()
    return {"message": "Analysis deleted successfully"}
