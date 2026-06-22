import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

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
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created. You're signed in.");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Kind Cashier</h1>
            <p className="text-xs text-muted-foreground">Glass Business Management</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6 p-1 bg-muted rounded-lg">
          {(["signin", "signup"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm rounded-md transition ${mode === m ? "bg-card shadow-sm font-medium" : "text-muted-foreground"}`}>
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name"
              className="w-full border border-input rounded-md px-3 py-2.5 text-sm bg-card" required />
          )}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full border border-input rounded-md px-3 py-2.5 text-sm bg-card" required />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6)"
            className="w-full border border-input rounded-md px-3 py-2.5 text-sm bg-card" required minLength={6} />
          <button disabled={busy} type="submit"
            className="w-full bg-muted/30 text-muted-foreground uppercase tracking-wider text-xs py-2.5 rounded-md text-sm font-medium hover:opacity-90 disabled:opacity-50">
            {busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" /> OR <div className="flex-1 h-px bg-border" />
        </div>

        <button onClick={google} disabled={busy}
          className="w-full border border-input rounded-md py-2.5 text-sm font-medium hover:bg-muted flex items-center justify-center gap-2 disabled:opacity-50">
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.5 35 26.9 36 24 36c-5.3 0-9.7-3.6-11.3-8.5l-6.6 5.1C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.5 5.5C40.9 35.5 44 30.1 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <p className="text-xs text-muted-foreground text-center mt-6">
          By continuing you agree to the terms of service.
        </p>
      </div>
    </div>
  );
};

export default Auth;

