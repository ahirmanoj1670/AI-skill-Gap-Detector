import React, { useState, useRef } from "react";
import { Upload, FileText, Clipboard, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function ResumeUpload({ onUploadSuccess, token }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [isPasteMode, setIsPasteMode] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processSelectedFile(file);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await processSelectedFile(file);
    }
  };

  const processSelectedFile = async (file) => {
    const isPDF = file.type === "application/pdf";
    const isTXT = file.type === "text/plain";

    if (!isPDF && !isTXT) {
      setError("Please upload a PDF (.pdf) or text (.txt) file.");
      return;
    }

    setFileName(file.name);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to process resume file");

      onUploadSuccess(data);
    } catch (err) {
      setError(err.message || "An error occurred while uploading. Please write/paste instead.");
      setFileName(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (!resumeText.trim()) {
      setError("Please paste some professional text.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("raw_text", resumeText);

      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to process text resume");

      onUploadSuccess(data);
    } catch (err) {
      setError(err.message || "An error occurred while parsing skills.");
    } finally {
      setLoading(false);
    }
  };

  const loadSampleResume = () => {
    const sample = `John Doe
Senior Software Engineer | San Francisco, CA | john@email.com
SUMMARY: Experienced full stack engineer with a heavy focus on high-scale web architectures, interactive frontend applications, and secure database designs.

SKILLS: React, JavaScript, HTML5, CSS3, Tailwind CSS, Python, PostgreSQL, Git, Docker, RESTful APIs, AWS S3.

EXPERIENCE:
- Acme Corp, Senior Engineer (2024-Present): Developed React-based dashboard systems.
- Tech Solutions, Full Stack Dev (2022-2024): Worked backend systems.`;
    setResumeText(sample);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="text-indigo-500 w-5 h-5" />
            Candidate Resume
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Upload PDF or paste content directly</p>
        </div>

        <div className="flex gap-1.5 p-0.5 bg-slate-50 rounded-lg">
          <button
            onClick={() => {
              setIsPasteMode(false);
              setError(null);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              !isPasteMode ? "bg-white shadow-xs text-slate-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            File Upload
          </button>
          <button
            onClick={() => {
              setIsPasteMode(true);
              setError(null);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              isPasteMode ? "bg-white shadow-xs text-slate-800" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Direct Paste
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <RefreshCw className="animate-spin text-indigo-500 w-10 h-10 mb-3" />
          <p className="text-sm font-medium text-slate-600">Gemini is parsing skills from your resume...</p>
        </div>
      )}

      {!loading && !isPasteMode && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? "border-indigo-500 bg-indigo-50/20"
              : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.txt"
            onChange={handleFileChange}
          />
          <div className="bg-indigo-50 p-3 rounded-full w-fit mx-auto mb-3">
            <Upload className="w-6 h-6 text-indigo-500" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            {fileName ? `Selected: ${fileName}` : "Drag and drop your PDF / TXT here"}
          </p>
          <p className="text-xs text-slate-400 mt-1.5">or click to browse from files</p>
        </div>
      )}

      {!loading && isPasteMode && (
        <form onSubmit={handleTextSubmit} className="space-y-3">
          <div className="relative">
            <textarea
              className="w-full h-44 p-3.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400"
              placeholder="Paste your plain text resume or work outline here..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <button
              type="button"
              onClick={loadSampleResume}
              className="absolute bottom-3 right-3 text-[11px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-all flex items-center gap-1"
            >
              <Clipboard className="w-3.5 h-3.5" />
              Load Mock Sample
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            Analyze & Extract Skills
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2.5 text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs font-medium leading-relaxed">{error}</p>
        </div>
      )}
    </div>
  );
}
