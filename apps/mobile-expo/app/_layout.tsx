import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/tokens';
import { useAuth } from '../src/firebase/auth';
import SignInScreen from './sign-in';
import HomeScreen from './home';
import DetailsScreen from './details';
import NearestScreen from './nearest';
import TeamScreen from './team';
import ProfileScreen from './profile';
import ChatGlobalScreen from './chat-global';
import PendingScreen from './pending-role';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

const navTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    text: colors.text,
    background: '#FFFFFF',
    primary: colors.accent,
    card: '#FFFFFF',
    border: '#EAEAEA',
    notification: colors.accent,
  },
};

function TabRoutes() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { paddingTop: 4, paddingBottom: 6, height: 56 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondaryText,
        tabBarIcon: ({ color, size }) => {
          const name = route.name === 'Home' ? 'home' :
            route.name === 'Nearest' ? 'navigate' :
            route.name === 'Team' ? 'people' :
            route.name === 'Profile' ? 'person' : 'chatbubble';
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Nearest" component={NearestScreen} />
      <Tabs.Screen name="Team" component={TeamScreen} />
      <Tabs.Screen name="Chat" component={ChatGlobalScreen} />
      <Tabs.Screen name="Profile" component={ProfileScreen} />
    </Tabs.Navigator>
  );
}

export default function RootLayout() {
  const { user, role, initializing } = useAuth();
  const isAuthed = !!user && (role === 'employee' || role === 'manager');
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator>
        {initializing ? null : !isAuthed ? (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Pending" component={PendingScreen} options={{ title: 'Access Pending' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Tabs" component={TabRoutes} options={{ headerShown: false }} />
            <Stack.Screen name="Details" component={DetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}


