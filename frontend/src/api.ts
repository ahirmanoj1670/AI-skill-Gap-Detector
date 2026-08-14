import axios, { AxiosError } from "axios";
import {
  AuthResponse,
  ResumeUploadResponse,
  AnalysisResponse,
  SkillGapResponse,
  RoadmapResponse
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("sg_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("sg_token");
      localStorage.removeItem("user");

      if (typeof window !== "undefined") {
        window.location.hash = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (
    data: Record<string, string>
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      "/auth/register",
      data
    );

    return response.data;
  },

  login: async (
    data: Record<string, string>
  ): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>(
      "/auth/login",
      data
    );

    return response.data;
  },
};

export const analysisAPI = {
  uploadResume: async (
    formData: FormData
  ): Promise<ResumeUploadResponse> => {
    const response = await api.post<ResumeUploadResponse>(
      "/upload-resume",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  },

  analyzeJD: async (
    data: { jdText: string; resumeId?: string }
  ): Promise<AnalysisResponse> => {
    const response = await api.post<AnalysisResponse>(
      "/analyze-jd",
      data
    );

    return response.data;
  },

  getSkillGap: async (
    data: { resumeId?: string; jdId?: string }
  ): Promise<SkillGapResponse> => {
    const response = await api.post<SkillGapResponse>(
      "/skill-gap",
      data
    );

    return response.data;
  },

  getRoadmap: async (
    data: { skills: string[] }
  ): Promise<RoadmapResponse> => {
    const response = await api.post<RoadmapResponse>(
      "/roadmap",
      data
    );

    return response.data;
  },
};