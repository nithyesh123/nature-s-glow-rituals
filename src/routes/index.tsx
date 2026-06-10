import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Sparkles, CreditCard, Smartphone, Percent } from "lucide-react";
import { SiteLayout } from "@/components/site-layout";
import { useCart } from "@/lib/cart";
import { productsQueryOptions } from "@/lib/products-query";
import { productImage } from "@/lib/product-images";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PraKruthi Vanam — Natural Hair & Face Care from the Forest" },
      { name: "description", content: "Handcrafted ayurvedic hair oils and face pastes made with onion, amla, bhringraj, lemon & rice water. Pure ingredients, forest-fresh." },
      { property: "og:title", content: "PraKruthi Vanam — Natural Hair & Face Care" },
      { property: "og:description", content: "Handcrafted ayurvedic hair oils and face pastes. Pure forest ingredients." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions()),
  component: Home,
});

function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Featured />
      <Story />
      <PaymentInfo />
    </SiteLayout>
  );
}

function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 text-center md:py-32">
      <Badge className="mb-6 bg-leaf/20 text-leaf border border-leaf/30 backdrop-blur">
        <Sparkles className="mr-1 h-3 w-3" /> Forest-Fresh Ayurveda
      </Badge>
      <h1 className="font-display text-5xl leading-[1.05] text-foreground md:text-7xl">
        Skincare grown<br />
        <span className="italic text-accent">where the wild things are.</span>
      </h1>
      <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
        Handcrafted hair oils and face pastes pressed from onion, amla, bhringraj,
        lemon and fermented rice water — nothing else, ever.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Button asChild size="lg" className="bg-leaf text-primary-foreground hover:bg-leaf/90">
          <Link to="/products">Explore Apothecary</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="glass-card text-foreground hover:bg-white/10">
          <a href="#story">Our Roots</a>
        </Button>
      </div>
    </section>
  );
}

function Featured() {
  const { data: products } = useSuspenseQuery(productsQueryOptions());
  const { add } = useCart();
  const featured = products.filter((p) => p.featured).slice(0, 6);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <h2 className="font-display text-4xl text-foreground md:text-5xl">The Apothecary</h2>
        <p className="mt-3 text-muted-foreground">Oils at ₹299 · Pastes at ₹499</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((p) => (
          <article key={p.id} className="glass-card overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl">
            <Link to="/products/$id" params={{ id: p.id }} className="block aspect-square overflow-hidden bg-moss/30">
              <img src={productImage(p.id, p.image_url)} alt={p.name} loading="lazy" width={800} height={800}
                className="h-full w-full object-cover transition duration-700 hover:scale-105" />
            </Link>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-leaf/40 text-leaf">{p.type}</Badge>
                <span className="font-display text-2xl text-accent">₹{p.price}</span>
              </div>
              <Link to="/products/$id" params={{ id: p.id }}>
                <h3 className="mt-3 font-display text-2xl text-foreground hover:text-accent">{p.name}</h3>
              </Link>
              <p className="mt-1 text-sm italic text-muted-foreground">{p.tagline}</p>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-widest text-leaf">Ingredients</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {p.ingredients.map((i) => (
                    <li key={i} className="rounded-full bg-moss/30 px-2.5 py-1 text-xs text-foreground/90">{i}</li>
                  ))}
                </ul>
              </div>
              <Button
                onClick={() => { add(p.id); toast.success(`${p.name} added to basket`); }}
                className="mt-6 w-full bg-leaf text-primary-foreground hover:bg-leaf/90"
              >
                Add to Basket
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function Story() {
  return (
    <section id="story" className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h2 className="font-display text-4xl text-foreground md:text-5xl">Slow-made, forest-grown</h2>
      <p className="mx-auto mt-6 text-lg text-muted-foreground">
        Every bottle is cold-pressed in small batches, using ingredients foraged from
        family-run farms. No preservatives. No fragrance. No fillers — just the
        quiet chemistry of plants doing what they've always done.
      </p>
    </section>
  );
}

function PaymentInfo() {
  return (
    <section id="payment" className="mx-auto max-w-5xl px-6 py-20">
      <div className="glass-card rounded-3xl p-8 md:p-12">
        <div className="text-center">
          <h2 className="font-display text-4xl text-foreground">Payment, gently handled</h2>
          <p className="mt-3 text-muted-foreground">Choose the method that suits you.</p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-leaf/30 bg-moss/20 p-6">
            <CreditCard className="h-7 w-7 text-accent" />
            <h3 className="mt-3 font-display text-2xl text-foreground">Card</h3>
            <p className="mt-1 text-sm text-muted-foreground">All major debit & credit cards accepted.</p>
          </div>
          <div className="rounded-2xl border border-leaf/30 bg-moss/20 p-6">
            <Smartphone className="h-7 w-7 text-accent" />
            <h3 className="mt-3 font-display text-2xl text-foreground">UPI</h3>
            <p className="mt-1 text-sm text-muted-foreground">Google Pay, PhonePe, Paytm, BHIM & more.</p>
          </div>
        </div>
        <div className="mt-8 flex items-start gap-4 rounded-2xl border border-accent/40 bg-accent/10 p-6">
          <Percent className="mt-1 h-6 w-6 shrink-0 text-accent" />
          <div>
            <h4 className="font-display text-xl text-foreground">Special Offer — SBI Bank Cards</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Enjoy an instant <span className="font-semibold text-accent">10% discount</span> on
              every order paid with an SBI debit or credit card. Discount auto-applied at checkout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
