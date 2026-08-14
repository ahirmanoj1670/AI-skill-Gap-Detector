import React from "react";
import { CheckCircle2, XCircle, Award, Target } from "lucide-react";

export default function SkillGapCard({
  matchScore,
  matchedSkills = [],
  missingSkills = [],
  resumeSkills = [],
  jdSkills = [],
  roleTitle,
}) {
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  const getProgressBarColor = (score) => {
    if (score >= 80) return "bg-emerald-500 shadow-emerald-100";
    if (score >= 50) return "bg-amber-500 shadow-amber-100";
    return "bg-rose-500 shadow-rose-100";
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Match Gap Analysis</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Targeting: <span className="font-semibold text-indigo-600">{roleTitle || "Selected Role"}</span>
          </p>
        </div>
        <div className={`px-3 py-1.5 rounded-xl border text-sm font-bold flex items-center gap-1.5 ${getScoreColor(matchScore)}`}>
          <Award className="w-4 h-4" />
          <span>{matchScore}% Match</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
          <span>Overall Compatibility Score</span>
          <span>{matchScore}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out shadow-xs ${getProgressBarColor(matchScore)}`}
            style={{ width: `${Math.max(matchScore, 4)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-3 p-4 bg-emerald-50/20 rounded-xl border border-emerald-100/30">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <h4 className="text-sm font-bold">Skills You Have ({matchedSkills.length})</h4>
          </div>

          {matchedSkills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No exact skill matches identified yet.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {matchedSkills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs font-medium text-emerald-800 bg-emerald-100/50 border border-emerald-100 px-2.5 py-1 rounded-lg"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 p-4 bg-rose-50/20 rounded-xl border border-rose-100/30">
          <div className="flex items-center gap-2 text-rose-700">
            <XCircle className="w-5 h-5 shrink-0" />
            <h4 className="text-sm font-bold text-rose-800">Skill Gap ({missingSkills.length})</h4>
          </div>

          {missingSkills.length === 0 ? (
            <div className="p-3 bg-emerald-100/30 border border-emerald-100 rounded-lg">
              <p className="text-xs text-emerald-800 font-semibold text-center">Perfect match! No missing skills detected!</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {missingSkills.map((skill, index) => (
                <span
                  key={index}
                  className="text-xs font-medium text-rose-800 bg-rose-100/60 border border-rose-100 px-2.5 py-1 rounded-lg flex items-center gap-1"
                >
                  <Target className="w-3.5 h-3.5" />
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
