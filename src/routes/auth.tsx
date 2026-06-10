import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in | PraKruthi Vanam" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name } },
        });
        if (error) throw error;
        toast.success("Account created — welcome!");
        navigate({ to: "/account" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in");
        navigate({ to: "/account" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally { setBusy(false); }
  };

  const google = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/account" });
    if (result.error) toast.error("Google sign-in failed");
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-md px-6 py-16">
        <div className="glass-card rounded-2xl p-8">
          <h1 className="font-display text-3xl text-foreground text-center">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h1>
          <Button onClick={google} variant="outline" className="mt-6 w-full glass-card text-foreground hover:bg-white/10">
            Continue with Google
          </Button>
          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required
                className="w-full rounded-lg bg-background/40 p-3 text-foreground placeholder:text-muted-foreground" />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required
              className="w-full rounded-lg bg-background/40 p-3 text-foreground placeholder:text-muted-foreground" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required minLength={6}
              className="w-full rounded-lg bg-background/40 p-3 text-foreground placeholder:text-muted-foreground" />
            <Button type="submit" disabled={busy} className="w-full bg-leaf text-primary-foreground hover:bg-leaf/90">
              {busy ? "Please wait..." : (mode === "signin" ? "Sign in" : "Create account")}
            </Button>
          </form>
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground">
            {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </section>
    </SiteLayout>
  );
}
