import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

type Order = {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: { id: string; qty: number }[];
};

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account | PraKruthi Vanam" }] }),
  component: Account,
});

function Account() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("orders").select("id, total, status, created_at, items").order("created_at", { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as Order[]));
  }, [user]);

  if (!user) return null;

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-4xl text-foreground">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">{user.email}</p>

        <h2 className="mt-10 font-display text-2xl text-foreground">Your Orders</h2>
        {orders.length === 0 ? (
          <div className="mt-4 glass-card rounded-2xl p-6 text-center text-muted-foreground">
            No orders yet. <Link to="/products" className="text-accent underline">Start shopping</Link>.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {orders.map(o => (
              <div key={o.id} className="glass-card rounded-xl p-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">#{o.id.slice(0, 8)}</span>
                  <span className="font-display text-lg text-accent">₹{o.total}</span>
                </div>
                <div className="mt-1 text-sm text-foreground capitalize">{o.status}</div>
              </div>
            ))}
          </div>
        )}

        <Button asChild className="mt-10 bg-leaf text-primary-foreground hover:bg-leaf/90">
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </section>
    </SiteLayout>
  );
}
