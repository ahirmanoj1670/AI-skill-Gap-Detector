from pydantic import BaseModel, EmailStr, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: str

# Resume Schemas
class ResumeCreate(BaseModel):
    fileName: str
    extractedText: str
    skills: List[str]

class ResumeOut(BaseModel):
    id: int
    user_id: int
    file_name: str
    extracted_text: str
    skills: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Job Description Schemas
class JDCreate(BaseModel):
    title: str
    text: str

class JDOut(BaseModel):
    id: int
    user_id: int
    title: str
    raw_text: str
    extracted_skills: List[str]
    created_at: datetime

    class Config:
        from_attributes = True

# Analysis Result Schemas
class GapAnalysisCreate(BaseModel):
    resumeId: int
    jdId: int

class Recommendation(BaseModel):
    title: str
    platform: str
    url: str
    description: str

class CourseGroup(BaseModel):
    skill: str
    recommendations: List[Recommendation]

class RoadmapWeek(BaseModel):
    weekNumber: int
    focus: str
    topics: List[str]
    exercises: List[str]

class AnalysisOut(BaseModel):
    id: int
    user_id: int
    resume_id: int
    jd_id: int
    match_score: float
    matched_skills: List[str]
    missing_skills: List[str]
    roadmap: List[RoadmapWeek]
    courses: List[CourseGroup]
    created_at: datetime

    class Config:
        from_attributes = True
