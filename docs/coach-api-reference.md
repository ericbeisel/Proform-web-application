# Coach Flow — API Reference
> For mobile app developers. All APIs are REST/JSON unless noted.

---

## Base URL
```
https://api.paxlete.com
```

## Authentication
All endpoints require a Bearer token in the header:
```
Authorization: Bearer <token>
```

---

## 1. GET /coach-teams

**Used in:** Coach Dashboard — loaded on screen open  
**Trigger:** Every time coach opens the dashboard  
**Purpose:** Load all teams created by the authenticated coach. Results are shown as team cards.

**Response**
```json
{
  "data": [
    {
      "id": 49,
      "name": "aaryas team",
      "logo": "https://s3.../logo.png",
      "school": "aayas org",
      "organization_type": "High School Gym",
      "owner_name": "aarya potdar",
      "unique_code": "iGykLP",
      "invite_link": "https://www.proformapp.com/join-team/49/iGykLP",
      "_count": { "teamMembers": 1 }
    }
  ]
}
```
> `tagged_players_count` maps from `_count.teamMembers`

---

## 2. POST /coach-team

**Used in:** Coach Dashboard → Create Team modal → "Create Team" button  
**Trigger:** Coach fills team name (+ optional logo) and submits  
**Purpose:** Create a new team under the coach's account

**Request** — `multipart/form-data`
| Field | Type | Required |
|-------|------|----------|
| name | string | ✅ |
| logo | file | ❌ |
| owner_name | string | ❌ |

**Success:** `201`  
**Error:** `400` — `"You have reached the maximum number of teams allowed for your plan (X teams)."`

---

## 3. DELETE /coach-team

**Used in:** Coach Dashboard → trash icon on a team card  
**Trigger:** Coach taps delete on a team  
**Purpose:** Permanently delete a team

**Query Params**
```
?id=49
```
**Success:** `200 { "message": "Team deleted" }`

---

## 4. GET /institution-details

**Used in:**
- Coach Dashboard — on screen open (checks if org is already set up)
- Admin Details form — on form open (pre-fills existing org data)

**Trigger:** Auto on dashboard load; auto when coach opens the org setup form  
**Purpose:** Fetch the coach's organization profile. If `404`, org hasn't been set up yet.

**Success `200`**
```json
{
  "message": "Institution details retrieved successfully",
  "data": {
    "id": 1,
    "title": "aayas org",
    "mascot": "https://s3.../logo.jpg",
    "type": "High School Gym",
    "email": "coach@org.com",
    "phone": "7499939057",
    "address": "satara",
    "country": "101",
    "state": "22",
    "city": "2791",
    "max_coaches": 3,
    "sponsored": false
  }
}
```
**`404`** — org not set up yet. Show the org setup form instead of skipping to team creation.

---

## 5. POST /institution-details

**Used in:** Admin Details form → "Next" button  
**Trigger:** Coach fills org name, type, email, phone, address, country/state/city and taps Next  
**Purpose:** Create or update the coach's organization profile. After success, open Create Team form.

**Request Body**
```json
{
  "title": "aayas org",
  "mascot": "",
  "type": "High School Gym",
  "email": "coach@org.com",
  "phone": "7499939057",
  "address": "satara",
  "country": "101",
  "state": "22",
  "city": "2791",
  "maxCoaches": 3,
  "sponsored": false
}
```
> `country`, `state`, `city` are **numeric IDs** from `/api/country`, `/api/state`, `/api/cities`

**Success:** `201`

---

## 6. GET /plan-details

**Used in:** Use Code screen → code input field (auto-validates as user types)  
**Trigger:** Fires 500ms after user stops typing, when code is 6+ characters  
**Purpose:** Validate whether the code exists before activating. Show plan name on success, error on failure.

**Query Params**
```
?code=ABC123    (omit to get all plans)
```

**`200`** — code is valid, returns plan details (show plan name to user)  
**`404`** — `"Plan code not found"` — code is invalid or already used (disable Submit button)

---

## 7. POST /activate-plan

**Used in:** Use Code screen → "Submit & Activate" button  
**Trigger:** Coach enters a valid code and taps Submit  
**Purpose:** Activate the subscription plan. After success, unlock the "Create Team" button.

