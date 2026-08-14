import React from "react";
import { Calendar, BookOpen, ExternalLink, Trophy, GraduationCap, PlayCircle, Layers } from "lucide-react";

export default function Roadmap({ weeks = [], courses = [] }) {
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "YouTube":
        return <PlayCircle className="w-4 h-4 text-rose-500" />;
      case "freeCodeCamp":
        return <GraduationCap className="w-4 h-4 text-emerald-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
    }
  };

  const getPlatformClass = (platform) => {
    switch (platform) {
      case "YouTube":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "freeCodeCamp":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default:
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Week-by-Week Visual Learning plan */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6">
        <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <Calendar className="text-indigo-500 w-5 h-5" />
              Customized Visual Learning Roadmap
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Week-by-week action program formulated by Gemini AI</p>
          </div>
          <div className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" />
            Adaptive Learning Goal
          </div>
        </div>

        {weeks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">Run a correlation gap check to render your study guide.</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-6">
            {weeks.map((week, idx) => (
              <div key={idx} className="relative">
                <div className="absolute -left-[35px] top-1.5 bg-indigo-600 outline-4 outline-white text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-sm">
                  {week.weekNumber}
                </div>

                <div className="bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-4 rounded-xl transition-all">
                  <h4 className="text-sm font-bold text-slate-800">
                    Week {week.weekNumber}: {week.focus}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-2 border-t border-slate-100/50">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        Concepts to Master
                      </p>
                      <ul className="space-y-1.5">
                        {week.topics?.map((topic, tIdx) => (
                          <li key={tIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="text-indigo-400 font-bold shrink-0">•</span>
                            <span className="leading-relaxed">{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-emerald-500" />
                        Practical Milestones
                      </p>
                      <ul className="space-y-1.5">
                        {week.exercises?.map((exercise, eIdx) => (
                          <li key={eIdx} className="text-xs text-slate-600 flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span className="leading-relaxed font-medium">{exercise}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {courses.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xs border border-slate-100 p-6">
          <div className="mb-6 flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <GraduationCap className="text-indigo-500 w-5 h-5" />
                Targeted Free Interactive Resources
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">High-quality curriculum matching detected skill shortages</p>
            </div>
          </div>

          <div className="space-y-6">
            {courses.map((group, gIdx) => (
              <div key={gIdx} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 bg-slate-50 p-2 border border-slate-100 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  Resources for: <span className="text-indigo-600">{group.skill}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.recommendations?.map((course, cIdx) => (
                    <div
                      key={cIdx}
                      className="border border-slate-100 bg-white hover:shadow-xs rounded-xl p-4 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getPlatformClass(course.platform)} flex items-center gap-1`}>
                            {getPlatformIcon(course.platform)}
                            {course.platform}
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-800 leading-snug">{course.title}</h5>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{course.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-50 flex justify-end">
                        <a
                          href={course.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          Launch Material
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
