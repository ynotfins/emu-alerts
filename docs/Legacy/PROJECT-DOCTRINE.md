# EMU Alerts Project Doctrine

**Established:** January 2025  
**Scope:** Engineering patterns and architectural principles for EMU Alerts real-time emergency monitoring system

---

## 🏗️ **ARCHITECTURAL PRINCIPLES**

### **Multi-Platform Strategy = MANDATORY**

**PRINCIPLE**: Support multiple client platforms with shared backend infrastructure.

- **NATIVE ANDROID** (Kotlin): Primary production client with full feature set
- **REACT NATIVE/EXPO**: Alternative/development client for rapid iteration  
- **WEB HOSTING**: Static documentation and admin interfaces
- **FIREBASE FUNCTIONS**: Unified serverless backend for all platforms

**FORBIDDEN**: Platform-specific backend logic. All business logic lives in Firebase Functions.

### **Firebase-Centric Architecture = NON-NEGOTIABLE**

**STACK MANDATE**:
- **Firestore**: All persistent data storage with real-time listeners
- **Firebase Auth**: Authentication with custom role-based claims (`employee`, `manager`, `customer`)
- **Cloud Functions**: All server-side processing (TypeScript, Node.js 20)
- **Firebase Hosting**: Static web content and documentation
- **Crashlytics**: Crash reporting and application monitoring

**PRINCIPLE**: Leverage Firebase's real-time capabilities. Never poll when you can subscribe.

### **Hybrid Data Model = ESTABLISHED PATTERN**

**COLLECTIONS STRUCTURE**:
```
alerts/{auto-id}           # Flat chronological feed (200 limit)
incidents/{incidentId}     # Normalized incident snapshots  
incidents/{id}/updates/    # Historical update stream
userStatus/{uid}          # Live employee presence (future)
```

**RATIONALE**: Optimizes for both feed display (alerts) and detailed incident tracking (incidents).

---

## 🔒 **SECURITY & ACCESS CONTROL**

### **Role-Based Security = IMMUTABLE**

**CUSTOM CLAIMS ROLES**:
- `employee`: Read access to incidents and alerts
- `manager`: Employee permissions + user management + status visibility  
- `customer`: Future public-facing features (currently unused)

**FIRESTORE RULES PRINCIPLE**: 
- **READ**: Role-based access (`isEmployee()` function)
- **WRITE**: Cloud Functions only (`allow write: if false`)

**FORBIDDEN**: Direct client writes to Firestore. All mutations via authenticated Cloud Functions.

### **API Authentication = TOKEN-BASED**

**PATTERN**: `X-Ingest-Token` header for external data ingestion (BNN feeds)
- **DEVELOPMENT**: `link.env` (gitignored)
- **PRODUCTION**: Firebase Functions Secrets
- **ROTATION**: Update both simultaneously

---

## 📊 **DATA PATTERNS & PROCESSING**

### **BNN Message Parsing = STANDARDIZED**

**FORMAT**: `STATE | COUNTY | CITY | TYPE | ADDRESS | MESSAGE | #INCIDENT_ID`

**PROCESSING RULES**:
1. **Message field priority**: `message` → `text` → `lastMessage`
2. **Prefix stripping**: Remove `U/D`, `Update`, `New Incident`, `New Media`
3. **ID extraction**: Trailing `#12345` pattern, fallback to synthetic hash
4. **Synthetic ID**: SHA1 hash of `state|county|city|address|alertType` (16 chars)

**PRINCIPLE**: Deterministic incident deduplication. Same location + type = same incident.

### **Transaction-Safe Writes = MANDATORY**

**PATTERN**: Use Firestore transactions for race condition protection:
```typescript
await db.runTransaction(async (tx) => {
  const snap = await tx.get(incRef);
  if (!snap.exists) {
    stage = 'new';
    // First-time incident logic
  } else {
    stage = 'update'; 
    // Update existing incident
  }
});
```

**RATIONALE**: Prevents duplicate incident creation during concurrent writes.

---

## 🛠️ **DEVELOPMENT PATTERNS**

### **TypeScript Everywhere = NON-NEGOTIABLE**

**MANDATE**: 
- **Functions**: TypeScript with strict mode enabled
- **Mobile (Expo)**: TypeScript with proper interface definitions
- **Android**: Kotlin with explicit typing (equivalent philosophy)

**FORBIDDEN**: `any` types in production code. Define explicit interfaces for all data shapes.

### **Environment Variable Strategy = STANDARDIZED**

**DEVELOPMENT**: `link.env` (gitignored) with comprehensive documentation
**PRODUCTION**: Firebase Functions Secrets for sensitive values
**EXPO**: `EXPO_PUBLIC_*` prefix for client-side configuration

