# EMU Alerts Developer Setup Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Development Environment](#development-environment)
4. [Running the App](#running-the-app)
5. [Testing](#testing)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Node.js**: Version 18.0.0 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

### Platform-Specific Requirements

#### For Android Development
- **Java Development Kit (JDK)**: Version 17
- **Android Studio**: Hedgehog (2023.1.1) or newer
- **Android SDK**: API Level 34
- **Android Emulator** or physical device

#### For iOS Development (macOS only)
- **Xcode**: Version 14.0 or newer
- **CocoaPods**: Latest version
- **iOS Simulator** or physical device

#### For Web Development
- **Modern Browser**: Chrome, Firefox, Safari, or Edge
- No additional requirements

## Initial Setup

### 1. Clone the Repository

```bash
git clone https://github.com/ynotfins/emu-alerts.git
cd emu-alerts-expo
```

### 2. Install Package Manager

We use pnpm for faster, more efficient package management:

```bash
npm install -g pnpm
```

### 3. Install Dependencies

```bash
pnpm install
```

This installs all required packages including:
- React Native and Expo
- Firebase SDK
- Navigation libraries
- TypeScript

### 4. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your configuration:

```bash
# Optional - Only needed for native map implementations
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Note**: The current implementation uses external Google Maps links, so the API key is optional.

### 5. Firebase Setup

The app connects to the `emu-incidents` Firebase project. Configuration is already included in `src/firebase/config.ts`.

For local development with your own Firebase project:

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Update `src/firebase/config.ts` with your project credentials

## Development Environment

### VS Code Setup

1. **Install recommended extensions**:
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - React Native Tools
   - Expo Tools

2. **Create VS Code settings** (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Git Configuration

Set up pre-commit hooks for code quality:

```bash
# Install husky (optional)
pnpm add -D husky lint-staged

# Initialize husky
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

Create `.lintstagedrc.json`:
```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md}": ["prettier --write"]
}
```

## Running the App

### Web Development (Recommended for Quick Start)

```bash
pnpm run web
```

- Opens at http://localhost:8081
- Hot reload enabled
- No additional setup required
- Best for rapid development

### Android Development

#### Using Android Studio Emulator

1. **Start Android Studio**
2. **Open AVD Manager**: Tools → AVD Manager
3. **Create/Start an emulator**
4. **Run the app**:
```bash
pnpm run android
```

#### Using Physical Device

1. **Enable Developer Mode** on your device
2. **Enable USB Debugging**
3. **Connect via USB**
4. **Verify connection**:
```bash
adb devices
```
5. **Run the app**:
```bash
pnpm run android
```

### iOS Development (macOS only)

#### Using Simulator

```bash
pnpm run ios
```

#### Using Physical Device

1. **Open Xcode**
2. **Sign in with Apple Developer account**
3. **Connect device**
4. **Trust computer on device**
5. **Run the app**:
```bash
pnpm run ios --device
```

### Expo Go (Quick Testing)

1. **Install Expo Go** on your phone
2. **Start development server**:
```bash
pnpm start
```
3. **Scan QR code** with Expo Go app

## Testing

### Test Credentials

Use these credentials to test the app:

```
Email: test-1757693595470@emu.com
Password: test123456
```

### Manual Testing Checklist

1. **Authentication Flow**
   - [ ] Sign in with valid credentials
   - [ ] Sign in with invalid credentials
   - [ ] Sign out functionality
   - [ ] Error message display

2. **Alert List**
   - [ ] View alerts (may be empty initially)
   - [ ] Pull to refresh
   - [ ] Search functionality
   - [ ] Tap to view details

3. **Alert Details**
   - [ ] View full alert information
   - [ ] Check map button functionality
   - [ ] View message timeline
   - [ ] Back navigation

4. **Performance**
   - [ ] Smooth scrolling
   - [ ] Fast screen transitions
   - [ ] No memory leaks
   - [ ] Responsive UI

### Creating Test Data

Since the app requires data from external sources, you can:

1. **Use the Cloud Function** (requires deployment):
```bash
curl -X POST https://us-central1-emu-incidents.cloudfunctions.net/ingestBNN \
  -H "Content-Type: application/json" \
  -H "X-Ingest-Token: YOUR_TOKEN" \
  -d '{
    "alertId": "TEST-001",
    "message": "Test alert",
    "state": "NY",
    "alertType": "Test"
  }'
```

2. **Use Firebase Console**:
   - Navigate to Firestore
   - Add documents manually to `alerts` collection

### Unit Testing (Future Implementation)

```bash
# Run tests
pnpm test

# Run with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Metro Bundler Issues

**Problem**: "Metro has encountered an error"

**Solution**:
```bash
# Clear Metro cache
npx expo start --clear

# Reset everything
rm -rf node_modules
pnpm install
npx expo start --clear
```

#### 2. Android Build Errors

**Problem**: "SDK location not found"

**Solution**:
1. Create `local.properties` in android folder:
```
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

2. Or set environment variable:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

#### 3. iOS Pod Installation

**Problem**: "pod install" errors

**Solution**:
```bash
cd ios
pod deintegrate
pod install
cd ..
```

#### 4. Firebase Connection Issues

**Problem**: "Missing or insufficient permissions"

**Solution**:
- Ensure you're signed in
- Check Firebase Console for user account
- Verify Firestore rules allow authenticated reads

#### 5. TypeScript Errors

**Problem**: Type errors in VS Code

**Solution**:
```bash
# Restart TypeScript service in VS Code
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Platform-Specific Issues

#### Windows
- Use PowerShell or Git Bash, not Command Prompt
- Run as Administrator if permission errors occur
- Disable Windows Defender for node_modules folder

#### macOS
- Grant Terminal/VS Code full disk access
- Install Xcode Command Line Tools: `xcode-select --install`
- For M1/M2 Macs, use Rosetta for some tools

#### Linux
- Install required system libraries:
```bash
sudo apt-get update
sudo apt-get install build-essential
```

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes
# Test thoroughly
# Commit with meaningful messages
git add .
git commit -m "feat: add new feature description"

# Push to remote
git push origin feature/your-feature-name
```

### 2. Code Style Guidelines

- **TypeScript**: Use strict mode
- **Components**: Functional components with hooks
- **Styling**: StyleSheet.create() for performance
- **Naming**: PascalCase for components, camelCase for functions
- **Imports**: Absolute imports from 'src/'

### 3. Performance Best Practices

- Use React.memo for expensive components
- Implement proper FlatList optimizations
- Minimize re-renders with useCallback/useMemo
- Lazy load screens with React.lazy
- Optimize images and assets

### 4. Debugging

#### React Native Debugger
1. Install React Native Debugger
2. Start the debugger
3. Enable remote debugging in app

#### Flipper
1. Download Flipper
2. Start Metro with Flipper:
```bash
npx expo start --dev-client
```

#### Console Logging
```typescript
// Development only
if (__DEV__) {
  console.log('Debug info:', data);
}
```

### 5. Hot Reload and Fast Refresh

- Enabled by default
- Press 'r' in terminal to reload
- Press 'd' to open developer menu
- Shake device for developer menu on physical devices

## Additional Resources

### Documentation
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Community
- [Expo Forums](https://forums.expo.dev)
- [React Native Community](https://reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

### Tools
- [React DevTools](https://github.com/facebook/react-devtools)
- [Expo Snack](https://snack.expo.dev) - Online playground
- [Bundle Analyzer](https://www.npmjs.com/package/expo-bundle-analyzer)

## Next Steps

1. **Explore the codebase**: Start with `App.tsx` and follow the component tree
2. **Make small changes**: Try modifying styles or text
3. **Add features**: Implement a new filter or UI enhancement
4. **Contribute**: Submit pull requests with improvements

Happy coding! 🚀