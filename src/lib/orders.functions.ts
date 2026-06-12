import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ItemSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(50),
});

const InputSchema = z.object({
  items: z.array(ItemSchema).min(1).max(50),
  payment_method: z.enum(["card", "upi"]),
  is_sbi_card: z.boolean(),
  shipping_name: z.string().trim().min(1).max(120),
  shipping_phone: z.string().trim().min(7).max(20),
  shipping_address: z.string().trim().min(3).max(500),
  shipping_city: z.string().trim().min(1).max(120),
  shipping_state: z.string().trim().min(1).max(120),
  shipping_pincode: z.string().trim().min(3).max(20),
});

/**
 * Create an order with server-computed totals.
 * Prices, discounts, and totals are derived from the database — never trust
 * client-supplied amounts. SBI discount only applies when payment_method=card.
 */
export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load authoritative product data
    const ids = Array.from(new Set(data.items.map((i) => i.product_id)));
    const { data: products, error: prodErr } = await supabase
      .from("products")
      .select("id, name, price, stock, active")
      .in("id", ids);
    if (prodErr) throw new Error("Could not load products");
    if (!products || products.length !== ids.length) {
      throw new Error("One or more products are unavailable");
    }

    let subtotalCents = 0;
    const lineItems = data.items.map((item) => {
      const p = products.find((pr) => pr.id === item.product_id);
      if (!p || !p.active) throw new Error("Product unavailable");
      if (p.stock < item.quantity) throw new Error(`Insufficient stock for ${p.name}`);
      const lineCents = Math.round(Number(p.price) * 100) * item.quantity;
      subtotalCents += lineCents;
      return {
        product_id: p.id,
        name: p.name,
        price: Number(p.price),
        quantity: item.quantity,
      };
    });

    const sbiEligible = data.is_sbi_card && data.payment_method === "card";
    const discountCents = sbiEligible ? Math.round(subtotalCents * 0.1) : 0;
    const totalCents = subtotalCents - discountCents;

    const subtotal = subtotalCents / 100;
    const discount = discountCents / 100;
    const total = totalCents / 100;

    // Insert via the user's authenticated client (RLS allows the user to read
    // their own orders; admin client is used because direct INSERT is no
    // longer permitted to authenticated users).
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error: insertErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: userId,
        items: lineItems,
        subtotal,
        discount,
        total,
        is_sbi_card: sbiEligible,
        payment_method: data.payment_method,
        shipping_name: data.shipping_name,
        shipping_phone: data.shipping_phone,
        shipping_address: data.shipping_address,
        shipping_city: data.shipping_city,
        shipping_state: data.shipping_state,
        shipping_pincode: data.shipping_pincode,
      })
      .select("id, total, discount, subtotal")
      .single();
    if (insertErr) throw new Error("Could not create order");

    return order;
  });
