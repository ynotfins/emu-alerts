# Project Memory

Technical details and implementation notes for the EMU Alerts system.

## Cloud Function: ingestBNN

### Endpoint Contract
- URL: `https://us-central1-emu-incidents.cloudfunctions.net/ingestBNN`
- Method: POST
- Auth: `X-Ingest-Token` header (secret in Firebase)
- CORS: Enabled

### Request Format
```json
{
  "appName": "BNN",
  "message": "STATE | COUNTY | CITY | TYPE | ADDRESS | MESSAGE | #ID",
  "source": "BNN",
  "address": "(optional override)",
  "lat": 41.123,
  "lng": -73.456
}
```

### Parsing Rules
1. Message field priority: `message` → `text` → `lastMessage`
2. Strip prefixes: `U/D`, `Update`, `New Incident`, `New Media`
3. Required format: 6+ pipe-delimited fields
4. Incident ID extraction:
   - From trailing `#123456` in message
   - Fallback to synthetic ID from location+type

### Firestore Writes

#### alerts/{auto-id}
```typescript
{
  ts: serverTimestamp(),
  reportedAt: Timestamp | null,
  audience: 'employee',
  source: 'BNN',
  stage: 'new' | 'update',
  state: string,
  county: string,
  city: string,
  address: string | null,
  alertType: string,
  alertMessage: string,
  incidentId: string,
  lat: number | null,
  lng: number | null,
  rawText: string
}
```

#### incidents/{incidentId}
```typescript
{
  firstSeenAt: serverTimestamp(), // new only
  lastSeenAt: serverTimestamp(),  // updates only
  lastTs: serverTimestamp(),
  lastMessage: string,
  lastType: string,
  state: string,
  county: string,
  city: string,
  address: string | null,
  lat: number | null,
  lng: number | null,
  source: 'BNN',
  updateCount: increment(1)
}
```

#### incidents/{incidentId}/updates/{auto-id}
```typescript
{
  ts: serverTimestamp(),
  reportedAt: Timestamp | null,
  stage: 'new' | 'update',
  message: string,
  title: string | null,
  address: string | null,
  lat: number | null,
  lng: number | null,
  source: 'BNN'
}
```

## Android App

### Activities
- `MainActivity`: Live alerts feed
  - Firestore query: `alerts` ordered by `ts` DESC, limit 200
  - ViewBinding: `ActivityMainBinding`
  - Menu items:
    - Test Crash (`action_test_crash`): Triggers Crashlytics test
    - Refresh (`action_refresh`): Present in XML but handler not implemented
  - Empty state via `empty_state.xml`

- `AlertDetailsActivity`: Incident details
  - Loads `incidents/{id}`
  - Shows location, type, message, timestamps
  - Updates count with plural string

### Key Files
- `Alert.kt`: Data class for list items
- `AlertsAdapter.kt`: RecyclerView adapter
- `App.kt`: Firebase initialization
- `activity_main.xml`: Home screen layout
- `activity_alert_details.xml`: Details screen layout
- `item_alert.xml`: List item template
- `menu_main.xml`: Options menu

### Firebase Config
- `google-services.json` in `android-app/app/`
- Package name must be `com.example.coreapp`
- Debug vs Release:
  - Debug: Crashlytics disabled
  - Release: Mapping file uploads enabled

## Firestore Security Rules

```javascript
// Base auth check
function isEmployee() {
  return request.auth != null && 
    (request.auth.token.role == 'employee' || request.auth.token.role == 'manager');
}

// Collections access
match /incidents/{id} {
  allow read: if isEmployee();
  allow write: if false;  // Functions only
  match /updates/{doc} {
    allow read: if isEmployee();
    allow write: if false;
  }
}

match /alerts/{doc} {
  allow read: if isEmployee();
  allow write: if false;
}

match /userStatus/{uid} {
  allow read: if request.auth?.token.role == 'manager';
  allow write: if request.auth?.uid == uid;
}
```

## Secrets & Config

### X-Ingest-Token
- Production: Stored as Firebase Functions secret
- Development: Available in `link.env` (gitignored)
- Current value in Functions secret (v3)
- Required for ingestBNN function
- Rotation: Update both Functions secret and link.env

### Firebase Config
- Project: emu-incidents
- Android app obtains config via `google-services.json`
- Functions use admin SDK credentials

## Known Gaps & Future Work

- [ ] Hide incident ID on list view
- [ ] Add color coding by update count
- [ ] Harden Firestore rules beyond basic role check
- [ ] Add media section to details page
- [ ] Document MacroDroid notification mapping
- [ ] Implement Refresh menu item handler
- [ ] Add loading state during Firestore queries
- [ ] Add error handling UI for Firestore failures

## Test Commands

### Post New Incident
```bash
curl -i -X POST \\
  https://us-central1-emu-incidents.cloudfunctions.net/ingestBNN \\
  -H "Content-Type: application/json" \\
  -H "X-Ingest-Token: $TOKEN" \\
  -d '{
    "appName": "BNN",
    "message": "NY | Dutchess | Poughkeepsie | Working Fire | 123 Main St | Initial report of smoke | #12345",
    "source": "BNN"
  }'
```

### Post Update
```bash
curl -i -X POST \\
  https://us-central1-emu-incidents.cloudfunctions.net/ingestBNN \\
  -H "Content-Type: application/json" \\
  -H "X-Ingest-Token: $TOKEN" \\
  -d '{
    "appName": "BNN",
    "message": "NY | Dutchess | Poughkeepsie | Working Fire | 123 Main St | Fire on second floor, all hands working | #12345",
    "source": "BNN"
  }'
```

## Next Milestone

Priority tasks:
- [ ] Add Firebase Auth sign-in UI
- [ ] Set up CI/CD for Android app
- [ ] Implement push notifications
- [ ] Add incident search/filter
- [ ] Create admin dashboard
- [ ] Add unit tests for parsing logic
- [ ] Document MacroDroid setup
- [ ] Create production deployment guide
