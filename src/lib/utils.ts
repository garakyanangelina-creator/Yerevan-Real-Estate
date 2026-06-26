import type { Property } from "@/types/property";

export function formatPrice(price: number, purpose: Property["purpose"], currency = "AMD") {
  const formatted = new Intl.NumberFormat("en-US").format(price);
  return purpose === "rent" ? `${formatted} ${currency}/mo` : `${formatted} ${currency}`;
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
