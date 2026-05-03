import React, { useState, useEffect } from 'react';
// ДОБАВИЛИ AppState В ИМПОРТЫ
import { AppState, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as NavigationBar from 'expo-navigation-bar';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/lib/firebase';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProDetailsScreen } from './src/screens/ProDetailsScreen';
import { TeamScreen } from './src/screens/TeamScreen';
import { AuthScreen } from './src/screens/AuthScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [user, setUser] = useState<User | null>(null);

    // --- ФУНКЦИЯ СКРЫТИЯ ПАНЕЛИ ---
    const hideNavigationBar = async () => {
        if (Platform.OS === 'android') {
            await NavigationBar.setVisibilityAsync("hidden");
            await NavigationBar.setBehaviorAsync("overlay-swipe");
        }
    };

    // Слушаем возвращение из фона и прячем панель
    useEffect(() => {
        hideNavigationBar(); // Прячем при старте

        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') {
                hideNavigationBar(); // Прячем каждый раз, когда возвращаемся в приложение
            }
        });

        return () => subscription.remove();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' },
                    headerTintColor: theme === 'dark' ? '#ffffff' : '#111827',
                    headerTitleStyle: { fontWeight: 'bold' },
                    contentStyle: { backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' },
                }}
            >
                {user ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('app_name') }} />
                        <Stack.Screen name="Details" component={DetailsScreen} options={({ route }: any) => ({ title: route.params?.id ? t('edit_tournament') : t('add_tournament') })} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
                        <Stack.Screen name="ProDetails" component={ProDetailsScreen} options={{ title: t('pro_tournament_title') || 'Pro Tournament' }} />
                        <Stack.Screen name="TeamDetails" component={TeamScreen} options={{ title: t('team_roster_title') || 'Team Roster' }} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
                )}
            </Stack.Navigator>
            <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            <ThemeProvider>
                <LanguageProvider>
                    <Navigation />
                </LanguageProvider>
            </ThemeProvider>
            <Toast />
        </SafeAreaProvider>
    );
}