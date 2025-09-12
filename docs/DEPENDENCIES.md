# EMU Alerts Dependencies Documentation

## Overview

This document provides a comprehensive list of all dependencies used in the EMU Alerts project, their versions, purposes, and any important notes about their usage.

## Production Dependencies

### Core Framework

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `react` | 19.0.0 | UI library foundation | Latest stable version |
| `react-native` | 0.79.6 | Mobile app framework | Expo-compatible version |
| `expo` | ~53.0.22 | Development platform | Manages native code |
| `react-dom` | 19.0.0 | Web rendering | For web platform support |
| `react-native-web` | ^0.20.0 | Web compatibility | Enables web builds |

### Navigation

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@react-navigation/native` | ^7.1.17 | Navigation framework | Core navigation |
| `@react-navigation/native-stack` | ^7.3.25 | Stack navigator | Screen transitions |
| `react-native-screens` | ^4.15.2 | Native screen optimization | Performance boost |
| `react-native-safe-area-context` | ^5.6.1 | Safe area handling | Notch/status bar support |

### Firebase Services

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `firebase` | ^12.1.0 | Firebase SDK | Auth, Firestore, Functions |

### Expo Modules

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `expo-location` | ^18.1.6 | Device location | GPS functionality |
| `expo-status-bar` | ~2.2.3 | Status bar control | UI consistency |
| `@expo/metro-runtime` | ~5.0.4 | Metro bundler runtime | Required for Expo |

### Crash Reporting (Deprecated)

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `expo-firebase-crashlytics` | ^2.0.0 | Crash reporting | ⚠️ Deprecated |
| `@react-native-firebase/crashlytics` | ^23.1.1 | Native crash reporting | Alternative to above |

## Development Dependencies

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `@babel/core` | ^7.25.2 | JavaScript compiler | Transpilation |
| `@types/react` | ~19.0.10 | TypeScript types | Type definitions |
| `typescript` | ~5.8.3 | TypeScript compiler | Type safety |

## Cloud Functions Dependencies

Located in `functions/package.json`:

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `firebase-admin` | ^11.11.1 | Admin SDK | Server-side Firebase |
| `firebase-functions` | ^4.4.1 | Cloud Functions SDK | Serverless functions |

## Dependency Tree Analysis

### Bundle Size Impact

Major contributors to bundle size:
1. **Firebase SDK** (~2.1 MB)
2. **React Native** (~1.8 MB)
3. **React Navigation** (~600 KB)
4. **Expo Modules** (~400 KB)

### Peer Dependencies

Important peer dependencies to note:
- React Native requires React 19.0.0
- Navigation packages require specific React Native versions
- Some Expo modules require specific Expo SDK versions

## Version Management

### Update Strategy

1. **Patch Updates** (`~`): Automatically accept patch updates
   - Example: `expo: ~53.0.22` allows 53.0.x

2. **Minor Updates** (`^`): Accept minor updates
   - Example: `firebase: ^12.1.0` allows 12.x.x

3. **Exact Versions**: For critical dependencies
   - Example: `react: 19.0.0` (no prefix)

### Checking for Updates

```bash
# Check outdated packages
pnpm outdated

# Update all dependencies
pnpm update

# Update specific package
pnpm update firebase

# Major version updates (careful!)
pnpm add package@latest
```

## Known Issues and Workarounds

### 1. Deprecated Packages

**expo-firebase-crashlytics**
- Status: Deprecated
- Alternative: Use Firebase Crashlytics directly
- Migration guide: [Link](https://gist.github.com/brentvatne/9038b16b4f42a21cea40ad5c35fdb74c)

### 2. Peer Dependency Warnings

**expo-react-native-adapter**
- Warning: Requires React Native ^0.57.1
- Current: Using 0.79.6
- Impact: None (works fine)
- Action: Can be ignored

### 3. Platform-Specific Issues

**Android Gradle**
- Requires JDK 17
- Gradle 8.10.2
- Android Gradle Plugin 8.7.3

## Security Considerations

### Vulnerability Scanning

```bash
# Check for vulnerabilities
pnpm audit

# Auto-fix vulnerabilities
pnpm audit fix

# Force fixes (use cautiously)
pnpm audit fix --force
```

### Regular Maintenance

1. Run security audits weekly
2. Update dependencies monthly
3. Review changelogs for breaking changes
4. Test thoroughly after updates

## Package Lock File

We use `pnpm-lock.yaml` for deterministic installs:
- Ensures consistent dependencies across environments
- Faster installation times
- Better disk space efficiency

**Important**: Always commit `pnpm-lock.yaml` to version control.

## Adding New Dependencies

### Guidelines

1. **Check bundle size impact**:
```bash
# Before adding
pnpm run build:web-prod
# Note the bundle size

# After adding
pnpm add new-package
pnpm run build:web-prod
# Compare bundle sizes
```

2. **Verify compatibility**:
- Check Expo SDK compatibility
- Verify React Native version support
- Test on all platforms

3. **Consider alternatives**:
- Prefer packages with smaller footprint
- Look for Expo-compatible versions
- Check maintenance status

### Installation Commands

```bash
# Add production dependency
pnpm add package-name

# Add development dependency
pnpm add -D package-name

# Add specific version
pnpm add package-name@1.2.3

# Add from GitHub
pnpm add github:user/repo
```

## Removing Dependencies

```bash
# Remove package
pnpm remove package-name

# Clean up unused packages
pnpm prune

# Clear cache if needed
pnpm store prune
```

## Platform-Specific Dependencies

### Web-Only
```json
{
  "react-dom": "19.0.0",
  "react-native-web": "^0.20.0"
}
```

### Mobile-Only
```json
{
  "react-native-screens": "^4.15.2",
  "expo-location": "^18.1.6"
}
```

### Development Tools Integration

**ESLint Configuration** (recommended):
```bash
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

**Prettier Configuration** (recommended):
```bash
pnpm add -D prettier eslint-config-prettier
```

## Optimization Tips

1. **Tree Shaking**: Expo automatically removes unused code
2. **Lazy Loading**: Use dynamic imports for large libraries
3. **Platform Splitting**: Use `.web.ts` and `.native.ts` extensions
4. **Bundle Analysis**: Use `expo-bundle-analyzer`

## Future Considerations

### Planned Additions
1. **Testing**: Jest, React Native Testing Library
2. **State Management**: Zustand or Redux Toolkit
3. **Forms**: React Hook Form
4. **Analytics**: Firebase Analytics

### Potential Replacements
1. **Navigation**: Consider Expo Router
2. **Maps**: Native map libraries
3. **Animations**: Reanimated 3

## Troubleshooting Dependencies

### Common Issues

1. **Module Resolution**:
```bash
# Clear all caches
rm -rf node_modules
pnpm install
npx expo start --clear
```

2. **Version Conflicts**:
```bash
# Check for conflicts
pnpm ls package-name

# Force resolution
pnpm add package-name@version --force
```

3. **Native Module Issues**:
```bash
# Rebuild native modules
npx expo run:android --clear
npx expo run:ios --clear
```

## Resources

- [Expo SDK Documentation](https://docs.expo.dev/versions/latest/)
- [React Native Directory](https://reactnative.directory/)
- [Bundle Phobia](https://bundlephobia.com/) - Check package sizes
- [NPM Trends](https://npmtrends.com/) - Compare packages