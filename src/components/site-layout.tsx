import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Leaf, ShoppingBag, User as UserIcon, LogOut, MessageCircle } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import natureBg from "@/assets/nature-bg.jpg";
import type { ReactNode } from "react";

// TODO: replace with your real WhatsApp number, including country code, no spaces.
const WHATSAPP_NUMBER = "919999999999";

export function SiteLayout({ children }: { children: ReactNode }) {
  const { count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div
      className="relative min-h-screen"
      style={{
        backgroundImage: `url(${natureBg})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 nature-overlay" />
      <div className="relative">
        <header className="flex items-center justify-between px-6 py-5 md:px-12">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-leaf" />
            <span className="font-display text-2xl tracking-wide text-foreground">PraKruthi Vanam</span>
          </Link>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <Link to="/" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Home</Link>
            <Link to="/products" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Apothecary</Link>
            <Link to="/account" className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>Account</Link>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/account" className="rounded-full glass-card px-3 py-2 text-sm text-foreground" title="Account">
                  <UserIcon className="inline h-4 w-4" />
                </Link>
                <button onClick={signOut} className="rounded-full glass-card px-3 py-2 text-sm text-foreground" title="Sign out">
                  <LogOut className="inline h-4 w-4" />
                </button>
              </>
            ) : (
              <Button asChild size="sm" variant="outline" className="glass-card text-foreground hover:bg-white/10">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
            <Link to="/cart" className="relative rounded-full glass-card px-4 py-2 text-sm text-foreground">
              <ShoppingBag className="inline h-4 w-4" />
              <span className="ml-1">{count}</span>
            </Link>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-border/40 px-6 py-10 text-center text-sm text-muted-foreground">
          <Leaf className="mx-auto mb-2 h-5 w-5 text-leaf" />
          © {new Date().getFullYear()} PraKruthi Vanam Naturals. Brewed with care, in the woods.
        </footer>
      </div>

      {/* Floating WhatsApp button */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi PraKruthi Vanam, I need help with an order.")}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[#25D366]/30 transition hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Chat</span>
      </a>
    </div>
  );
}
