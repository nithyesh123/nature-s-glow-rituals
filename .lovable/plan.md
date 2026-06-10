
# PraKruthi Vanam — Full E-commerce Build Plan

Building on the existing forest-themed site, here is how I'll turn it into a complete, working store for urban women (25–45).

## 1. Enable Lovable Cloud (backend)
Needed for user accounts, product catalog, orders, reviews, and storing customer addresses. One click to enable — no external accounts.

## 2. Database tables
- **profiles** — name, phone, default address (auto-created on signup)
- **products** — id, name, type (oil/paste), price, image, tagline, ingredients[], stock
- **orders** — id, user_id, items (jsonb), subtotal, discount, total, status (placed → packed → shipped → delivered), payment_method, payment_id, shipping_address, created_at
- **reviews** — id, product_id, user_id, rating (1–5), comment, created_at
- **user_roles** — for admin access (separate table, per security best practice)

All tables with RLS: users see/edit their own data; products and reviews publicly readable.

## 3. Authentication
- Email + password sign up / sign in (with leaked-password protection)
- Google sign-in (one-click)
- "My Account" page: profile, address, order history
- Protected routes under `/account/*`

## 4. Pages / Routes
- `/` — Home (existing hero + featured products)
- `/products` — Full catalog with filter (Hair Oils / Face Pastes)
- `/products/$id` — Product detail with full ingredient list, reviews, add to cart, star-rating form (signed-in users only)
- `/cart` — Cart with quantity controls, SBI 10% discount auto-applied if SBI selected
- `/checkout` — Address form + payment method (Card / UPI), SBI card toggle, Razorpay button
- `/account` — Profile + order list
- `/account/orders/$id` — Order tracking with status timeline (Placed → Packed → Shipped → Delivered)
- `/auth` — Sign in / Sign up
- `/admin` — Simple admin to update order status (admin role only)

## 5. Payments — Razorpay
Razorpay handles UPI (GPay, PhonePe, Paytm, BHIM), all cards, net banking, and supports SBI card discount logic.
You'll need to provide two keys from your Razorpay dashboard:
- `RAZORPAY_KEY_ID` (public)
- `RAZORPAY_KEY_SECRET` (private)

I'll store them securely as secrets. SBI 10% discount is applied on the server before creating the Razorpay order (so it can't be tampered with).

Server functions for:
- `createRazorpayOrder` — creates order, applies SBI discount if SBI card
- `verifyRazorpayPayment` — verifies signature, marks order as paid
- Webhook at `/api/public/razorpay-webhook` for async status updates

## 6. WhatsApp chat support
Floating button bottom-right opening `https://wa.me/<your-number>?text=Hi,%20I%20need%20help%20with%20PraKruthi%20Vanam`. Persistent across all pages.

## 7. Reviews & ratings
- Star rating + comment form on product page (signed-in users only, one review per product per user)
- Average rating + count shown on product cards and detail page

## 8. Cart state
Cart stored in localStorage (works for guests), synced to user on sign-in. Keeps current single-page cart approach but proper quantity logic.

## 9. Design (keep current direction)
Forest/nature aesthetic, glass cards, Cormorant Garamond + Nunito Sans. Extend with: product detail layout, account dashboard, order timeline, review stars (gold leaf icons), checkout steps.

---

## What I need from you before/while I build

1. **WhatsApp number** (with country code, e.g. `+91 98765 43210`) — for the support button.
2. **Razorpay keys** — I'll ask securely once Cloud is enabled. If you don't have a Razorpay account yet, sign up free at razorpay.com (takes ~5 min, test keys work immediately, live keys after KYC).
3. **Your name / business email** for the first admin account (so you can manage orders).

---

## Build order
1. Enable Cloud → create tables → seed products
2. Auth (email + Google) + account pages
3. Products catalog + detail + reviews
4. Cart + checkout flow
5. Razorpay integration + SBI discount logic
6. Order tracking + admin panel
7. WhatsApp button + polish

Approve this plan and I'll start with steps 1–2 right away. You can drop your WhatsApp number any time before step 7.
