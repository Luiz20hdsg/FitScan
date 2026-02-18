import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UserProvider, useUser } from './src/context/UserContext';
import { RootStackParamList } from './src/types';
import { Colors } from './src/theme';
import { initializeNotifications, trackEngagement, EngagementEvents } from './src/services/NotificationService';
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import MainTabs from './src/navigation/MainTabs';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Tela de carregamento enquanto dados do AsyncStorage são restaurados.
 */
const LoadingScreen = () => (
  <View style={loadingStyles.container}>
    <ActivityIndicator size="large" color={Colors.accent} />
  </View>
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

/**
 * Navegação principal com lógica de rota inicial baseada no estado persistido.
 */
const AppNavigator = () => {
  const { auth, hasCompletedOnboarding, isLoading } = useUser();

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Determinar rota inicial baseado no estado do usuário
  let initialRoute: keyof RootStackParamList = 'Welcome';
  if (auth.isAuthenticated && hasCompletedOnboarding) {
    initialRoute = 'MainTabs';
  } else if (auth.isAuthenticated && !hasCompletedOnboarding) {
    initialRoute = 'Onboarding';
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: Colors.background },
        }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

function App(): React.JSX.Element {
  useEffect(() => {
    // Inicializar notificações push (OneSignal)
    initializeNotifications();

    // Rastrear abertura do app
    trackEngagement(EngagementEvents.APP_OPENED);
  }, []);

  return (
    <SafeAreaProvider>
      <UserProvider>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
        <AppNavigator />
      </UserProvider>
    </SafeAreaProvider>
  );
}

export default App;
