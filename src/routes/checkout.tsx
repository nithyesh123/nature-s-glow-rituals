import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/site-layout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout")({
  head: () => ({ meta: [{ title: "Checkout | PraKruthi Vanam" }] }),
  component: () => (
    <SiteLayout>
      <section className="mx-auto max-w-2xl px-6 py-16 text-center">
        <h1 className="font-display text-4xl text-foreground">Checkout</h1>
        <p className="mt-4 text-muted-foreground">
          Razorpay payment integration is ready to wire up. To enable live UPI &amp; card
          payments (with the SBI 10% discount), please share your Razorpay <b>Key ID</b> and
          <b> Key Secret</b> from razorpay.com → Settings → API Keys.
        </p>
        <Button asChild className="mt-8 bg-leaf text-primary-foreground hover:bg-leaf/90">
          <Link to="/cart">Back to Basket</Link>
        </Button>
      </section>
    </SiteLayout>
  ),
});
