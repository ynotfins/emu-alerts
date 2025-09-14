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
      >
        <Stack.Screen 
          name="SignIn" 
          component={SignInScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="AlertDetails" 
          component={AlertDetailsScreen} 
          options={{ 
            title: 'Alert Details',
            headerStyle: { backgroundColor: '#1976d2' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' }
          }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
