-- Remove client-side INSERT on orders. All order creation must go through a
-- trusted server function that computes subtotal/discount/total from server
-- data, so clients cannot forge prices or fake SBI discounts.
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;

-- Belt-and-suspenders: enforce that recorded totals are internally consistent.
-- Using a trigger (CHECK constraints must be immutable and this is fine either
-- way, but a trigger lets us also enforce non-negativity cleanly).
CREATE OR REPLACE FUNCTION public.validate_order_totals()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.subtotal < 0 OR NEW.discount < 0 OR NEW.total < 0 THEN
    RAISE EXCEPTION 'Order amounts must be non-negative';
  END IF;
  IF NEW.discount > NEW.subtotal THEN
    RAISE EXCEPTION 'Discount cannot exceed subtotal';
  END IF;
  IF ROUND(NEW.total::numeric, 2) <> ROUND((NEW.subtotal - NEW.discount)::numeric, 2) THEN
    RAISE EXCEPTION 'Order total must equal subtotal minus discount';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_order_totals_trg ON public.orders;
CREATE TRIGGER validate_order_totals_trg
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.validate_order_totals();