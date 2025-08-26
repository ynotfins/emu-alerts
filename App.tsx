import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
import SignInScreen from './src/screens/SignInScreen';
import MainScreen from './src/screens/MainScreen';
import AlertDetailsScreen from './src/screens/AlertDetailsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor="#1976d2" />
      <Stack.Navigator 
        initialRouteName="SignIn"
        screenOptions={{
          headerShown: false, // We're implementing custom headers
        }}
      >
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="Main" component={MainScreen} />
        <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
