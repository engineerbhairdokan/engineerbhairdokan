# Engineer Bhai'r Dokan — Storefront + Admin Panel

Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase. Connects to the database schema in `ebd-schema/`.

## What's built

### Customer Storefront
- **Home** — hero banner slider, category pills, featured / new arrivals / best sellers
- **All Products** (`/products`) — search, sort, pagination · **Category pages** (`/categories/[slug]`)
- **Product page** (`/products/[slug]`) — gallery, live discount pricing, funnel-style order form
  (name, phone, district, address, quantity, notes) with live smart delivery pricing and
  cash-on-delivery checkout via the atomic `place_order()` database function
- WhatsApp button, social links, contact info — all pulled from the database, not hardcoded

### Admin Panel (`/admin`)
- **Login** (`/admin/login`) — Supabase Auth email/password, protected by middleware + an
  `admin_users.is_active` check in the layout
- **Dashboard** (`/admin`) — today's orders/revenue, all-time profit & loss, stock value,
  recent orders, low-stock list — all read straight from the SQL views, no frontend math
- **Products** — list, add, edit, delete; full cost breakdown (purchase/shipping/packaging/
  advertising/courier/other) with **live total cost, gross profit, and profit % as you type**;
  multiple images (paste Supabase Storage URLs); discount scheduling
- **Categories** — add, toggle active, delete
- **Orders** — filter by status/source, search by order#/name/phone; detail page with full
  item breakdown, status workflow (confirming auto-deducts stock, returning/cancelling
  auto-restocks — enforced by the database trigger, not the UI), courier assignment +
  tracking number, and a printable invoice view
- **New Manual Order** — for Facebook/Messenger/WhatsApp/phone/walk-in orders, multi-item,
  live subtotal, goes through `place_manual_order()` (see `ebd-schema/08_place_manual_order_rpc.sql`)
- **Inventory** — stock levels with quick +/- adjustment (fully audited via `stock_history`)
  and a recent-movements log
- **Couriers** — name, merchant code, per-courier inside/outside Dhaka charges, phone
- **Expenses** / **Investments** — categorized entries, running totals, feed straight into
  the profit & loss numbers
- **Banners** — add/remove, toggle active, shown live on the homepage
- **Reports** — date-ranged profit & loss, a sales-by-day chart, orders-by-source, category
  profit, all-time best sellers, CSV export
- **Notifications** — live list (Supabase Realtime) of new orders, low/out-of-stock alerts;
  mark read individually or all at once

## Not built yet (separate follow-ups)

- Android admin app (Flutter)
- Push notifications to a phone (FCM) — the `notifications` table already fills up correctly;
  wiring FCM just means reading that table and sending a push, which the Flutter app step covers
- Drag-and-drop image upload (currently: upload to Supabase Storage yourself, paste the URL)
- QR code / barcode on invoices

## Setup

1. **Deploy the database** — run the SQL files in `ebd-schema/` against your Supabase project,
   in order (see that folder's README), including the two RPC files added for the admin panel:
   `07_place_order_rpc.sql` and `08_place_manual_order_rpc.sql`.
2. **Create your first admin login:**
   - In Supabase → Authentication → Users → **Add user**, create yourself an email + password
   - In SQL Editor, run:
     ```sql
     insert into admin_users (auth_user_id, name, email, role)
     values ('<the auth user''s UUID from the Users table>', 'Your Name', 'you@example.com', 'super_admin');
     ```
3. Add starter data: a category, a product or two, a banner, and update `contact_information`
   (row `id = 1` already exists).
4. Copy `.env.local.example` to `.env.local` and fill in your Supabase URL + anon key
   (Project Settings → API).
5. Install and run:
   ```
   npm install
   npm run dev
   ```
   Storefront: http://localhost:3000 · Admin: http://localhost:3000/admin/login
6. **Deploy to Vercel (free)**: push to GitHub → import in Vercel → add the same two env vars
   → deploy.

## Product & banner images

Create three public Supabase Storage buckets: `products`, `banners`, `logo`. Upload files there,
copy the public URL, paste it into the relevant admin form. `next.config.mjs` already allows any
`*.supabase.co` image domain.

## Next step

The **Flutter Android admin app** connects to this same Supabase project and mirrors these same
modules for on-the-go management, plus FCM push notifications sourced from the `notifications`
table this panel already writes to.
