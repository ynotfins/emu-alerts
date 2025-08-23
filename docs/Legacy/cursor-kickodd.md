Cursor: Build EMU Incidents Mobile (Android + iOS) — Apple-clean UI, Live Locations, Chat, Ratings
Who I am & how to help
I’m a beginner developer. Be my senior mentor: ship a working product while explaining steps in clear, short English. When a choice exists, recommend one approach and say why in 1–2 lines. If I’m missing a file/ID/secret, give exact click paths or commands.

Repo & references
Repo folder is open in Cursor: D:\github\EMU Alerts

Important backend files already here: functions/src/index.ts, firestore.rules, core.md

Design references (images): I will add these (or you can ask me to paste them in chat):

docs/design/home.png — Home list: 2-line rows (line 1 = local date/time, line 2 = message)

docs/design/details.png — Details: map header + history stream

(Optional) docs/design/team.png — Team map
Use the images to infer tokens (spacing grid, radii, typography scale). If images are not present, follow the style spec below.

Backend that’s live (don’t re-implement)
Firebase project: emu-incidents

Cloud Functions (deployed):

ingestBNN (Gen2, Node20): POST with X-Ingest-Token → writes to Firestore (incidents, updates, alerts)

setUserRole (Gen2): POST with Bearer ID token → sets { role } custom claim

setDefaultRole (Gen1, Node20): Auth trigger → default { role:'employee' }

Firestore writes (current shape):

incidents/{incidentId}: { lastTs, lastMessage, lastType, address?, lat?, lng?, state, county, city, stage, source, updateCount }

incidents/{incidentId}/updates/{updateId}: { ts, reportedAt?, message, title?, address?, lat?, lng?, source, stage }

alerts (flat feed, optional for UI)

Scope (Employee app first; Customer later)
A. Auth

Google + Email/Password sign-in.

After sign-in, call getIdTokenResult(true) and read role from custom claims. Block non-employees for now.

B. Home (2-line list)

Source: incidents ordered by lastTs desc, realtime onSnapshot.

Row design:

Line 1: local time from lastTs

Line 2: lastMessage

Tap → Details(id).

C. Details

Header: map preview when lat/lng; if only address, show “Open in Maps” button (deep link: Google Maps for Android; Apple Maps for iOS; fall back to Google).

Body: realtime history from incidents/{id}/updates ordered by ts asc. Compact items with timestamp + message.

Action: “I’m responding”

Writes incidents/{id}/responders/{uid}: { joinedAt, displayName, latestLat?, latestLng? }

Writes employees/{uid}: { activeIncidentId:id, lastLat, lastLng, updatedAt }

D. Nearest

Foreground location permission via Expo.

Compute Haversine distance to incidents with lat/lng; sort ascending; show distance badge; tap → Details.

E. Team map (live employee locations)

Read employees where { sharing == true }.

Show markers for employees with lastLat/lastLng; list underneath with name and “updatedAt n minutes ago.”

Profile toggle: “Share my location” → writes { sharing:boolean, lastLat, lastLng, updatedAt } to employees/{uid}; stop updates when off.

F. Chat

Global chat: chats/global/messages/{msgId}: { uid, displayName, text, createdAt, incidentId? }

Incident chat: incidents/{id}/chat/{msgId} with same shape.

Realtime list, basic composer, optimistic send; simple “create-only” permissions (no edits/deletes yet).

G. Ratings & comments per incident

incidents/{id}/feedback/{uid}: { stars: 1..5, comment?: string, createdAt, updatedAt }

One doc per user; upsert overwrites.

Show average rating (client-side), plus a few latest comments.

H. Apple-clean UI spec

Font: system SF (iOS) / system default (Android).

Type scale (base): 28 / 20 / 16 / 14 for title/section/body/caption; 1.3–1.4 line height.

Colors: light mode first, off-white surface; text #111, secondary #666; use system blue for primary action.

Spacing: 8-pt grid; cards with 12–16 padding; radius 16; soft shadow.

Rows: high contrast, two lines, no separators except subtle section dividers.

Map header: rounded corners, 200–260dp height; “Open in Maps” button when no lat/lng.

Firestore security rules (merge into firestore.rules)
Keep existing permissions for employees and add these collections:

