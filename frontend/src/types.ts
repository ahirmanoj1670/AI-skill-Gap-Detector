export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ResumeUploadResponse {
  message: string;
  resumeId: string;
  fileName: string;
  parsedText?: string;
}

export interface AnalysisResponse {
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  jdParsed?: string;
}

export interface SkillDetails {
  skill: string;
  category: "Technical" | "Soft Skill" | "Tools & Platforms" | "Methodology" | "Other";
  importance: "High" | "Medium" | "Low";
  currentLevel: string;
  targetLevel: string;
  description: string;
}

export interface SkillGapResponse {
  matchScore: number;
  skills: SkillDetails[];
}

export interface RoadmapItem {
  phase: string;
  duration: string;
  title: string;
  description: string;
  status: "Completed" | "In_Progress" | "Not_Started";
  courses: {
    title: string;
    provider: string;
    url?: string;
    level: "Beginner" | "Intermediate" | "Advanced";
  }[];
}

export interface RoadmapResponse {
  roadmap: RoadmapItem[];
}
