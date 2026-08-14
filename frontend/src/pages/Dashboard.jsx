import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Brain,
  Sparkles,
  User as UserIcon,
  LogOut,
  TrendingUp,
  History,
  Trash2,
  AlertCircle,
  Grid
} from "lucide-react";

import ResumeUpload from "../components/ResumeUpload.jsx";
import JDInput from "../components/JDInput.jsx";
import SkillGapCard from "../components/SkillGapCard.jsx";
import Roadmap from "../components/Roadmap.jsx";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("sg_token");
  const email = localStorage.getItem("sg_email") || "User Account";

  // Data layers
  const [resumes, setResumes] = useState([]);
  const [jds, setJds] = useState([]);
  const [analyses, setAnalyses] = useState([]);

  // Selections
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJdId, setSelectedJdId] = useState("");

  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generalError, setGeneralError] = useState("");

  // Setup Axios globally
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchResumes();
      fetchJds();
      fetchAnalyses();
    }
  }, [token]);

  const fetchResumes = async () => {
    try {
      const res = await axios.get("/api/resumes");
      setResumes(res.data);
      if (res.data.length > 0) setSelectedResumeId(res.data[0].id);
    } catch (err) {
      console.error("Resumes load error:", err);
    }
  };

  const fetchJds = async () => {
    try {
      const res = await axios.get("/api/job-descriptions");
      setJds(res.data);
      if (res.data.length > 0) setSelectedJdId(res.data[0].id);
    } catch (err) {
      console.error("JDs load error:", err);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const res = await axios.get("/api/analyses");
      setAnalyses(res.data);
      if (res.data.length > 0) setActiveAnalysis(res.data[0]);
    } catch (err) {
      console.error("Analyses load error:", err);
    }
  };

  const handleResumeAdded = (newResume) => {
    setResumes((prev) => [newResume, ...prev]);
    setSelectedResumeId(newResume.id);
  };

  const handleJdAdded = (newJd) => {
    setJds((prev) => [newJd, ...prev]);
    setSelectedJdId(newJd.id);
  };

  const runSkillGapAnalysis = async () => {
    if (!selectedResumeId || !selectedJdId) {
      setGeneralError("Please select/upload a resume and job description first.");
      return;
    }

    setIsAnalyzing(true);
    setGeneralError("");

    try {
      const res = await axios.post("/api/analyses", {
        resumeId: selectedResumeId,
        jdId: selectedJdId,
      });
      setActiveAnalysis(res.data);
      setAnalyses((prev) => [res.data, ...prev]);
    } catch (err) {
      setGeneralError(err.response?.data?.detail || "An analysis error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const clearAllAnalyses = async () => {
  if (!window.confirm("Delete all analysis history?")) return;

  try {
    await axios.delete("/api/analyses");

    setAnalyses([]);
    setActiveAnalysis(null);
  } catch (err) {
    console.error(err);
    alert("Failed to delete analyses");
  }
 };

  const deleteAnalysisResult = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/api/analyses/${id}`);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
      if (activeAnalysis?.id === id) {
        setActiveAnalysis(null);
      }
    } catch (err) {
      console.error("Deletion failed:", err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getSelectedResumeDetails = () => resumes.find((r) => r.id === selectedResumeId);
  const getSelectedJdDetails = () => jds.find((j) => j.id === selectedJdId);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-100 py-3.5 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-tr from-indigo-500 to-indigo-600 p-2 rounded-xl text-white shadow-xs">
              <Brain className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 tracking-tight text-base block">SkillGap AI</span>
              <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider -mt-0.5">FastAPI + React Worksystem</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 bg-slate-50 pl-3.5 pr-2 py-1.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-600 max-w-40 truncate">{email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 p-1.5 rounded-lg border border-slate-300 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="grow max-w-7xl mx-auto w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Actions panel */}
        <div className="lg:col-span-5 space-y-6">
          <ResumeUpload onUploadSuccess={handleResumeAdded} token={token} />
          <JDInput onSavesJD={handleJdAdded} token={token} />

          {/* Core comparator trig */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Trigger Gap Correlation</h3>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Cross check identified skills against professional standards. Formulates visual timelines.
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Selected Resume:</span>
                <span className="text-indigo-300 font-semibold truncate max-w-44">
                  {getSelectedResumeDetails()?.file_name || "None Selected"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Target JD:</span>
                <span className="text-indigo-300 font-semibold truncate max-w-44">
                  {getSelectedJdDetails()?.title || "None Selected"}
                </span>
              </div>
            </div>

            <button
              onClick={runSkillGapAnalysis}
              disabled={isAnalyzing || !selectedResumeId || !selectedJdId}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Weaving visual roadmaps...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  Generate Dynamic Skill Report
                </>
              )}
            </button>

            {generalError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{generalError}</p>
              </div>
            )}
          </div>

          {/* Audit Trail list */}
          {analyses.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4" />
                Past Analyses History ({analyses.length})
              </h4>

              {/*delete all records */}
              
              <div className="flex justify-end mb-2">
                <button
                  onClick={clearAllAnalyses}
                  className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1 rounded-md"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {analyses.map((a) => {
                  const associatedJd = jds.find((j) => j.id === a.jd_id);
                  return (
                    <div
                      key={a.id}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 ${
                        activeAnalysis?.id === a.id
                          ? "bg-indigo-50/40 border-indigo-100 text-slate-800"
                          : "bg-slate-50/50 border-transparent hover:bg-slate-50"
                      }`}
                      onClick={() => setActiveAnalysis(a)}
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-700 block truncate">
                          {associatedJd?.title || "Role Analysis"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          {new Date(a.created_at).toLocaleDateString()} • {a.missing_skills.length} gaps
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
                          {a.match_score}%
                        </span>
                        <button
                          
                          onClick={(e) => deleteAnalysisResult(a.id, e)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Display area */}
        <div className="lg:col-span-7 space-y-6">
          {activeAnalysis ? (
            <>
              <SkillGapCard
                matchScore={activeAnalysis.match_score}
                matchedSkills={activeAnalysis.matched_skills}
                missingSkills={activeAnalysis.missing_skills}
                resumeSkills={resumes.find((r) => r.id === activeAnalysis.resume_id)?.skills || []}
                jdSkills={jds.find((j) => j.id === activeAnalysis.jd_id)?.extracted_skills || []}
                roleTitle={jds.find((j) => j.id === activeAnalysis.jd_id)?.title || "Target Role"}
              />

              <Roadmap weeks={activeAnalysis.roadmap} courses={activeAnalysis.courses} />
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center space-y-4">
              <div className="bg-indigo-50 p-4 rounded-2xl w-fit mx-auto text-indigo-500">
                <Grid className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-800">Your AI Analysis Workspace is Clear</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                  Upload your resume PDF (or paste raw content) and submit the target career description to generate dynamic week-by-week visual schedules.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-4 px-6 text-center text-[10px] text-slate-400">
        <p>© 2026 SkillGap AI. Powering modern dev continuous educational roadmaps using Gemini.</p>
      </footer>
    </div>
  );
}
