import 'dotenv/config';
import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'EMU Alerts',
  slug: 'emu-alerts',
  version: '1.0.0',
  scheme: 'emualerts',
  orientation: 'portrait',
  userInterfaceStyle: 'light',
  plugins: [
    [
      'react-native-maps',
      {
        config: {
          googleMaps:
            {
              apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || ''
            }
        }
      }
    ]
  ],
  extra: {
    // Values read at runtime via process.env in the app code as EXPO_PUBLIC_*
  },
};

export default config;


