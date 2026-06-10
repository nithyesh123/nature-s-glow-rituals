import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { productQueryOptions, reviewsQueryOptions } from "@/lib/products-query";
import { productImage } from "@/lib/product-images";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/products/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(productQueryOptions(params.id)),
  head: ({ params }) => ({ meta: [{ title: `${params.id} | PraKruthi Vanam` }] }),
  component: ProductDetail,
  errorComponent: () => <SiteLayout><div className="p-20 text-center text-foreground">Product not found.</div></SiteLayout>,
  notFoundComponent: () => <SiteLayout><div className="p-20 text-center text-foreground">Product not found.</div></SiteLayout>,
});

function ProductDetail() {
  const { id } = Route.useParams();
  const { data: p } = useSuspenseQuery(productQueryOptions(id));
  const { data: reviews = [] } = useQuery(reviewsQueryOptions(id));
  const { add } = useCart();
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submitReview = async () => {
    if (!user) return toast.error("Please sign in to leave a review");
    const userName = (user.user_metadata?.full_name as string) || user.email?.split("@")[0] || "Customer";
    const { error } = await supabase.from("reviews").upsert({
      product_id: id, user_id: user.id, user_name: userName, rating, comment,
    }, { onConflict: "product_id,user_id" });
    if (error) toast.error(error.message); else { toast.success("Review posted"); setComment(""); }
  };

  return (
    <SiteLayout>
      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="glass-card overflow-hidden rounded-2xl">
            <img src={productImage(p.id, p.image_url)} alt={p.name} className="aspect-square w-full object-cover" />
          </div>
          <div>
            <Badge variant="outline" className="border-leaf/40 text-leaf">{p.type}</Badge>
            <h1 className="mt-3 font-display text-4xl text-foreground">{p.name}</h1>
            <p className="mt-2 italic text-muted-foreground">{p.tagline}</p>
            <div className="mt-3 flex items-center gap-2">
              {[1,2,3,4,5].map(n => <Star key={n} className={`h-4 w-4 ${n <= Math.round(avg) ? "fill-accent text-accent" : "text-muted-foreground"}`} />)}
              <span className="text-sm text-muted-foreground">{reviews.length} review{reviews.length !== 1 && "s"}</span>
            </div>
            <p className="mt-4 text-foreground/90">{p.description}</p>
            <div className="mt-6">
              <p className="text-xs uppercase tracking-widest text-leaf">Ingredients</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {p.ingredients.map(i => <li key={i} className="rounded-full bg-moss/30 px-3 py-1 text-sm text-foreground/90">{i}</li>)}
              </ul>
            </div>
            <div className="mt-8 flex items-center gap-4">
              <span className="font-display text-3xl text-accent">₹{p.price}</span>
              <Button onClick={() => { add(p.id); toast.success("Added to basket"); }} className="bg-leaf text-primary-foreground hover:bg-leaf/90">
                Add to Basket
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="font-display text-3xl text-foreground">Reviews</h2>
          {user ? (
            <div className="mt-4 glass-card rounded-2xl p-6">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(n => (
                  <button key={n} onClick={() => setRating(n)}>
                    <Star className={`h-6 w-6 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                  </button>
                ))}
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Share your experience..."
                className="mt-3 w-full rounded-lg bg-background/40 p-3 text-foreground placeholder:text-muted-foreground" />
              <Button onClick={submitReview} className="mt-3 bg-leaf text-primary-foreground hover:bg-leaf/90">Post review</Button>
            </div>
          ) : (
            <p className="mt-4 text-muted-foreground"><Link to="/auth" className="text-accent underline">Sign in</Link> to write a review.</p>
          )}
          <div className="mt-6 space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{r.user_name}</span>
                  <div className="flex">{[1,2,3,4,5].map(n => <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />)}</div>
                </div>
                {r.comment && <p className="mt-2 text-sm text-foreground/90">{r.comment}</p>}
              </div>
            ))}
            {reviews.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet — be the first.</p>}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