**SECURITY PRINCIPLE**: Secrets never committed. Use `.env.example` for documentation.

### **Command Execution Wrapper = MANDATORY**

**TOOL**: `scripts/exec.sh` for all operational commands
**FEATURES**:
- Full logging to timestamped files (`logs/`)
- Exit status preservation
- Timeout protection (30m default)
- Console output truncation (200 lines, 100KB max)

**USAGE**: `run <operation-name> <command...>`

### **Component Architecture = MODULAR**

**MOBILE PATTERNS**:
- **Custom hooks**: Data fetching and state management (`useIncidents`, `useChat`)
- **Memoized components**: Performance optimization (`memo()`, `useMemo()`)
- **Token-based theming**: Centralized design system (`theme/tokens.ts`)

**ANDROID PATTERNS**:
- **View Binding**: Type-safe view references (enabled in all modules)
- **Data classes**: Immutable model objects (`Alert.kt`)
- **Firestore listeners**: Real-time data binding with proper lifecycle management

---

## 🚀 **OPERATIONAL STANDARDS**

### **Error Handling & Monitoring = COMPREHENSIVE**

**CRASHLYTICS INTEGRATION**:
- Custom logging: `crashlytics.log("[Component] message")`
- Custom keys: `crashlytics.setCustomKey(key, value)`
- Exception tracking: Automatic crash reporting + manual `recordException()`

**ANDROID LOGGING**: Use specific tag prefixes (`MainActivity`, `AlertDetailsActivity`)

### **Build Configuration = PLATFORM-OPTIMIZED**

**ANDROID**:
- **Debug**: Crashlytics disabled, no obfuscation
- **Release**: ProGuard enabled, mapping file upload, Crashlytics enabled
- **SDK Targets**: API 24 minimum, API 34 target/compile

**FUNCTIONS**:
- **Runtime**: Node.js 20
- **Build**: TypeScript compilation to `lib/` directory
- **Deployment**: Specific function targeting (`--only functions:ingestBNN`)

### **Quality Gates = PRE-DEPLOYMENT**

**MANDATORY CHECKS**:
- TypeScript compilation without errors
- Android Lint and build verification  
- Function deployment test
- Firestore rules validation

---

## 🎯 **BUSINESS LOGIC PATTERNS**

### **Incident Lifecycle = STATE-DRIVEN**

**STAGES**:
- `new`: First time incident appears in system
- `update`: Additional information for existing incident

**STATE MANAGEMENT**:
- `firstSeenAt`: Set only on incident creation
- `lastSeenAt`: Updated on every update  
- `updateCount`: Incremented atomically
- `lastTs`, `lastMessage`, `lastType`: Latest information snapshot

### **Audience Targeting = ROLE-BASED**

**CURRENT**: `employee` audience for all incident data
**FUTURE**: `customer` audience for public safety information
**EXTENSIBILITY**: `both` audience for organization-wide announcements

---

## 📚 **DOCUMENTATION STANDARDS**

### **Endpoint Documentation = API-FIRST**

**REQUIREMENT**: All Cloud Functions must have:
- Request/response examples in `docs/MEMORY.md`
- curl commands with authentication
- Error response documentation

**TESTING DOCUMENTATION**: `docs/SEEDING.md` with realistic test payloads

### **Configuration Documentation = SECURITY-AWARE**

**PATTERN**: `link.env` includes:
- Comprehensive comments explaining each variable
- Security warnings for sensitive values
- Environment-specific usage instructions
- Future extensibility placeholders

---

## ⚡ **PERFORMANCE & RELIABILITY**

### **Real-Time Data Limits = SCALABILITY-CONSCIOUS**

**FIRESTORE QUERY LIMITS**:
- Alerts feed: 200 documents maximum
- Incidents list: 100 documents maximum  
- Update history: No limit (paginated in UI)

**RATIONALE**: Balance between performance and data completeness for emergency use case.

### **Offline Resilience = FUTURE-READY**

**CURRENT**: Firestore offline persistence enabled by default
**FUTURE**: Implement proper offline indicators and retry logic
**PRINCIPLE**: Emergency systems must degrade gracefully during network issues.

---

## 🔄 **EVOLUTION PRINCIPLES**

### **Core-First Development = DELIVERY-FOCUSED**

**MANDATE**: Stabilize core alert ingestion and display before adding features
**SEQUENCE**: Core functionality → Instrumentation → Optimization → New features

### **Backward Compatibility = MAINTAINED**

**API VERSIONING**: Maintain compatibility for BNN message format
**DATA MIGRATION**: Additive changes only; no breaking schema changes
**CLIENT SUPPORT**: Support multiple app versions during transition periods

---

This doctrine reflects the established patterns and architectural decisions already present in the EMU Alerts codebase. Future development should align with these principles to maintain consistency and reliability.
