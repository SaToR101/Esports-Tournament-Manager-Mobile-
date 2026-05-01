import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ScrollView, TextInput } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Calendar, ChevronRight, Settings, Trophy, Search, ArrowDownAZ, CalendarDays } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Tournament } from '../lib/storage';
import { useHomeScreen } from '../hooks/useHomeScreen';
import { ProTournament } from '../services/api';

export const HomeScreen = ({ navigation }: any) => {
    const { t } = useLanguage();
    const { theme } = useTheme();

    const {
        localTournaments, // Теперь это уже отфильтрованный список!
        proTournaments,   // И это тоже!
        refreshing,
        isOffline,
        loadAllData,
        onRefresh,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy
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

    const renderProItem = ({ item }: { item: ProTournament }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ProDetails', { tournament: item })}
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
            {isOffline && (
                <View className="bg-red-500 py-2 px-4 items-center justify-center flex-row z-50">
                    <Text className="text-white text-xs font-bold ml-2">{t('offline_warning')}</Text>
                </View>
            )}

            {/* --- ПАНЕЛЬ ПОИСКА И ФИЛЬТРОВ --- */}
            <View className="px-4 pt-4 pb-2">
                {/* Строка поиска */}
                <View
                    className="flex-row items-center px-3 py-2 rounded-xl border mb-3"
                    style={{
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb'
                    }}
                >
                    <Search size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-2 py-1 text-base"
                        style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                        placeholder= {t('t_search')}
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Кнопки сортировки */}
                <View className="flex-row space-x-2">
                    <TouchableOpacity
                        onPress={() => setSortBy('date')}
                        className={`flex-row items-center px-4 py-2 rounded-lg border ${sortBy === 'date' ? 'bg-indigo-100 border-indigo-500' : ''}`}
                        style={{
                            backgroundColor: sortBy === 'date' ? (theme === 'dark' ? '#3730a3' : '#e0e7ff') : (theme === 'dark' ? '#1f2937' : '#ffffff'),
                            borderColor: sortBy === 'date' ? '#6366f1' : (theme === 'dark' ? '#374151' : '#e5e7eb')
                        }}
                    >
                        <CalendarDays size={16} color={sortBy === 'date' ? (theme === 'dark' ? '#a5b4fc' : '#4f46e5') : '#9ca3af'} />
                        <Text className="ml-2 font-medium" style={{ color: sortBy === 'date' ? (theme === 'dark' ? '#ffffff' : '#4f46e5') : '#9ca3af' }}>
                            {t('by_date')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setSortBy('name')}
                        className={`flex-row items-center px-4 py-2 rounded-lg border ml-2 ${sortBy === 'name' ? 'bg-indigo-100 border-indigo-500' : ''}`}
                        style={{
                            backgroundColor: sortBy === 'name' ? (theme === 'dark' ? '#3730a3' : '#e0e7ff') : (theme === 'dark' ? '#1f2937' : '#ffffff'),
                            borderColor: sortBy === 'name' ? '#6366f1' : (theme === 'dark' ? '#374151' : '#e5e7eb')
                        }}
                    >
                        <ArrowDownAZ size={16} color={sortBy === 'name' ? (theme === 'dark' ? '#a5b4fc' : '#4f46e5') : '#9ca3af'} />
                        <Text className="ml-2 font-medium" style={{ color: sortBy === 'name' ? (theme === 'dark' ? '#ffffff' : '#4f46e5') : '#9ca3af' }}>
                            {t('by_alphabet')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* --------------------------------- */}

            <ScrollView
                className="flex-1 p-4"
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme === 'dark' ? '#ffffff' : '#000000'} />}
            >
                <Text className="font-bold text-lg mb-3" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                    {t('pro_tournaments')}
                </Text>
                <View className="mb-6">
                    {proTournaments.length === 0 ? (
                        // Если ввели в поиск фигню и ничего не нашлось
                        <Text style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Ничего не найдено</Text>
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

                <Text className="font-bold text-lg mb-3" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                    {t('my_tournaments') || 'Мои турниры'}
                </Text>

                {localTournaments.length === 0 ? (
                    <View className="py-10 items-center">
                        <Text style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} className="text-center">
                            {searchQuery ? 'Ничего не найдено' : t('no_tournaments')}
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

            <TouchableOpacity
                onPress={() => navigation.navigate('Details')}
                className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full justify-center items-center shadow-lg"
            >
                <Plus size={24} color="white" />
            </TouchableOpacity>
        </View>
    );
};