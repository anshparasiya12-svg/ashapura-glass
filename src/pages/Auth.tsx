import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [busy, setBusy]         = useState(false);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const res = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (res.error) { toast.error("Google sign-in failed"); setBusy(false); }
  };

  const inputBase =
    "w-full bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400 transition-all duration-200 shadow-sm";

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* ── Animated gradient background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900" />

      {/* Animated blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full filter blur-3xl animate-blob" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/15 rounded-full filter blur-3xl animate-blob" style={{ animationDelay: "3s" }} />
      <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-cyan-400/10 rounded-full filter blur-3xl animate-blob" style={{ animationDelay: "5s" }} />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "40px 40px" }}
      />

      {/* ── Card ── */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg animate-pulse-glow">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white font-display">Ashapura Glass</h1>
              <p className="text-xs text-teal-300/80 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Glass Business Suite
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-1 mb-7 p-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-white/70 hover:text-white"
                }`}
              >
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-3.5">
            {mode === "signup" && (
              <div className="relative animate-fade-in-up">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full name"
                  className={`${inputBase} pl-10`}
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={`${inputBase} pl-10`}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPwd ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className={`${inputBase} pl-10 pr-10`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              disabled={busy}
              type="submit"
              className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-teal-500/25 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed group"
            >
              {busy ? (
                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "signup" ? "Create Account" : "Sign In"}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-xs text-white/40 font-medium">OR</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>

          {/* Google Button */}
          <button
            onClick={google}
            disabled={busy}
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.5 35 26.9 36 24 36c-5.3 0-9.7-3.6-11.3-8.5l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.5 5.5C40.9 35.5 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-[11px] text-white/30 text-center mt-5">
            By continuing you agree to our Terms of Service & Privacy Policy.
          </p>
        </div>

        {/* Bottom glow */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-teal-500/20 blur-2xl rounded-full" />
      </div>
    </div>
  );
};

export default Auth;