rules
Copy
Edit
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthed() { return request.auth != null; }
    function isEmployee() { return isAuthed() && request.auth.token.role in ['employee','manager']; }
    function isSelf(uid) { return isAuthed() && request.auth.uid == uid; }

    match /incidents/{incidentId} {
      allow read: if isEmployee();
      allow write: if false;

      match /updates/{updateId} {
        allow read: if isEmployee();
        allow write: if false;
      }

      // Incident chat (create-only)
      match /chat/{msgId} {
        allow read: if isEmployee();
        allow create: if isEmployee()
          && request.resource.data.uid == request.auth.uid
          && request.resource.data.text is string
          && request.resource.data.createdAt is timestamp;
        allow update, delete: if false;
      }

      // Responders: employee can write own subdoc
      match /responders/{uid} {
        allow read: if isEmployee();
        allow write: if isSelf(uid);
      }

      // Feedback: one doc per user
      match /feedback/{uid} {
        allow read: if isEmployee();
        allow create, update: if isSelf(uid)
          && request.resource.data.stars is int
          && request.resource.data.stars >= 1
          && request.resource.data.stars <= 5
          && ( !('comment' in request.resource.data) || request.resource.data.comment is string )
          && request.resource.data.updatedAt is timestamp;
        allow delete: if false;
      }
    }

    // Global chat
    match /chats/global/messages/{msgId} {
      allow read: if isEmployee();
      allow create: if isEmployee()
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.text is string
        && request.resource.data.createdAt is timestamp;
      allow update, delete: if false;
    }

    // Employees presence/location
    match /employees/{uid} {
      allow read: if isEmployee();
      allow write: if isSelf(uid);
    }

    // Optional flat alerts
    match /alerts/{doc} {
      allow read: if isEmployee();
      allow write: if false;
    }
  }
}
If an index is needed, tell me the exact composite index JSON and add it to firestore.indexes.json.

Tech stack & structure (recommend then implement)
Framework: Expo + React Native + TypeScript

Navigation: @react-navigation/native (stack + tabs)

Firebase: modular v9 SDK; onSnapshot for realtime

Maps: react-native-maps (Expo config); Linking.openURL() for native map deep links

Location: expo-location (foreground only for now)

State: React Context + hooks (keep it light)

UI: minimal custom components; optional react-native-paper for a few primitives

Create this tree:

pgsql
Copy
Edit
apps/
  mobile-expo/
    app/
      sign-in.tsx
      home.tsx
      details.tsx
      nearest.tsx
      team.tsx
      profile.tsx
      chat-global.tsx
    src/
      firebase/
        init.ts
        auth.ts           # hook to read role from claims (getIdTokenResult)
      components/
        IncidentRow.tsx
        MapHeader.tsx
        ChatComposer.tsx
        Stars.tsx
      hooks/
        useIncidents.ts
        useIncidentUpdates.ts
        useNearest.ts
        useTeamPresence.ts
        useFeedback.ts
        useChat.ts
        useLocationShare.ts
      utils/
        time.ts          # formatLocal(ts)
        haversine.ts
        maps.ts          # url builders
      theme/tokens.ts    # spacing, radii, colors, type scale derived from images/spec
    app.config.ts
    package.json
    .env.example
docs/
  design/
    home.png
    details.png
    team.png
Env & config (Expo)
Create apps/mobile-expo/.env (I’ll paste values):

ini
Copy
Edit
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyCWX4L4y4Qi--ooSiklKBtoXpEJQice6mQ
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=emu-incidents.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=emu-incidents
EXPO_PUBLIC_FIREBASE_APP_ID=1:841200945180:web:08e09744b8f5b0f14bb7d9
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=841200945180
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=emu-incidents.appspot.com
Commit apps/mobile-expo/.env.example with placeholders; do not commit .env.

Tasks (do these in small PR-sized chunks)
Scaffold app in apps/mobile-expo (TypeScript), add dependencies, create firebase/init.ts using .env.

Auth & role hook: Sign-in screen (Google + Email/Password). After sign-in, fetch role claim; block non-employees.

Home screen: realtime incidents; 2-line rows; navigation to Details.

Details screen: map header; updates history; “Open in Maps”; “I’m responding” writes to responders and employees.

Nearest screen: location permission; distance calc; list sorted by distance.

Team screen: read employees where sharing==true; markers + list.

Profile screen: share location toggle; update my employees/{uid}.

Chat: global chat screen + incident chat tab; composer; realtime reads.

Ratings: star control + comment; upsert to feedback/{uid}; show average.

Polish: apply tokens for the Apple-clean look; add empty/error/loading states; basic accessibility.

DX: add README-mobile.md with Android/iOS run instructions; where to place google-services.json / GoogleService-Info.plist.

Acceptance (demo these)
Sign in/out; role loaded from claims.

Home updates live when we POST to ingestBNN.

Details shows history + map link; “I’m responding” writes correct docs.

Nearest sorts by distance.

Team map shows employees who share location.

Global chat & incident chat send/receive live.

Ratings save and average is shown.

Rules prevent non-employee access and writing other users’ docs.

Start by scanning this repo (core.md, firestore.rules, functions/src/index.ts) and the docs/design images (if present). Propose the exact file tree and dependency list, then scaffold the app and guide me through first run.