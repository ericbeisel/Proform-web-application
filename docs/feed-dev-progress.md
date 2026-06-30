# Feed Module — Dev Progress Notes
**Date:** 30 June 2026  
**Session:** Full-day build — Feed page, Profile, User Search  
**Developer:** attharvsabale  

---

## What Was Built / Fixed Today

### 1. Feed Page (`src/app/feed/main-feed/page.tsx`)

| Feature | Status | Notes |
|---|---|---|
| For You / Following tabs | ✅ Done | Fetches from `GET /feed?page=` and `GET /feed?page=&type=following` |
| Infinite scroll pagination | ✅ Done | IntersectionObserver, loads next page on scroll |
| Activity type filters (Workout, Cardio, Recovery, Hydration, Nutrition) | ✅ Done | Persisted in `localStorage`, synced to `GET/POST /feed/settings` |
| My Workouts toggle | ✅ Done | Filters feed to only current user's posts |
| Like / Unlike | ✅ Done | `GET /like-feed?id=` and `GET /unlike-feed?id=`, optimistic UI |
| Comments | ✅ Done (UI) | Multiline textarea, Cancel + Send buttons — **backend endpoint missing** (see Pending) |
| Share Session link | ✅ Done | Calls `POST /workouts/session/{id}/share-link`, falls back to client URL |
| Highlights strip | ✅ Done | Fetches from `GET /list-highlights`, grouped by user |
| Highlight viewer | ✅ Done | Progress bars, 5s auto-advance, pause-on-tap, description overlay |
| Upload Highlight | ✅ Done | Supports image + video + caption, `POST /create-highlight` |
| Workout session popup | ✅ Done | Fetches `getWorkoutSessionById`, `getWorkoutStats`, `getPowerSetLogs`, `getTrackingLogs` |
| Username click → public profile | ✅ Done | `router.push('/profile/{username}')` |
| Trending Today sidebar | ⏳ Deferred | Currently hardcoded top-3 array — backend has no trending endpoint yet |
| Suggested Athletes sidebar | ⏳ Deferred | Currently dummy `athlete_1/2/3` — backend has no suggested-users endpoint yet |
| Notification bell | ⏳ Pending | Button renders, no handler — needs notification count API |

---

### 2. Feed Detail Pages

| Page | Route | Status | API Connected |
|---|---|---|---|
| Cardio Session | `/feed/cardio-session` | ✅ Done | `GET /feed/{id}/details` — goal calories from `cardio_goal`, completion badge, like count |
| Recovery Details | `/feed/recovery-details` | ✅ Done | Data from URL params, completion badge, like count |
| Hydration Details | `/feed/hydration-details` | ✅ Done | Data from URL params, completion badge, like count |
| Nutrition Details | `/feed/nutrition-details` | ✅ Done | Data from URL params, completion badge, like count |

---

### 3. Feed Settings (`src/app/feed/settings/page.tsx`)

- Loads from `localStorage` first (instant render), then syncs from `GET /feed/settings`
- Save writes to `localStorage` + `POST /feed/settings`
- Filters: Workouts, Cardio Sessions, Recovery, Hydration, Nutrition
- Notification preferences per activity type: Email / Push / None

---

### 4. Public Profile Page (`src/app/profile/[username]/page.tsx`) — **New File**

- Dynamic route — accessible via `/profile/{username}`
- Calls `profileApi.getProfileByUsername(username)` + `profileApi.getSocialMedia(id)`
- Shows: avatar (initial fallback), name, @username, role badge, follow type
- Stats grid: Workouts, Followers, Strength, Wellness
- Competition lifts: Bench, Squat, Clean, Deadlift (only rendered if data exists)
- Social links as platform-coloured pills

---

### 5. Find Users (`src/app/profile/components/UserList/page.tsx`)

- **Bug fixed:** search was sending `&search=` but backend expects `&name=` → changed in `src/api/profile/route.ts:232`
- Follow / Unfollow calls `POST /follow-user` and `POST /unfollow-user`
- Infinite scroll for user list

---

## API Connection Status

### Connected ✅

