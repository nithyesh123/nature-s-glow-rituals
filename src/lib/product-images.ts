import onionOil from "@/assets/onion-oil.jpg";
import bhringrajOil from "@/assets/bhringraj-oil.jpg";
import hairOil from "@/assets/hair-oil.jpg";
import ricePaste from "@/assets/rice-paste.jpg";
import amlaPaste from "@/assets/amla-paste.jpg";
import facePaste from "@/assets/face-paste.jpg";

export const PRODUCT_IMAGES: Record<string, string> = {
  "onion-oil": onionOil,
  "bhringraj-oil": bhringrajOil,
  "amla-oil": hairOil,
  "rice-paste": ricePaste,
  "amla-paste": amlaPaste,
  "lemon-paste": facePaste,
};

export function productImage(id: string, fallback?: string) {
  return PRODUCT_IMAGES[id] ?? fallback ?? hairOil;
}
