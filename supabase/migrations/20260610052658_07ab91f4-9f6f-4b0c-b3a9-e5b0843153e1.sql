
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
CREATE TYPE public.product_type AS ENUM ('Hair Oil', 'Face Paste');
CREATE TYPE public.order_status AS ENUM ('placed', 'packed', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.payment_method AS ENUM ('card', 'upi');

-- ===== UPDATED_AT TRIGGER FN =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== USER_ROLES =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ===== PRODUCTS =====
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type product_type NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  image_url TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  stock INTEGER NOT NULL DEFAULT 100 CHECK (stock >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== ORDERS =====
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  payment_method payment_method NOT NULL,
  is_sbi_card BOOLEAN NOT NULL DEFAULT false,
  payment_id TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  status order_status NOT NULL DEFAULT 'placed',
  shipping_name TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_pincode TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== REVIEWS =====
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone view reviews" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users insert own review" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own review" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users delete own review" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== SEED PRODUCTS =====
INSERT INTO public.products (id, name, type, price, image_url, tagline, description, ingredients, featured) VALUES
('onion-oil', 'Onion Bloom Hair Oil', 'Hair Oil', 299, '/assets/onion-oil.jpg', 'For root strength & re-growth', 'Cold-pressed onion oil infused with amla and bhringraj to reduce hair fall and stimulate regrowth.', ARRAY['Cold-pressed Onion','Amla','Bhringraj','Coconut Base'], true),
('bhringraj-oil', 'Bhringraj Forest Oil', 'Hair Oil', 299, '/assets/bhringraj-oil.jpg', 'Calms scalp, deepens colour', 'Wild bhringraj steeped in sesame oil with curry leaves — traditional remedy for premature greying.', ARRAY['Wild Bhringraj','Amla','Sesame Oil','Curry Leaf'], true),
('amla-oil', 'Amla Shine Hair Oil', 'Hair Oil', 299, '/assets/hair-oil.jpg', 'Lustre & length from within', 'Vitamin-C packed amla blend that deeply nourishes the scalp and adds natural shine.', ARRAY['Fresh Amla','Bhringraj','Onion Extract','Almond Oil'], true),
('rice-paste', 'Rice Water Glow Paste', 'Face Paste', 499, '/assets/rice-paste.jpg', 'Soft, milky brightness', 'Fermented rice water paste with lemon and honey — brightens dull skin and evens tone.', ARRAY['Fermented Rice Water','Lemon','Raw Honey','Oat Flour'], true),
('amla-paste', 'Amla Renewal Paste', 'Face Paste', 499, '/assets/amla-paste.jpg', 'Vitamin-C rich firmness', 'Hand-mashed amla and rose clay paste that firms and renews tired skin.', ARRAY['Hand-mashed Amla','Bhringraj Leaf','Rose Clay','Aloe'], true),
('lemon-paste', 'Lemon Dew Face Paste', 'Face Paste', 499, '/assets/face-paste.jpg', 'Detox & gentle exfoliation', 'Lemon zest with rice water and sandalwood for a gentle weekly detox.', ARRAY['Lemon Zest','Rice Water','Amla Powder','Sandalwood'], true);
