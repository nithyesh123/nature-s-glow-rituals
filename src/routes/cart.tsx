import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { productsQueryOptions } from "@/lib/products-query";
import { productImage } from "@/lib/product-images";
import { Trash2, Minus, Plus } from "lucide-react";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "Your Basket | PraKruthi Vanam" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(productsQueryOptions()),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove } = useCart();
  const { data: products } = useSuspenseQuery(productsQueryOptions());
  const lines = items.map(i => ({ ...i, product: products.find(p => p.id === i.id) })).filter(l => l.product);
  const subtotal = lines.reduce((s, l) => s + (l.product!.price * l.qty), 0);

  return (
    <SiteLayout>
      <section className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="font-display text-4xl text-foreground">Your Basket</h1>
        {lines.length === 0 ? (
          <div className="mt-10 glass-card rounded-2xl p-10 text-center">
            <p className="text-muted-foreground">Your basket is empty.</p>
            <Button asChild className="mt-6 bg-leaf text-primary-foreground hover:bg-leaf/90"><Link to="/products">Browse Apothecary</Link></Button>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-4">
              {lines.map(l => (
                <div key={l.id} className="glass-card flex items-center gap-4 rounded-xl p-4">
                  <img src={productImage(l.product!.id, l.product!.image_url)} className="h-20 w-20 rounded-lg object-cover" alt={l.product!.name} />
                  <div className="flex-1">
                    <h3 className="font-display text-lg text-foreground">{l.product!.name}</h3>
                    <p className="text-sm text-accent">₹{l.product!.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(l.id, l.qty - 1)} className="rounded-full glass-card p-1"><Minus className="h-4 w-4" /></button>
                    <span className="w-6 text-center text-foreground">{l.qty}</span>
                    <button onClick={() => setQty(l.id, l.qty + 1)} className="rounded-full glass-card p-1"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => remove(l.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
            <div className="mt-8 glass-card rounded-2xl p-6">
              <div className="flex justify-between text-foreground"><span>Subtotal</span><span className="font-display text-2xl">₹{subtotal}</span></div>
              <p className="mt-2 text-xs text-muted-foreground">SBI card 10% discount will be applied at checkout.</p>
              <Button asChild className="mt-6 w-full bg-leaf text-primary-foreground hover:bg-leaf/90"><Link to="/checkout">Proceed to Checkout</Link></Button>
            </div>
          </>
        )}
      </section>
    </SiteLayout>
  );
}
