import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Calendar, ChevronRight, Settings, Trophy } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Tournament } from '../lib/storage';
// Импортируем нашу ViewModel
import { useHomeScreen } from '../hooks/useHomeScreen';
import { ProTournament } from '../services/api';

export const HomeScreen = ({ navigation }: any) => {
    const { t, language } = useLanguage();
    const { theme } = useTheme();

    // Подключаем ViewModel (Пункт 1)
    const {
        localTournaments,
        proTournaments,
        refreshing,
        isOffline,
        loadAllData,
        onRefresh
    } = useHomeScreen();

    useFocusEffect(
        useCallback(() => {
            loadAllData();
        }, [loadAllData])
    );

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="p-2">
                    <Settings size={24} color={theme === 'dark' ? '#fff' : '#000'} />
                </TouchableOpacity>
            ),
        });
    }, [navigation, theme]);

    // Карточка для турнира из API
    const renderProItem = ({ item }: { item: ProTournament }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ProDetails', { tournament: item })} // Переход на новый экран
            className="p-4 rounded-xl shadow-sm mr-3 border w-64"
            style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#f3f4f6'
            }}
        >
            <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                    <Trophy size={16} color="#fbbf24" />
                    <Text className="text-xs text-yellow-500 ml-1 font-bold uppercase">{item.tier} Tier</Text>
                </View>
                <ChevronRight size={16} color="#9ca3af" />
            </View>
            <Text className="font-semibold text-md mb-1" numberOfLines={2} style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                {item.name}
            </Text>
            <Text className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                {item.league.name}
            </Text>
        </TouchableOpacity>
    );

    // Карточка для твоего локального турнира
    const renderLocalItem = ({ item }: { item: Tournament }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('Details', { id: item.id })}
            className="p-4 rounded-xl shadow-sm mb-3 flex-row items-center border"
            style={{
                backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                borderColor: theme === 'dark' ? '#374151' : '#f3f4f6'
            }}
        >
            <View className="flex-1">
                <Text className="font-semibold text-lg mb-1" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{item.title}</Text>
                <Text className="text-sm mb-2" numberOfLines={1} style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    {item.description}
                </Text>
                <View className="flex-row items-center">
                    <Calendar size={14} color="#9ca3af" />
                    <Text className="text-xs ml-1" style={{ color: theme === 'dark' ? '#9ca3af' : '#9ca3af' }}>
                        {new Date(item.date).toLocaleDateString()}
                    </Text>
                </View>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>

            {/* Плашка оффлайн режима */}
            {isOffline && (
                <View className="bg-red-500 py-2 px-4 items-center justify-center flex-row z-50">
                    <Text className="text-white text-xs font-bold ml-2">
                        {t('offline_warning')}
                    </Text>
                </View>
            )}

            <ScrollView
                className="flex-1 p-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme === 'dark' ? '#ffffff' : '#000000'} />}
            >
                {/* Секция 1: Pro Турниры (Web API) */}
                <Text className="font-bold text-lg mb-3" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                    {t('pro_tournaments')}
                </Text>
                <View className="mb-6">
                    {proTournaments.length === 0 ? (
                        <Text style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Загрузка...</Text>
                    ) : (
                        <FlatList
                            data={proTournaments}
                            renderItem={renderProItem}
                            keyExtractor={(item) => item.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                        />
                    )}
                </View>

                {/* Секция 2: Твои турниры (Локальные) */}
                <Text className="font-bold text-lg mb-3" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                    {t('my_tournaments') || 'Мои турниры'}
                </Text>

                {localTournaments.length === 0 ? (
                    <View className="py-10 items-center">
                        <Text style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} className="text-center">
                            {t('no_tournaments')}
                        </Text>
                    </View>
                ) : (
                    <View className="pb-24">
                        {localTournaments.map((item) => (
                            <React.Fragment key={item.id}>
                                {renderLocalItem({ item })}
                            </React.Fragment>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Твоя кнопка добавления турнира */}
            <TouchableOpacity
                onPress={() => navigation.navigate('Details')}
                className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full justify-center items-center shadow-lg"
            >
                <Plus size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};