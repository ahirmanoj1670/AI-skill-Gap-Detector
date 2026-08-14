import io
import os
import json
import pdfplumber
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from google import genai
from database import get_db
from auth import get_current_user
import models, schemas
router = APIRouter(prefix="/resumes", tags=["Resumes"])

# Configure google-generativeai package
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

@router.post("", response_model=schemas.ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(None),
    raw_text: str = Form(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    extracted_text = ""
    file_name = "pasted_resume.txt"

    if file:
        file_name = file.filename
        content = await file.read()
        
        # Read PDF using pdfplumber
        if file.content_type == "application/pdf":
            try:
                with pdfplumber.open(io.BytesIO(content)) as pdf:
                    pages_text = [page.extract_text() or "" for page in pdf.pages]
                    extracted_text = "\n".join(pages_text)
            except Exception as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to extract text from PDF: {str(e)}"
                )
        else:
            extracted_text = content.decode("utf-8", errors="ignore")
    elif raw_text:
        extracted_text = raw_text
    else:
        raise HTTPException(
            status_code=400,
            detail="A resume file upload or plain copy-paste text is required."
        )

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="The provided resume is empty.")

    # Call Gemini to pull technical & soft skills
    skills = []
    try:
        prompt = f"""
        Extract all core technical, tool/language, and professional soft skills listed in this resume.
        Provide the output strictly in valid JSON format with a single key 'skills' pointing to an array of strings.

        Resume text:
        {extracted_text[:10000]}
        """

        response = client.models.generate_content(
            model="gemini-3.5-flash",
            contents=prompt
        )

        text_response = response.text.strip()
        
        # Clean markdown wrappers if present
        if text_response.startswith("```"):
            lines = text_response.splitlines()
            if lines[0].startswith("```json"):
                text_response = "\n".join(lines[1:-1])
            elif lines[0].startswith("```"):
                text_response = "\n".join(lines[1:-1])

        parsed_json = json.loads(text_response)
        skills = parsed_json.get("skills", [])
    except Exception as e:
        # Fallback keyword matching
        print(f"Gemini error: {e}")
        skills = ["Python", "JavaScript", "SQL", "Git", "React", "Docker", "REST APIs"]

    new_resume = models.Resume(
    user_id=current_user.id,
    file_name=file_name,
    extracted_text=extracted_text,
    skills=skills
)

    db.add(new_resume)
    db.commit()
    db.refresh(new_resume)
    return new_resume


@router.get("", response_model=list[schemas.ResumeOut])
def get_resumes(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(models.Resume).filter(models.Resume.user_id == current_user.id).all()


@router.delete("/{resume_id}", status_code=status.HTTP_200_OK)
def delete_resume(
    resume_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(models.Resume).filter(models.Resume.id == resume_id, models.Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found or unauthorized")
    
    db.delete(resume)
    db.commit()
    return {"message": "Resume deleted successfully"}
