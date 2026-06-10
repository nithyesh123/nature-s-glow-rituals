import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import natureBg from "@/assets/nature-bg.jpg";
import hairOil from "@/assets/hair-oil.jpg";
import onionOil from "@/assets/onion-oil.jpg";
import bhringrajOil from "@/assets/bhringraj-oil.jpg";
import facePaste from "@/assets/face-paste.jpg";
import ricePaste from "@/assets/rice-paste.jpg";
import amlaPaste from "@/assets/amla-paste.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Sparkles, CreditCard, Smartphone, Percent, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PraKruthi Vanam — Natural Hair & Face Care from the Forest" },
      { name: "description", content: "Handcrafted ayurvedic hair oils and face pastes made with onion, amla, bhringraj, lemon & rice water. Pure ingredients, forest-fresh." },
      { property: "og:title", content: "PraKruthi Vanam — Natural Hair & Face Care" },
      { property: "og:description", content: "Handcrafted ayurvedic hair oils and face pastes. Pure forest ingredients." },
    ],
  }),
  component: Home,
});

type Product = {
  id: string;
  name: string;
  type: "Hair Oil" | "Face Paste";
  price: number;
  image: string;
  tagline: string;
  ingredients: string[];
};

const products: Product[] = [
  {
    id: "onion-oil",
    name: "Onion Bloom Hair Oil",
    type: "Hair Oil",
    price: 299,
    image: onionOil,
    tagline: "For root strength & re-growth",
    ingredients: ["Cold-pressed Onion", "Amla", "Bhringraj", "Coconut Base"],
  },
  {
    id: "bhringraj-oil",
    name: "Bhringraj Forest Oil",
    type: "Hair Oil",
    price: 299,
    image: bhringrajOil,
    tagline: "Calms scalp, deepens colour",
    ingredients: ["Wild Bhringraj", "Amla", "Sesame Oil", "Curry Leaf"],
  },
  {
    id: "amla-oil",
    name: "Amla Shine Hair Oil",
    type: "Hair Oil",
    price: 299,
    image: hairOil,
    tagline: "Lustre & length from within",
    ingredients: ["Fresh Amla", "Bhringraj", "Onion Extract", "Almond Oil"],
  },
  {
    id: "rice-paste",
    name: "Rice Water Glow Paste",
    type: "Face Paste",
    price: 499,
    image: ricePaste,
    tagline: "Soft, milky brightness",
    ingredients: ["Fermented Rice Water", "Lemon", "Raw Honey", "Oat Flour"],
  },
  {
    id: "amla-paste",
    name: "Amla Renewal Paste",
    type: "Face Paste",
    price: 499,
    image: amlaPaste,
    tagline: "Vitamin-C rich firmness",
    ingredients: ["Hand-mashed Amla", "Bhringraj Leaf", "Rose Clay", "Aloe"],
  },
  {
    id: "lemon-paste",
    name: "Lemon Dew Face Paste",
    type: "Face Paste",
    price: 499,
    image: facePaste,
    tagline: "Detox & gentle exfoliation",
    ingredients: ["Lemon Zest", "Rice Water", "Amla Powder", "Sandalwood"],
  },
];

function Home() {
  const [cart, setCart] = useState<string[]>([]);

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
        {/* Nav */}
        <header className="flex items-center justify-between px-6 py-5 md:px-12">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-leaf" />
            <span className="font-display text-2xl tracking-wide text-foreground">PraKruthi Vanam</span>
          </div>
          <nav className="hidden gap-8 text-sm text-muted-foreground md:flex">
            <a href="#products" className="hover:text-foreground">Products</a>
            <a href="#story" className="hover:text-foreground">Our Story</a>
            <a href="#payment" className="hover:text-foreground">Payment</a>
          </nav>
          <button className="relative rounded-full glass-card px-4 py-2 text-sm">
            <ShoppingBag className="inline h-4 w-4" /> <span className="ml-1">{cart.length}</span>
          </button>
        </header>

        {/* Hero */}
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
              <a href="#products">Explore Apothecary</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="glass-card text-foreground hover:bg-white/10">
              <a href="#story">Our Roots</a>
            </Button>
          </div>
        </section>

        {/* Products */}
        <section id="products" className="mx-auto max-w-6xl px-6 py-16">
          <div className="mb-12 text-center">
            <h2 className="font-display text-4xl text-foreground md:text-5xl">The Apothecary</h2>
            <p className="mt-3 text-muted-foreground">Oils at ₹299 · Pastes at ₹499</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <article key={p.id} className="glass-card overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="aspect-square overflow-hidden bg-moss/30">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    width={1024}
                    height={1024}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="border-leaf/40 text-leaf">{p.type}</Badge>
                    <span className="font-display text-2xl text-accent">₹{p.price}</span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl text-foreground">{p.name}</h3>
                  <p className="mt-1 text-sm italic text-muted-foreground">{p.tagline}</p>

                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-widest text-leaf">Ingredients</p>
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {p.ingredients.map((i) => (
                        <li key={i} className="rounded-full bg-moss/30 px-2.5 py-1 text-xs text-foreground/90">
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    onClick={() => setCart((c) => [...c, p.id])}
                    className="mt-6 w-full bg-leaf text-primary-foreground hover:bg-leaf/90"
                  >
                    Add to Basket
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Story */}
        <section id="story" className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="font-display text-4xl text-foreground md:text-5xl">Slow-made, forest-grown</h2>
          <p className="mx-auto mt-6 text-lg text-muted-foreground">
            Every bottle is cold-pressed in small batches, using ingredients foraged from
            family-run farms. No preservatives. No fragrance. No fillers — just the
            quiet chemistry of plants doing what they've always done.
          </p>
        </section>

        {/* Payment */}
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

        <footer className="border-t border-border/40 px-6 py-10 text-center text-sm text-muted-foreground">
          <Leaf className="mx-auto mb-2 h-5 w-5 text-leaf" />
          © {new Date().getFullYear()} PraKruthi Vanam Naturals. Brewed with care, in the woods.
        </footer>
      </div>
    </div>
  );
}
