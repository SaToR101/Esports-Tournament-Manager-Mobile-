import React, { useState, useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as NavigationBar from 'expo-navigation-bar';

import { Session } from '@supabase/supabase-js';
import { supabase } from './src/lib/supabase';

import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProDetailsScreen } from './src/screens/ProDetailsScreen';
import { TeamScreen } from './src/screens/TeamScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { CreateMatchScreen } from './src/screens/CreateMatchScreen'; // Новый экран
import { LocalTeamScreen } from './src/screens/LocalTeamScreen';
import { MatchMapsScreen } from './src/screens/MatchMapsScreen';
import { MapScoreboardScreen } from './src/screens/MapScoreboardScreen';
import { PlayerProfileScreen } from './src/screens/PlayerProfileScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
    const { theme } = useTheme();
    const { t } = useLanguage();
    const [session, setSession] = useState<Session | null>(null);

    const hideNavigationBar = async () => {
        if (Platform.OS === 'android') {
            await NavigationBar.setVisibilityAsync("hidden");
            await NavigationBar.setBehaviorAsync("overlay-swipe");
        }
    };

    useEffect(() => {
        hideNavigationBar();
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (nextAppState === 'active') hideNavigationBar();
        });
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
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
                {session ? (
                    <>
                        <Stack.Screen name="Home" component={HomeScreen} options={{ title: t('app_name') }} />
                        <Stack.Screen name="Details" component={DetailsScreen} options={({ route }: any) => ({ title: route.params?.id ? t('edit_tournament') : t('add_tournament') })} />
                        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings') }} />
                        <Stack.Screen name="ProDetails" component={ProDetailsScreen} options={{ title: t('pro_tournament_title') || 'Pro Tournament' }} />
                        <Stack.Screen name="TeamDetails" component={TeamScreen} options={{ title: t('team_roster_title') || 'Team Roster' }} />
                        <Stack.Screen name="CreateMatch" component={CreateMatchScreen} options={{ title: 'Новый матч' }} />
                        <Stack.Screen name="LocalTeamDetails" component={LocalTeamScreen} options={{ title: 'Состав команды' }} />
                        <Stack.Screen name="MatchMaps" component={MatchMapsScreen} options={{ title: t('map_list') }} />
                        <Stack.Screen name="MapScoreboard" component={MapScoreboardScreen} options={({ route }: any) => ({ title: route.params?.mapPlayed?.map_name })} />
                        <Stack.Screen name="PlayerProfile" component={PlayerProfileScreen} options={({ route }: any) => ({ title: route.params?.nickname })} />
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