| Endpoint | Used In |
|---|---|
| `GET /feed?page=` | Main feed (For You tab) |
| `GET /feed?page=&type=following` | Main feed (Following tab) |
| `GET /like-feed?id=` | Like action |
| `GET /unlike-feed?id=` | Unlike action |
| `GET /list-highlights?page=` | Highlights strip |
| `POST /create-highlight` | Upload highlight |
| `GET /view-highlight?id=` | Mark highlight viewed |
| `GET /feed/{id}/details` | Cardio session detail |
| `GET /feed/settings` | Feed settings load |
| `POST /feed/settings` | Feed settings save |
| `GET /user-search?name=&page=` | Find Users search |
| `POST /follow-user` | Follow action |
| `POST /unfollow-user` | Unfollow action |
| `GET /workouts/session/{id}` | Workout popup |
| `GET /workouts/session/{id}/stats` | Workout stats in popup |
| `GET /workouts/session/{id}/power-sets` | Power set logs |
| `GET /workouts/session/{id}/tracking` | Tracking logs |
| `POST /workouts/session/{id}/share-link` | Share session link |
| `GET /profile/{username}` | Public profile page |
| `GET /user/{id}/social-media` | Social links on profile |

### Pending / Not Yet Built on Backend ⚠️

| Endpoint (Expected) | Feature | Notes |
|---|---|---|
| `GET /feed/{id}/comments` | Load comments | Returns error — endpoint doesn't exist yet |
| `POST /feed/{id}/comments` | Post a comment | Returns error — endpoint doesn't exist yet |
| `GET /feed/trending` | Trending Today sidebar | No endpoint — currently hardcoded top-3 |
| `GET /suggested-users` | Suggested Athletes sidebar | No endpoint — currently dummy data |
| `GET /notifications` | Notification bell count | Bell renders but does nothing |

---

## Key Files Changed Today

```
src/
├── app/
│   ├── feed/
│   │   ├── main-feed/
│   │   │   ├── page.tsx                  ← Major changes (filters, popup, highlights, layout)
│   │   │   └── UploadHighlightModal.tsx  ← Added video + caption support
│   │   ├── settings/
│   │   │   └── page.tsx                  ← Connected to backend GET/POST /feed/settings
│   │   ├── cardio-session/
│   │   │   └── page.tsx                  ← Real goal values, completion badge
│   │   ├── recovery-details/
│   │   │   └── page.tsx                  ← Completion badge, like count
│   │   ├── hydration-details/
│   │   │   └── page.tsx                  ← Completion badge, like count
│   │   └── nutrition-details/
│   │       └── page.tsx                  ← Completion badge, like count (new page)
│   ├── profile/
│   │   ├── [username]/
│   │   │   └── page.tsx                  ← NEW — public profile dynamic route
│   │   └── components/
│   │       └── UserList/
│   │           └── page.tsx              ← Fixed search param bug
├── components/
│   └── FeedComments.tsx                  ← Multiline textarea, cancel/send, real API
└── api/
    ├── feed/route.ts                     ← Added getFeedDetails, getFeedSettings, saveFeedSettings
    ├── profile/route.ts                  ← Fixed searchUsers param (&name= not &search=)
    └── workouts/route.ts                 ← Added generateSessionShareLink
```

---

## Known Issues / Things to Fix Later

1. **Comments broken** — `GET/POST /feed/{id}/comments` returns server error. Backend endpoint needs to be created. Frontend code is ready and will work automatically once the endpoint is live.

2. **Trending Today** — Hardcoded 3 items. Backend needs a `GET /feed/trending` or similar endpoint. Agreed to defer.

3. **Suggested Athletes** — Hardcoded `athlete_1/2/3`. Backend needs a `GET /suggested-users` endpoint. Agreed to defer.

4. **Notification bell** — Renders in the header with a static red dot but has no onClick and no real count. Needs a notifications API.

5. **API console.log noise** — `src/api/feed/route.ts` has verbose request/response logging in the Axios interceptors (lines 156–196). Fine for development, remove before production deploy.

---

## How to Run

```bash
npm run dev
# App runs at http://localhost:3000
# Feed page: http://localhost:3000/feed/main-feed
# Find Users: http://localhost:3000/profile/components/UserList
# Feed Settings: http://localhost:3000/feed/settings
```

**Auth:** Login first at `/auth/login` — Bearer token is stored in localStorage and auto-attached by the Axios interceptor in `src/api/feed/route.ts`.

**API Base:** `https://api.paxlete.com` — set via `NEXT_PUBLIC_API_BASE_URL` in `.env`.
