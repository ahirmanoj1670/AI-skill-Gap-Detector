import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Sparkles, Brain, Lock, AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all credential fields.");
      return;
    }

    setLoading(true);
    setError("");

    const path = isRegistering ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await axios.post(path, { email, password });
      
      // Save backend responses
      const { access_token, user_id } = response.data;
      localStorage.setItem("sg_token", access_token);
      localStorage.setItem("sg_email", email);
      localStorage.setItem("sg_uid", user_id);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Authentication error occurred, please verify inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-100 shadow-xl rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-indigo-50 text-indigo-600 w-fit p-3.5 rounded-2xl mx-auto border border-indigo-100/50">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            {isRegistering ? "Create your Account" : "Welcome to SkillGap AI"}
          </h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Identify resume gap shortages, generate high-impact visual timelines, and unlock recommended free educational courses.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email Address</label>
            <input
              type="email"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
            <input
              type="password"
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 text-xs font-medium">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-xl text-sm tracking-wide transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegistering ? (
              "Register & Create Account"
            ) : (
              "Sign In to Your Workspace"
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-100">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setError("");
            }}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition-all cursor-pointer"
          >
            {isRegistering ? "Already have an account? Sign In" : "Need an account? Register or sign up free"}
          </button>
        </div>
      </div>
    </div>
  );
}
