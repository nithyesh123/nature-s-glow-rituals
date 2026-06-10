import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    // Validate session with the server on mount so revoked sessions
    // on other devices are caught immediately.
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(data.user);
      supabase.auth.getSession().then(({ data: s }) => {
        setSession(s.session);
        setLoading(false);
      });
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  return { session, user, loading };
}
