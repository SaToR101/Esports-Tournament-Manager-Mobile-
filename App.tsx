import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { DetailsScreen } from './src/screens/DetailsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ProDetailsScreen } from './src/screens/ProDetailsScreen';
import { TeamScreen } from './src/screens/TeamScreen';
import { View, Text } from 'react-native';

const Stack = createNativeStackNavigator();

function Navigation() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    },
                    headerTintColor: theme === 'dark' ? '#ffffff' : '#111827',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    contentStyle: {
                        backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb',
                    },
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: t('app_name') }}
                />
                <Stack.Screen
                    name="Details"
                    component={DetailsScreen}
                    options={({ route }: any) => ({
                        title: route.params?.id ? t('edit_tournament') : t('add_tournament')
                    })}
                />
                <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{ title: t('settings') }}
                />
                <Stack.Screen
                    name="ProDetails"
                    component={ProDetailsScreen}
                    options={{ title: 'Pro Tournament' }}
                />
                <Stack.Screen
                    name="TeamDetails"
                    component={TeamScreen}
                    options={{ title: 'Team Roster' }}
                />
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
        </SafeAreaProvider>
    );
}
