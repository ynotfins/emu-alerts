# EMU Alerts - Emergency Alert System

A cross-platform mobile application built with Expo React Native that provides real-time emergency incident notifications. The app uses Firebase Firestore for real-time data synchronization, Google Maps for location services, and supports iOS, Android, and Web platforms.

## 🚀 Features

- **Real-time Emergency Alerts**: Live notifications for emergency incidents via Firebase Firestore
- **Firebase Authentication**: Secure email/password authentication system
- **Cross-platform Support**: Works on iOS, Android, and Web browsers
- **Location Services**: GPS integration for incident proximity features
- **Interactive Maps**: Google Maps integration for incident location visualization
- **Material Design UI**: Clean, modern interface following Apple-quality standards
- **Offline Support**: Graceful handling of network connectivity issues
- **Incident Details**: Comprehensive incident information with real-time updates

## 📱 Architecture

### Tech Stack
- **Framework**: Expo React Native (~53.0.22)
- **Language**: TypeScript with strict type checking
- **Database**: Firebase Firestore (real-time NoSQL database)
- **Authentication**: Firebase Auth
- **Maps**: React Native Maps (Google Maps integration)
- **Navigation**: React Navigation v7
- **State Management**: React Hooks (useState, useEffect)
- **Styling**: React Native StyleSheet (no inline styles)

### Project Structure
```
emu-alerts-expo/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── AlertItem.tsx    # Individual alert card component
│   │   └── MapView.tsx      # Map visualization component
│   ├── screens/             # Application screens
│   │   ├── SignInScreen.tsx     # Authentication screen
│   │   ├── MainScreen.tsx       # Alert listing screen
│   │   └── AlertDetailsScreen.tsx # Detailed incident view
│   ├── firebase/           # Firebase configuration
│   │   └── config.ts       # Firebase app initialization
│   └── types/              # TypeScript type definitions
│       └── Alert.ts        # Alert data interface
├── android/                # Android-specific build files
├── assets/                 # App icons and images
├── App.tsx                 # Main application component
├── app.config.ts          # Expo configuration
└── package.json           # Dependencies and scripts
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd emu-alerts-expo
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
# For web development
npm run web

# For mobile development
npm start

# Platform-specific builds
npm run android
npm run ios
```

### Environment Setup

The app uses Firebase for authentication and data. The Firebase configuration is already included in `src/firebase/config.ts` with the following services:
- **Project ID**: emu-incidents
- **Auth Domain**: emu-incidents.firebaseapp.com
- **Firestore Database**: Real-time incident data
- **Storage**: Firebase Cloud Storage

## 📊 Database Schema

### Firestore Collections

#### `alerts` Collection
```typescript
{
  incidentId: string,      // Unique incident identifier
  rawText: string,         // Raw alert text (format: "State|County|City|Type|Message")
  ts: Timestamp,           // Alert timestamp
  // Additional metadata fields
}
```

#### `incidents` Collection
```typescript
{
  state: string,           // State/region
  county: string,          // County/district
  city: string,            // City/locality
  address: string,         // Specific address
  lastType: string,        // Incident type (e.g., "Working Fire")
  lastMessage: string,     // Latest incident message
  lastTs: Timestamp,       // Last update timestamp
  firstSeenAt: Timestamp,  // Initial incident time
  updateCount: number      // Number of updates received
}
```

## 🎯 Key Features Deep Dive

### 1. Real-time Alert System
- **Firestore Listeners**: Uses `onSnapshot()` for real-time data synchronization
- **Data Processing**: Parses raw alert text using pipe-delimited format
- **Grouping Logic**: Groups alerts by incident ID and shows latest updates
- **Performance**: Limits to 200 most recent alerts with pagination support

### 2. Authentication Flow
- **Email/Password**: Firebase Auth with validation
- **Auto-login**: Persistent session management
- **Error Handling**: Network-aware error messages
- **Security**: Secure authentication state management

### 3. Location Services
- **Permissions**: Requests fine and coarse location access
- **Maps Integration**: Google Maps with incident markers
- **Proximity Features**: Location-based alert filtering (configured but not active)
- **Cross-platform**: Works on all supported platforms

