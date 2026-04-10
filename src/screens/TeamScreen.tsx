import React from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext'; // ИМПОРТ ЯЗЫКОВ
import { useTeamDetails } from '../hooks/useTeamDetails';

export const TeamScreen = ({ route }: any) => {
    const { theme } = useTheme();
    const { t } = useLanguage(); // ДОСТАЕМ t

    const teamId = route.params?.teamId;
    const { team, loading } = useTeamDetails(teamId);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
                <ActivityIndicator size="large" color="#6366f1" />
            </View>
        );
    }

    if (!team) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
                <Text style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>{t('no_data')}</Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>

            {/* Логотип команды */}
            <View className="items-center mb-8 mt-4">
                <View className="w-28 h-28 bg-white rounded-full items-center justify-center shadow-md p-4 mb-4">
                    {team.image_url ? (
                        <Image source={{ uri: team.image_url }} className="w-20 h-20" resizeMode="contain" />
                    ) : (
                        <Text>{t('no_logo')}</Text>
                    )}
                </View>
                <Text className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    {team.name}
                </Text>
                <Text className="text-sm mt-1 text-gray-500 uppercase tracking-widest">{t('active_roster')}</Text>
            </View>

            {/* Список Игроков */}
            <View className="space-y-4 mb-10">
                {team.players.map((player) => (
                    <View
                        key={player.id}
                        className="flex-row items-center p-4 rounded-xl border shadow-sm"
                        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                    >
                        {/* Фотка игрока */}
                        <View className="w-16 h-16 bg-gray-200 rounded-full overflow-hidden mr-4 items-center justify-center">
                            {player.image_url ? (
                                <Image source={{ uri: player.image_url }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <Text className="text-xl">👤</Text>
                            )}
                        </View>

                        {/* Инфа об игроке */}
                        <View className="flex-1">
                            <View className="flex-row items-center">
                                <Text className="mr-2 text-lg">
                                    {player.nationality ? `🌍` : ''}
                                </Text>
                                <Text className="text-xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                    {player.name}
                                </Text>
                            </View>

                            <Text className="text-sm mt-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                {player.first_name} {player.last_name}
                            </Text>
                        </View>
                    </View>
                ))}

                {team.players.length === 0 && (
                    <Text className="text-center text-gray-500">{t('roster_unknown')}</Text>
                )}
            </View>
        </ScrollView>
    );
};