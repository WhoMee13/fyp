# Google Sign-In Setup Guide

This project uses **Google Identity Services** (One Tap / Sign-In button). The frontend receives a Google ID token; the backend verifies it and issues your existing JWT cookie.

---

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (or select an existing one).
3. Go to **APIs & Services → OAuth consent screen**.
   - User type: **External** (for testing) or **Internal** (Google Workspace only).
   - Fill app name, support email, and developer contact.
   - Scopes: default `email`, `profile`, `openid` are enough (added automatically by the sign-in library).
   - Add test users if the app is in **Testing** mode.

4. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**.
   - Application type: **Web application**
   - Name: e.g. `PropertyRental Web`

### Authorized JavaScript origins

Add every URL where the React app runs:

| Environment | Example |
|-------------|---------|
| Local Vite | `http://localhost:5173` |
| Local (if using port 3000) | `http://localhost:3000` |
| Production | `https://your-domain.com` |

### Authorized redirect URIs

For this implementation (**ID token / popup flow**), redirect URIs are **not required** for the sign-in button. You can leave redirect URIs empty or add your app origin for future OAuth redirect flows.

5. Copy the **Client ID** (ends with `.apps.googleusercontent.com`).

---

## 2. Environment variables

### Backend (`backend/.env`)

```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
FRONTEND_URL=http://localhost:5173
```

`GOOGLE_CLIENT_ID` must match the frontend value exactly.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

Restart both servers after changing `.env` files.

---

## 3. Database migration

New fields: `google_id`, `auth_provider`, optional `password` and `phone`.

```bash
cd backend
pnpm prisma migrate deploy
# or during development:
pnpm prisma migrate dev
pnpm prisma generate
```

---

## 4. CORS

`FRONTEND_URL` in the backend must match the browser origin (scheme + host + port), e.g. `http://localhost:5173`, because cookies are sent with `credentials: true`.

---

## 5. How it works in the app

| Step | What happens |
|------|----------------|
| 1 | User clicks **Sign in with Google** on Login or Register |
| 2 | Google returns an ID token to the browser |
| 3 | Frontend `POST /api/auth/google` with `{ credential }` |
| 4 | Backend verifies token with `google-auth-library` |
| 5 | User is created or linked; JWT cookie is set |
| 6 | Profile shows sign-in method; Google-only users can set a password |

### Account linking

- New Google email → new user (`authProvider: GOOGLE`, no password).
- Existing **email/password** user, same email → links `googleId`, `authProvider: BOTH` (both sign-in methods work).
- Google-only user trying email register → error: use Google sign-in.

---

## 6. Files touched

**Backend**

- `prisma/schema.prisma` — `googleId`, `authProvider`, optional `password`/`phone`
- `src/controllers/auth.controller.ts` — `googleAuth`, login/register guards
- `src/controllers/user.controller.ts` — profile email rules, set-password for Google users
- `src/routes/auth.routes.ts` — `POST /google`
- `src/utils/google.util.ts`, `src/utils/auth.util.ts`

**Frontend**

- `src/components/GoogleLoginButton.tsx`, `AuthDivider.tsx`
- `src/context/AuthContext.tsx` — `loginWithGoogle`
- `src/App.tsx` — `GoogleOAuthProvider`
- `src/pages/Login.tsx`, `Register.tsx`, `Profile.tsx`

---

## 7. Production checklist

- [ ] OAuth consent screen **Published** (or test users added while Testing).
- [ ] Production origin added under **Authorized JavaScript origins**.
- [ ] `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID` set in production env.
- [ ] `FRONTEND_URL` set to production frontend URL.
- [ ] `NODE_ENV=production` (secure cookies).
- [ ] HTTPS on both frontend and API.

---

## 8. Troubleshooting

| Issue | Fix |
|-------|-----|
| `origin_mismatch` / `idpiframe_initialization_failed` | Add exact browser URL to **Authorized JavaScript origins** |
| Google button missing | Set `VITE_GOOGLE_CLIENT_ID` and restart Vite |
| `Google login is not configured` | Set `GOOGLE_CLIENT_ID` in backend `.env` |
| Cookie not set after login | Align `FRONTEND_URL` with Vite port; use `withCredentials: true` (already configured) |
| `403 access_denied` (Testing) | Add your Gmail under OAuth consent screen → Test users |

---

## 9. Quick test

1. Run migration and start backend + frontend.
2. Open `/login` while logged out.
3. Click **Sign in with Google**.
4. Open **Profile** — should show **Google** as sign-in method.
5. Set a password (optional) — method becomes **Google + password**.
