# EMU Alerts Components Documentation

## Overview

This document provides detailed documentation for all React Native components, screens, hooks, and utilities in the EMU Alerts application.

## Table of Contents

1. [Screen Components](#screen-components)
2. [UI Components](#ui-components)
3. [Custom Hooks](#custom-hooks)
4. [Type Definitions](#type-definitions)
5. [Firebase Configuration](#firebase-configuration)

---

## Screen Components

### SignInScreen

**Location**: `src/screens/SignInScreen.tsx`

**Purpose**: Handles user authentication with email/password login.

**Props**:
```typescript
interface SignInScreenProps {
  navigation: any; // React Navigation prop
}
```

**Features**:
- Email/password input fields
- Loading states during authentication
- Error message display
- Auto-navigation on successful login
- Keyboard avoiding view for better UX

**Usage**:
```typescript
<Stack.Screen name="SignIn" component={SignInScreen} />
```

**Key Methods**:
- `handleSignIn()`: Processes login attempt
- `handleEmailChange()`: Updates email state and clears errors
- `handlePasswordChange()`: Updates password state and clears errors

---

### MainScreen

**Location**: `src/screens/MainScreen.tsx`

**Purpose**: Displays the main list of emergency alerts with filtering and search capabilities.

**Props**:
```typescript
interface MainScreenProps {
  navigation: any; // React Navigation prop
}
```

**Features**:
- Real-time alert list with pull-to-refresh
- Search and filter functionality
- Sign out option
- Test crash button (development)
- Optimized FlatList rendering
- Empty state handling

**Key Methods**:
- `handleAlertPress(alert)`: Navigates to alert details
- `handleSignOut()`: Signs out user
- `handleFilteredAlertsChange(alerts)`: Updates filtered results

**Optimization Features**:
```typescript
// FlatList optimizations
maxToRenderPerBatch={10}
windowSize={10}
removeClippedSubviews={true}
getItemLayout={(data, index) => ({
  length: 80,
  offset: 80 * index,
  index,
})}
```

---

### AlertDetailsScreen

**Location**: `src/screens/AlertDetailsScreen.tsx`

**Purpose**: Shows detailed information about a specific alert including all messages and location data.

**Props**:
```typescript
interface AlertDetailsScreenProps {
  navigation: any;
  route: {
    params: {
      incidentId: string;
    };
  };
}
```

**Features**:
- Incident header with alert type badge
- Location information with map button
- Chronological message timeline
- Loading and error states
- Auto-scroll to latest message

**Data Structure**:
```typescript
interface GroupedMessage {
  id: string;
  message: string;
  timestamp?: number;
  receivedAt?: string;
}
```

---

## UI Components

### AlertItem

**Location**: `src/components/AlertItem.tsx`

**Purpose**: Renders individual alert items in the main list.

**Props**:
```typescript
interface AlertItemProps {
  alert: Alert;
  onPress: (alert: Alert) => void;
}
```

**Features**:
- Touchable card design
- Title and message preview
- Formatted timestamp display
- Consistent styling with shadow effects

**Styling**:
- White background with subtle shadow
- 16px padding
- 8px border radius
- Responsive touch feedback

---

### AlertFilters

**Location**: `src/components/AlertFilters.tsx`

**Purpose**: Provides search and filtering capabilities for the alerts list.

**Props**:
```typescript
interface AlertFiltersProps {
  alerts: Alert[];
  onFilteredAlertsChange: (filteredAlerts: Alert[]) => void;
}
```

**Features**:
- Real-time search with debouncing
- Case-insensitive filtering
- Searches across title and message fields
- Responsive search input with clear button

**Search Algorithm**:
```typescript
// Filters alerts by search term
const filtered = alerts.filter(alert => 
  alert.title.toLowerCase().includes(searchTerm) ||
  alert.message.toLowerCase().includes(searchTerm)
);
```

---

### MapView

**Location**: `src/components/MapView.tsx`

**Purpose**: Provides Google Maps integration via external linking.

**Props**:
```typescript
interface MapViewComponentProps {
  latitude?: number;
  longitude?: number;
  address?: string;
}
```

**Features**:
- Opens Google Maps in browser/app
- Supports both coordinates and address
- Fallback for missing location data
- Platform-agnostic implementation

**URL Generation**:
```typescript
// Coordinate-based
`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`

// Address-based
`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
```

---

### LocationStatus

**Location**: `src/components/LocationStatus.tsx`

**Purpose**: Displays user's current location and distance to alerts.

**Props**:
```typescript
interface LocationStatusProps {
  alertLocation?: {
    latitude: number;
    longitude: number;
  };
}
```

**Features**:
- Location permission handling
- Distance calculation
- Loading states
- Error handling for denied permissions

**Distance Calculation**:
Uses Haversine formula for accurate distance between two coordinates.

---

## Custom Hooks

### useAuth

**Location**: `src/hooks/useAuth.ts`

**Purpose**: Manages authentication state and operations.

**Return Type**:
```typescript
interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}
```

**Features**:
- Firebase Auth integration
- Persistent authentication state
- Comprehensive error handling
- Auto-sync with auth state changes

**Error Codes Handled**:
- `auth/network-request-failed`
- `auth/user-not-found`
- `auth/wrong-password`
- `auth/invalid-email`
- `auth/user-disabled`
- `auth/too-many-requests`

---

### useAlerts

**Location**: `src/hooks/useAlerts.ts`

**Purpose**: Manages real-time alert data from Firestore.

**Return Type**:
```typescript
interface UseAlertsReturn {
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  refreshAlerts: () => void;
}
```

**Features**:
- Real-time Firestore subscription
- Automatic data transformation
- Query optimization (limit 200)
- Error resilience

**Firestore Query**:
```typescript
query(
  collection(firestore, 'alerts'),
  orderBy('lastUpdatedAt', 'desc'),
  limit(200)
)
```

---

### useIncidentDetails

**Location**: `src/hooks/useIncidentDetails.ts`

**Purpose**: Fetches detailed incident data including message history.

**Return Type**:
```typescript
interface UseIncidentDetailsReturn {
  incident: Incident | null;
  groupedMessages: GroupedMessage[];
  isLoading: boolean;
  error: string | null;
}
```

**Features**:
- Fetches main alert document
- Retrieves messages subcollection
- Groups and sorts messages chronologically
- Handles missing data gracefully

**Data Processing**:
1. Fetch main alert document
2. Fetch messages subcollection
3. Sort by timestamp
4. Group similar messages
5. Return processed data

---

### useLocation

**Location**: `src/hooks/useLocation.ts`

**Purpose**: Manages device location permissions and tracking.

**Return Type**:
```typescript
interface UseLocationReturn {
  location: LocationObject | null;
  errorMsg: string | null;
  distance: number | null;
  getDistance: (targetLat: number, targetLng: number) => number | null;
}
```

**Features**:
- Permission request handling
- Continuous location updates
- Distance calculation utility
- Cross-platform compatibility

**Permissions Required**:
- `ACCESS_FINE_LOCATION` (Android)
- `NSLocationWhenInUseUsageDescription` (iOS)

---

## Type Definitions

### Alert

**Location**: `src/types/Alert.ts`

```typescript
export interface Alert {
  id: string;
  title: string;
  message: string;
  timestamp: number;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  type?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
}
```

### Incident (Extended Alert)

```typescript
export interface Incident extends Alert {
  state?: string;
  county?: string;
  city?: string;
  address?: string;
  alertType?: string;
  geo?: {
    latitude: number;
    longitude: number;
  };
  createdAt?: any;
  lastUpdatedAt?: any;
}
```

---

## Firebase Configuration

### config.ts

**Location**: `src/firebase/config.ts`

**Purpose**: Initializes Firebase services for the app.

**Exports**:
```typescript
export const auth: Auth;        // Firebase Authentication instance
export const firestore: Firestore; // Firestore database instance
export default app;             // Firebase app instance
```

**Configuration**:
```typescript
const firebaseConfig = {
  apiKey: "AIzaSyCWX4L4y4Qi--ooSiklKBtoXpEJQice6mQ",
  authDomain: "emu-incidents.firebaseapp.com",
  projectId: "emu-incidents",
  storageBucket: "emu-incidents.firebasestorage.app",
  messagingSenderId: "841200945180",
  appId: "1:841200945180:web:08e09744b8f5b0f14bb7d9"
};
```

**Security Note**: These are client-side keys and are safe to expose. Security is enforced through Firebase Security Rules.

---

## Component Best Practices

### Performance
1. Use `React.memo` for list items
2. Implement `useCallback` for event handlers
3. Optimize re-renders with proper dependencies
4. Use `FlatList` optimization props

### Error Handling
1. Always handle loading states
2. Provide user-friendly error messages
3. Implement retry mechanisms
4. Log errors for debugging

### Accessibility
1. Add proper labels to interactive elements
2. Ensure sufficient color contrast
3. Support screen readers
4. Test keyboard navigation (web)

### Testing Considerations
1. Mock Firebase services
2. Test error states
3. Verify loading indicators
4. Check empty states

---

## Component Communication

```mermaid
graph TD
    App[App.tsx] --> SignIn[SignInScreen]
    App --> Main[MainScreen]
    App --> Details[AlertDetailsScreen]
    
    Main --> AlertItem[AlertItem]
    Main --> AlertFilters[AlertFilters]
    Main --> useAlerts[useAlerts Hook]
    Main --> useAuth[useAuth Hook]
    
    Details --> MapView[MapView]
    Details --> LocationStatus[LocationStatus]
    Details --> useIncidentDetails[useIncidentDetails Hook]
    
    LocationStatus --> useLocation[useLocation Hook]
    
    useAlerts --> Firebase[(Firestore)]
    useAuth --> FirebaseAuth[(Firebase Auth)]
    useIncidentDetails --> Firebase
```

---

## Future Component Enhancements

1. **PushNotificationHandler**: For alert notifications
2. **SettingsScreen**: User preferences
3. **AlertMap**: Native map with all alerts
4. **FilterChips**: Advanced filtering UI
5. **AlertStats**: Statistics dashboard