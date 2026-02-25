import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, Calendar, ChevronRight, Settings } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getTournaments, Tournament } from '../lib/storage';
import clsx from 'clsx';

export const HomeScreen = ({ navigation }: any) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    const data = await getTournaments();
    setTournaments(data);
  };

  useFocusEffect(
      useCallback(() => {
        loadData();
      }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="p-2">
            <Settings size={24} color={theme === 'dark' ? '#fff' : '#000'} />
          </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  const renderItem = ({ item }: { item: Tournament }) => (
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
            <Text className="text-xs text-gray-400 ml-1">
              {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color="#9ca3af" />
      </TouchableOpacity>
  );

  return (
      <View className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
        {tournaments.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <Text style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }} className="text-center mb-4">
                {t('no_tournaments')}
              </Text>
            </View>
        ) : (
            <FlatList
                data={tournaments}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme === 'dark' ? '#ffffff' : '#000000'} />}
                contentContainerStyle={{ paddingBottom: 80 }}
            />
        )}

        <TouchableOpacity
            onPress={() => navigation.navigate('Details')}
            className="absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full justify-center items-center shadow-lg"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>
  );
};