### 4. UI/UX Design
- **Material Design**: Consistent theming and components
- **Responsive**: Adapts to different screen sizes
- **Accessibility**: Proper text contrast and touch targets
- **Navigation**: Stack-based navigation with custom headers

## 🚀 Usage Instructions

### For End Users

1. **Launch the App**
   - Open EMU Alerts on your device
   - The app will show a blue-themed loading screen

2. **Sign In**
   - Enter your email and password
   - The app will remember your credentials for future sessions
   - If already signed in, you'll go directly to the main screen

3. **View Alerts**
   - The main screen shows a list of recent emergency incidents
   - Each alert card displays:
     - Location (State | County | City | Type)
     - Incident message
     - Timestamp
   - Tap any alert to view detailed information

4. **Alert Details**
   - Shows comprehensive incident information
   - Real-time updates as new information becomes available
   - Displays incident location, type, and update count
   - Use the back button to return to the main list

5. **Additional Features**
   - **Sign Out**: Use the "Sign Out" button in the top-right
   - **Test Feature**: "Test" button for crash testing (development only)

### For Developers

#### Running on Different Platforms

**Web Development:**
```bash
npm run web
# Opens at http://localhost:8081
```

**Android Development:**
```bash
npm run android
# Requires Android Studio and connected device/emulator
```

**iOS Development:**
```bash
npm run ios
# Requires Xcode and iOS Simulator (macOS only)
```

#### Building for Production

**Web Build:**
```bash
npm run build:web-prod
# Creates dist-web/ directory with static files
```

**Mobile Builds:**
```bash
expo build:android  # APK/AAB
expo build:ios      # IPA
```

## 🔐 Security Features

- **Firebase Security Rules**: Configured for authenticated access only
- **Input Validation**: Email and password validation
- **Network Security**: HTTPS-only communication
- **Error Handling**: Graceful degradation for network issues
- **Authentication State**: Secure session management

## 📱 Cross-Platform Compatibility

### iOS Support
- Native iOS navigation patterns
- Safe area handling for iPhone X+ devices
- iOS-specific styling and animations
- Proper keyboard handling

### Android Support
- Material Design components
- Android-specific permissions handling
- Native Android styling
- Proper back button behavior

### Web Support
- Responsive web design
- Web-specific navigation
- Progressive Web App features
- Cross-browser compatibility

## 🐛 Troubleshooting

### Common Issues

1. **App won't start**
   - Ensure all dependencies are installed: `npm install`
   - Clear Metro cache: `expo start --clear`

2. **Authentication issues**
   - Check Firebase configuration in `src/firebase/config.ts`
   - Verify network connectivity
   - Ensure valid email/password format

3. **No alerts showing**
   - Check Firestore database connection
   - Verify user authentication status
   - Check console for error messages

4. **Maps not loading**
   - Ensure location permissions are granted
   - Check Google Maps API configuration
   - Verify network connectivity

### Development Issues

1. **Metro bundler errors**
   - Clear cache: `expo start --clear`
   - Reset Metro: `npx react-native start --reset-cache`

2. **Android build issues**
   - Ensure Android SDK is properly configured
   - Check Java version compatibility
   - Verify Android device/emulator is connected

3. **iOS build issues**
   - Ensure Xcode is installed and updated
   - Check iOS Simulator is available
   - Verify macOS compatibility

## 📈 Performance Considerations

- **Firestore Optimization**: Limited to 200 recent alerts to prevent memory issues
- **Real-time Efficiency**: Uses Firestore snapshots for efficient updates
- **UI Performance**: Virtualized lists for large datasets
- **Network Handling**: Graceful offline/online state management
- **Memory Management**: Proper cleanup of Firestore listeners

## 🤝 Contributing

This project follows React Native and Expo best practices:

1. **Code Style**: TypeScript with strict typing
2. **Components**: Functional components with hooks
3. **Styling**: StyleSheet-based styling (no inline styles)
4. **Architecture**: Clean separation of concerns
5. **Testing**: Zero trust attitude - all changes must be tested

## 📄 License

This project is proprietary and intended for emergency management use.

## 📞 Support

For technical support or questions about the EMU Alerts system, please contact the development team.

---

**Built with ❤️ using Expo React Native**
