# Putting Fork & Flame online

Three free services, one for each part:

| Part | Service | What it gives |
|---|---|---|
| Database | **MongoDB Atlas** (M0 free) | an online MongoDB |
| Backend (`backend/`) | **Render** (free web service) | `https://<name>.onrender.com` |
| Website (`swati/`) | **Vercel** (free) | `https://<name>.vercel.app` — the link you share |

The website calls `/api/...` on its own address, and Vercel forwards those calls to Render
(`swati/vercel.json`). So the browser never needs CORS settings and the code needs no changes.

Do the steps **in this order**. Push your latest code to GitHub first (`git push origin main`).

---

## 1. Database — MongoDB Atlas

1. https://cloud.mongodb.com → your project → your cluster (already created).
2. **Database Access** → user `swatikeshari` → **Edit** → **Edit Password** → set a password
   with only letters and numbers → **Update User**.
3. **Network Access** → **Add IP Address** → **Allow access from anywhere** (`0.0.0.0/0`) → Confirm.
   (Render's address changes, so it must be allowed from anywhere.)
4. **Connect** → **Drivers** → copy the string and make it look like:
   ```
   mongodb+srv://swatikeshari:<password>@cluster0.up9kohh.mongodb.net/fork-flame?retryWrites=true&w=majority
   ```
   Keep it private — it contains the password.
5. Optional, to copy your local data (restaurants, menus, admin) to Atlas, run on your laptop
   (MongoDB tools must be installed):
   ```bash
   mongodump --db fork-flame --out ~/ff-backup
   mongorestore --uri "<the Atlas string from step 4>" --nsInclude 'fork-flame.*' ~/ff-backup
   ```
   Or start fresh: put the Atlas string in `backend/.env` as `MONGO_URI`, then run
   `npm run seed -- 28.6692 77.4538`, `npm run seed-coupons` and
   `npm run create-admin -- you@example.com YourPassword` in `backend/`.

## 2. Backend — Render

1. https://render.com → sign in with GitHub → **New** → **Blueprint** → choose the
   `Flok-Flame` repository. Render reads `render.yaml` and creates `fork-flame-backend`.
2. It asks for the secret values:
   - `MONGO_URI` → the Atlas string from step 1.4
   - `CLIENT_URL` → leave empty for now (you get it in step 3), then come back
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` → from your `backend/.env` (or leave empty = Cash on Delivery only)
   - `SMTP_USER`, `SMTP_PASS` → Gmail + App Password (see below), or leave empty
   (`JWT_SECRET` is generated automatically.)
3. Wait for **Live**, then open `https://<your-service>.onrender.com/api/health` → should show `{"status":"ok"}`.

> Free Render services sleep after 15 minutes without visitors; the first visit then takes ~30–60 s.
> Uploaded dish photos are stored on the server's disk, which Render's free plan **wipes on every
> restart/deploy** — re-upload them, or use image URLs (e.g. from Cloudinary) in the admin panel.

## 3. Website — Vercel

1. Open `swati/vercel.json` and replace both `YOUR-BACKEND.onrender.com` with your Render
   address from step 2.3. Commit and push.
2. https://vercel.com → sign in with GitHub → **Add New → Project** → import `Flok-Flame`.
3. **Root Directory** → `swati`. Framework: **Vite** (detected). Click **Deploy**.
4. You get `https://<name>.vercel.app` — that's the site. 🎉
5. Back on Render → `fork-flame-backend` → **Environment** → set `CLIENT_URL` to that Vercel
   address (used in email links) → **Save**.

## 4. After it is online

- Admin panel: `https://<name>.vercel.app/owner`. Log in with the admin you created; **use a strong password**.
- Razorpay: test keys keep working online. For real money, activate your Razorpay account (KYC +
  add the Vercel website) and replace the keys with `rzp_live_...` ones on Render.
- Every `git push` redeploys both Render and Vercel automatically.

## Email (optional) — Gmail

1. Google Account → **Security** → turn on **2-Step Verification**.
2. https://myaccount.google.com/apppasswords → create one called "Fork & Flame" → copy the
   16-letter password.
3. Put `SMTP_USER=<your gmail>` and `SMTP_PASS=<the 16 letters, no spaces>` in `backend/.env`
   (laptop) and in Render's Environment (online).

Without these, emails are only printed in the backend terminal: `[email not sent - SMTP not set up]`.
