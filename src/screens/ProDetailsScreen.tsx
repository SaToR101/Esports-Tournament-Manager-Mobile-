import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Trophy, Calendar, DollarSign, Activity } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { ProTournament } from '../services/api';

export const ProDetailsScreen = ({ route, navigation }: any) => {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const tournament: ProTournament = route.params?.tournament;

    if (!tournament) return null;

    // --- УМНАЯ ФУНКЦИЯ ДЛЯ СТАТУСА ---
    const getTournamentStatus = () => {
        // 1. Проверяем, прислало ли API готовый текстовый статус
        if (tournament.status === 'running') return t('status_running');
        if (tournament.status === 'finished') return t('finished');
        if (tournament.status === 'upcoming') return t('status_upcoming');
        if (tournament.status === 'canceled') return t('status_canceled');

        // 2. Если API статус не дало (или он кривой), считаем сами по датам
        const now = new Date();
        const beginDate = tournament.begin_at ? new Date(tournament.begin_at) : null;
        const endDate = tournament.end_at ? new Date(tournament.end_at) : null;

        if (endDate && endDate < now) {
            return t('finished'); // Дата конца в прошлом
        }
        if (beginDate && beginDate <= now && (!endDate || endDate >= now)) {
            return t('status_running'); // Уже начался, но еще не закончился
        }
        if (beginDate && beginDate > now) {
            return t('status_upcoming'); // Начнется в будущем
        }

        // 3. Если вообще никаких данных нет
        return t('tba');
    };

    return (
        <ScrollView className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>

            {/* Шапка */}
            <View className="items-center mb-6 mt-4">
                <View className="w-24 h-24 bg-gray-200 rounded-full mb-4 items-center justify-center overflow-hidden border-2 border-indigo-500">
                    {tournament.league.image_url ? (
                        <Image source={{ uri: tournament.league.image_url }} className="w-20 h-20" resizeMode="contain" />
                    ) : (
                        <Trophy size={40} color="#6366f1" />
                    )}
                </View>
                <Text className="text-2xl font-bold text-center" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    {tournament.name}
                </Text>
                <Text className="text-lg mt-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    {tournament.league.name}
                </Text>
            </View>

            <View className="space-y-4">

                {/* Статус и Тир */}
                <View className="flex-row justify-between">
                    <View className="flex-1 p-4 rounded-xl mr-2 border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                        <Activity size={24} color="#3b82f6" className="mb-2" />
                        <Text className="text-xs uppercase" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            {t('status')}
                        </Text>
                        <Text className="font-bold text-lg capitalize" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                            {/* Вызываем нашу новую функцию здесь: */}
                            {getTournamentStatus()}
                        </Text>
                    </View>

                    <View className="flex-1 p-4 rounded-xl ml-2 border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                        <Trophy size={24} color="#fbbf24" className="mb-2" />
                        <Text className="text-xs uppercase" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            {t('tier')}
                        </Text>
                        <Text className="font-bold text-lg uppercase" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                            {tournament.tier}
                        </Text>
                    </View>
                </View>

                {/* Призовой фонд */}
                <View className="p-4 rounded-xl border flex-row items-center" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                    <View className="bg-green-100 p-3 rounded-full mr-4">
                        <DollarSign size={24} color="#16a34a" />
                    </View>
                    <View>
                        <Text className="text-xs uppercase" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            {t('prize_pool')}
                        </Text>
                        <Text className="font-bold text-xl" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                            {tournament.prizepool || t('tba')}
                        </Text>
                    </View>
                </View>

                {/* Даты проведения */}
                <View className="p-4 rounded-xl border flex-row items-center" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                    <View className="bg-indigo-100 p-3 rounded-full mr-4">
                        <Calendar size={24} color="#4f46e5" />
                    </View>
                    <View>
                        <Text className="text-xs uppercase" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            {t('start_date')}
                        </Text>
                        <Text className="font-bold text-lg mb-1" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                            {tournament.begin_at ? new Date(tournament.begin_at).toLocaleDateString() : t('tba')}
                        </Text>
                        <Text className="text-xs uppercase mt-2" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                            {t('end_date')}
                        </Text>
                        <Text className="font-bold text-lg" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                            {tournament.end_at ? new Date(tournament.end_at).toLocaleDateString() : t('tba')}
                        </Text>
                    </View>
                </View>
            </View>

            {/* --- СЕКЦИЯ КОМАНД --- */}
            {tournament.teams && tournament.teams.length > 0 && (
                <View className="mt-6 mb-8">
                    <Text className="text-lg font-bold mb-3" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                        {t('participating_teams')}
                    </Text>
                    <View className="flex-row flex-wrap">
                        {tournament.teams.map((team, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => team.id ? navigation.navigate('TeamDetails', { teamId: team.id }) : null}
                                className="w-1/3 items-center mb-4 p-2"
                            >
                                <View className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-sm border border-gray-200 mb-2 overflow-hidden p-2">
                                    {team.image_url ? (
                                        <Image source={{ uri: team.image_url }} className="w-12 h-12" resizeMode="contain" />
                                    ) : (
                                        <Text className="text-xs text-gray-400">{t('no_logo')}</Text>
                                    )}
                                </View>
                                <Text
                                    className="text-xs text-center font-medium"
                                    numberOfLines={1}
                                    style={{ color: theme === 'dark' ? '#9ca3af' : '#4b5563' }}
                                >
                                    {team.name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            )}
        </ScrollView>
    );
};