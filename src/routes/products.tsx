import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productsQueryOptions } from "@/lib/products-query";
import { productImage } from "@/lib/product-images";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Apothecary — All Products | PraKruthi Vanam" },
      { name: "description", content: "Browse all hair oils and face pastes — handcrafted from forest ingredients." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions()),
  component: ProductsPage,
});

function ProductsPage() {
  const { data: products } = useSuspenseQuery(productsQueryOptions());
  const { add } = useCart();
  const [filter, setFilter] = useState<"all" | "Hair Oil" | "Face Paste">("all");
  const list = filter === "all" ? products : products.filter((p) => p.type === filter);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 text-center">
          <h1 className="font-display text-5xl text-foreground">The Full Apothecary</h1>
          <div className="mt-6 inline-flex gap-2 rounded-full glass-card p-1">
            {(["all", "Hair Oil", "Face Paste"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`rounded-full px-4 py-2 text-sm transition ${filter === f ? "bg-leaf text-primary-foreground" : "text-foreground hover:bg-white/10"}`}>
                {f === "all" ? "All" : f + "s"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <article key={p.id} className="glass-card overflow-hidden rounded-2xl">
              <Link to="/products/$id" params={{ id: p.id }} className="block aspect-square overflow-hidden bg-moss/30">
                <img src={productImage(p.id, p.image_url)} alt={p.name} className="h-full w-full object-cover transition hover:scale-105" />
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
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {p.ingredients.map((i) => (
                    <li key={i} className="rounded-full bg-moss/30 px-2.5 py-1 text-xs text-foreground/90">{i}</li>
                  ))}
                </ul>
                <Button onClick={() => { add(p.id); toast.success(`${p.name} added`); }}
                  className="mt-5 w-full bg-leaf text-primary-foreground hover:bg-leaf/90">
                  Add to Basket
                </Button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
