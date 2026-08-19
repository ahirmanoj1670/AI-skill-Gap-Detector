import os
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import engine, Base, get_db
import models, schemas, auth
from routes import resume, jd, analysis
# Automatically initialize database migrations if applicable
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Skill Gap Detector & Learning Roadmap Generator",
    description="Analyze resumes vs job descriptions to generate dynamic interactive roadmaps using AI.",
    version="1.0.0"
)

# Configure CORS Middleware for decoupled React communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ai-skill-gap-detector.vercel.app",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect subroutes
app.include_router(resume.router)
app.include_router(jd.router)
app.include_router(analysis.router)


@app.get("/", status_code=status.HTTP_200_OK, tags=["Home"])
def home():
    return {
        "status": "healthy",
        "service": "SkillGap AI Engine"
    }

@app.post("/auth/register", response_model=schemas.Token, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register_user(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already registered with this email.")

    
    new_user = models.User(
        email=user_in.email,
        password_hash=auth.get_password_hash(user_in.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = auth.create_access_token(data={"sub": str(new_user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": new_user.id,
        "email": new_user.email
    }


@app.post("/auth/login", response_model=schemas.Token, tags=["Auth"])
def login_user(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if not user or not auth.verify_password(user_in.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials.")

    access_token = auth.create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "email": user.email
    }


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