**Request Body**
```json
{
  "userId": 4,
  "code": "ABC123"
}
```
**`201`** — plan activated  
**`400`** — code already used or user already has an active plan

---

## 8. GET /team/remaining-limit

**Used in:** Coach Dashboard — on screen open  
**Trigger:** Auto on dashboard load  
**Purpose:**
- Show how many teams the coach can still create (e.g. "1 team left on BASIC PLAN")
- Detect if a plan is active → gate the "Create Team" button (`activePlan != null`)
- On subsequent logins, auto-unlock Create Team without re-entering the code

**Response**
```json
{
  "data": {
    "activePlan": "BASIC PLAN",
    "totalAllowed": 1,
    "createdCount": 1,
    "remaining": 0
  }
}
```
> If `activePlan` is `null` → no active plan, show "Use Code" prompt  
> Max players per team: **50**

---

## 9. GET /team/invite

**Used in:** Coach Dashboard → Invite modal (when coach taps the invite icon on a team card)  
**Trigger:** Coach opens the invite sheet for a specific team  
**Purpose:** Get the real-time invite link and unique code to share with players via QR code or URL

**Query Params**
```
?team_id=49
```

**Response**
```json
{
  "data": {
    "team_id": 49,
    "name": "aaryas team",
    "owner": "aarya potdar",
    "logo": "https://s3.../logo.png",
    "unique_code": "iGykLP",
    "invite_link": "https://www.proformapp.com/join-team/49/iGykLP",
    "institution": {
      "title": "aayas org",
      "type": "High School Gym",
      "mascot": ""
    }
  }
}
```
> Use `unique_code` to build the player invite deep link. If `unique_code` is null, parse the last segment of `invite_link` as the code.

---

## 10. POST /join-team

**Used in:** Player Invite Screen → "Accept" button  
**Trigger:** Player opens invite link/scans QR code, sees team info, taps Accept  
**Purpose:** Link the player to the team

**Request Body**
```json
{
  "team_id": 49,
  "unique_code": "iGykLP"
}
```
**`201`** — player joined successfully  
**`400`** — invalid code or team is full (max 50 players)

> The invite deep link carries `team_id`, `unique_code`, `team_name`, `org_name`, `owner_name` as query params to display team info on the invite screen before the player accepts.

---

## 11. GET /coach-team/players

**Used in:** Team Detail screen — player list section  
**Trigger:** Coach opens a specific team's detail page; also fires on search input (debounced)  
**Purpose:** Load all players tagged to a team, with search and pagination support

**Query Params**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| team_id | number | — | Filter by team (required for team detail screen) |
| search | string | — | Filter by player name or username |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response**
```json
{
  "data": [
    {
      "id": 12,
      "name": "John Doe",
      "username": "johndoe",
      "profile_picture": "https://s3.../pic.jpg",
      "score": "0/4",
      "completion_pct": 75
    }
  ],
  "total": 1
}
```

---

## Screen → API Map

| Screen | APIs Called |
|--------|------------|
| Coach Dashboard (open) | `GET /coach-teams`, `GET /institution-details`, `GET /team/remaining-limit` |
| Use Code screen | `GET /plan-details` (on type), `POST /activate-plan` (on submit) |
| Admin Details form | `GET /institution-details` (pre-fill), `POST /institution-details` (on Next) |
| Create Team form | `POST /coach-team` |
| Invite modal | `GET /team/invite` |
| Delete team | `DELETE /coach-team` |
| Team Detail screen | `GET /coach-team/players` |
| Player Invite screen | `POST /join-team` |

---

## New Coach Flow (Step by Step)

```
1. Open dashboard
   → GET /team/remaining-limit   (check if plan is active)

2. No plan → show "Use Code" prompt
   → GET /plan-details            (validate code as user types)
   → POST /activate-plan          (on submit)

3. Plan active → check org
   → GET /institution-details     (404 = no org yet)

4. No org → show Admin Details form
   → POST /institution-details    (on Next)

5. Org exists → show Create Team form
   → POST /coach-team

6. Team created → share invite
   → GET /team/invite             (get QR code + link)

7. Player receives link → opens Player Invite screen
   → POST /join-team              (on Accept)
```
