# Running Fully Locally — No Supabase Cloud, No Vercel

You can run the exact same database engine Supabase uses (Postgres + Auth + Storage +
Realtime) entirely on your PC via Docker. This is the official "local Supabase" dev
environment, not a workaround — same schema, same code, same admin panel. When you're
ready to go live later, you just point the same project at the cloud instead.

## 1. Install Docker Desktop
Local Supabase runs its services as Docker containers.
- Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- Install it, then **open Docker Desktop once** and leave it running in the background
  (Windows: check it's running in the system tray)

## 2. Install Node.js (if you haven't yet)
- [nodejs.org](https://nodejs.org) → LTS version → install
- Verify: `node -v`

## 3. Install the Supabase CLI
Open a terminal and run:
```
npm install -g supabase
```
Verify: `supabase --version`

## 4. Extract the project and initialize local Supabase
Extract `ebd-website.zip`, then in a terminal:
```
cd path/to/ebd-website
supabase init
```
This creates a `supabase/` folder inside your project — that's normal, leave it as is.

## 5. Start the local Supabase stack
```
supabase start
```
First run downloads the Docker images (a few minutes, one-time). When it's done, it prints
something like:
```
API URL: http://127.0.0.1:54321
GraphQL URL: http://127.0.0.1:54321/graphql/v1
Studio URL: http://127.0.0.1:54323
anon key: eyJhbGciOiJIUzI1NiIs...
service_role key: eyJhbGciOiJIUzI1NiIs...
```
**Keep this output visible** — you'll need the API URL and anon key in step 8.
(If you ever lose it, run `supabase status` to print it again.)

## 6. Open Studio and run the schema
- Go to the **Studio URL** printed above (usually `http://127.0.0.1:54323`) — this is a
  full local copy of the Supabase dashboard, running on your machine
- Open **SQL Editor**, and run each file from `ebd-schema/` **in this exact order**,
  pasting the full contents and clicking Run:
  ```
  01_schema_core.sql
  02_schema_orders.sql
  03_functions_triggers.sql
  04_views_reports.sql
  05_rpc_reports.sql
  06_rls_policies.sql
  07_place_order_rpc.sql
  08_place_manual_order_rpc.sql
  ```

## 7. Create your admin login (locally)
- In local Studio → **Authentication → Users → Add User** → enter an email + password
- Copy that user's **UUID**
- Back in **SQL Editor**, run:
  ```sql
  insert into admin_users (auth_user_id, name, email, role)
  values ('paste-the-uuid-here', 'Your Name', 'you@example.com', 'super_admin');
  ```

## 8. Point the website at your local stack
In the `ebd-website` folder, copy `.env.local.example` to `.env.local` and fill in the
**local** values from step 5 (not a supabase.co URL):
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon key printed by supabase start>
```

## 9. Install and run the website
```
npm install
npm run dev
```
- Storefront: **http://localhost:3000**
- Admin panel: **http://localhost:3000/admin/login**

Everything — orders, stock, invoices, notifications — now lives in a Postgres database
running in Docker on your own PC. Nothing leaves your machine.

## Day-to-day after this

- Docker Desktop must be running whenever you want to use the site
- If you restart your PC, just run `supabase start` again from the project folder before `npm run dev`
- To stop everything cleanly: `supabase stop`
- Your data persists between `supabase stop` / `supabase start` cycles — it's only wiped if
  you run `supabase db reset`

## When you're ready to add the cloud (later, whenever you want)

You won't rebuild anything. You'll:
1. Create a free project at [supabase.com](https://supabase.com)
2. Run the same 8 SQL files there (this time in the cloud SQL Editor)
3. Swap `.env.local` to the cloud Project URL + anon key
4. Push the code to GitHub → import into Vercel → add the same two env vars → deploy

The local setup and the cloud setup use the exact same code and schema — switching is just
changing two environment variable values.
