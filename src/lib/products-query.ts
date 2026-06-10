import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  name: string;
  type: "Hair Oil" | "Face Paste";
  price: number;
  image_url: string;
  tagline: string | null;
  description: string | null;
  ingredients: string[];
  stock: number;
  featured: boolean;
};

export function productsQueryOptions() {
  return queryOptions({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, type, price, image_url, tagline, description, ingredients, stock, featured")
        .eq("active", true)
        .order("type")
        .order("price");
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}

export function productQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["product", id],
    queryFn: async (): Promise<Product> => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, type, price, image_url, tagline, description, ingredients, stock, featured")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Product;
    },
  });
}

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export function reviewsQueryOptions(productId: string) {
  return queryOptions({
    queryKey: ["reviews", productId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, product_id, user_id, user_name, rating, comment, created_at")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
  });
}
