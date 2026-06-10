import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export type CartItem = { id: string; qty: number };
export type AddMeta = { name: string; price: number; image?: string };

type CartContextValue = {
  items: CartItem[];
  add: (id: string, meta?: AddMeta) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "pkv_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [added, setAdded] = useState<AddMeta | null>(null);
  const [addedQty, setAddedQty] = useState(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch { /* ignore */ }
  }, [items]);

  const add = (id: string, meta?: AddMeta) => {
    let newQty = 1;
    setItems((prev) => {
      const found = prev.find((i) => i.id === id);
      if (found) {
        newQty = found.qty + 1;
        return prev.map((i) => (i.id === id ? { ...i, qty: newQty } : i));
      }
      return [...prev, { id, qty: 1 }];
    });
    if (meta) {
      setAdded(meta);
      setAddedQty(newQty);
    }
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
    );

  const clear = () => setItems([]);
  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count }}>
      {children}
      <Dialog open={!!added} onOpenChange={(o) => !o && setAdded(null)}>
        <DialogContent className="glass-card border-leaf/30 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-display text-2xl text-foreground">
              <CheckCircle2 className="h-6 w-6 text-leaf" /> Added to your basket
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {added?.name} is waiting for you.
            </DialogDescription>
          </DialogHeader>
          {added && (
            <div className="flex items-center gap-4 rounded-xl bg-moss/20 p-4">
              {added.image && (
                <img src={added.image} alt={added.name} className="h-20 w-20 rounded-lg object-cover" />
              )}
              <div className="flex-1">
                <p className="font-display text-lg text-foreground">{added.name}</p>
                <p className="text-sm text-muted-foreground">Qty in basket: {addedQty}</p>
                <p className="font-display text-xl text-accent">₹{added.price}</p>
              </div>
            </div>
          )}
          <p className="text-sm text-muted-foreground">
            Basket total items: <span className="font-semibold text-foreground">{count}</span>
          </p>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="outline" className="glass-card flex-1" onClick={() => setAdded(null)}>
              Continue Shopping
            </Button>
            <Button asChild className="flex-1 bg-leaf text-primary-foreground hover:bg-leaf/90" onClick={() => setAdded(null)}>
              <Link to="/cart">View Basket</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
