import React, { useState } from "react";
import { Briefcase, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";

const SAMPLE_TEMPLATES = [
  {
    title: "React Frontend Developer",
    rawText: `We are looking for a React Frontend Developer to assemble exquisite, responsive web interfaces.
Requirements:
- Strong experience with modern React 18+ (hooks, functional state components, context).
- Deep knowledge of TypeScript and ES6+ standards.
- Fluent with Tailwind CSS, responsive styling principles.
- Experience with state managers.`,
  },
  {
    title: "Python Full Stack Engineer",
    rawText: `We are looking for a Senior Full Stack Engineer with outstanding logical and architecture skills.
Our team values:
- Practical development using FastAPI, Python 3.11.
- Relational database designs with PostgreSQL and SQLAlchemy ORM structures.
- Modern visual development with React.`,
  },
];

export default function JDInput({ onSavesJD, token }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyTemplate = (template) => {
    setTitle(template.title);
    setDescription(template.rawText);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setError("Please fill in both the Job Title and Description text.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/job-descriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, text: description }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Failed to analyze Job Description");

      onSavesJD(data);
    } catch (err) {
      setError(err.message || "An error occurred during description parsing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Briefcase className="text-indigo-500 w-5 h-5" />
          Target Job Description
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">Define or select key specifications of your desired role</p>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-slate-500 mb-2">Fast-track Templates:</p>
        <div className="flex flex-wrap gap-1.5">
          {SAMPLE_TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyTemplate(tmpl)}
              className="text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 font-medium text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100 transition-all cursor-pointer"
            >
              {tmpl.title}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <RefreshCw className="animate-spin text-indigo-500 w-10 h-10 mb-3" />
          <p className="text-sm font-medium text-slate-600">Gemini is extracting required skills...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Job Title</label>
            <input
              type="text"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="e.g., Senior Full Stack Dev..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Job Description</label>
            <textarea
              className="w-full h-36 p-3.5 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              placeholder="Paste responsibilities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-xl text-sm transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle className="w-4 h-4" />
            Extract Job Skills
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
