import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Save, Trash2, Calendar } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getTournamentById, saveTournament, deleteTournament } from '../lib/storage';

export const DetailsScreen = ({ route, navigation }: any) => {
  const { id } = route.params || {};
  const { t } = useLanguage();
  const { theme } = useTheme();
  const isNew = !id;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!isNew) {
      getTournamentById(id).then((data) => {
        if (data) {
          setFormData({
            title: data.title,
            description: data.description,
            date: data.date,
          });
        }
      });
    }
  }, [id]);

  const handleSave = async () => {
    if (!formData.title) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    await saveTournament({
      id: isNew ? undefined : id,
      ...formData,
    });
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
        t('delete_tournament'),
        t('delete_confirm'),
        [
          { text: t('cancel'), style: 'cancel' },
          {
            text: t('delete_tournament'),
            style: 'destructive',
            onPress: async () => {
              if (id) await deleteTournament(id);
              navigation.goBack();
            }
          },
        ]
    );
  };

  React.useLayoutEffect(() => {
    if (!isNew) {
      navigation.setOptions({
        headerRight: () => (
            <TouchableOpacity onPress={handleDelete} className="p-2">
              <Trash2 size={20} color="#ef4444" />
            </TouchableOpacity>
        ),
      });
    }
  }, [navigation, isNew, id]);

  return (
      <ScrollView className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              {t('title')}
            </Text>
            <TextInput
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                className="w-full p-3 rounded-xl border"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  color: theme === 'dark' ? '#ffffff' : '#111827'
                }}
                placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            />
          </View>

          <View>
            <Text className="text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              {t('date')} (YYYY-MM-DD)
            </Text>
            <View className="relative">
              <TextInput
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                  className="w-full p-3 pl-10 rounded-xl border"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                    color: theme === 'dark' ? '#ffffff' : '#111827'
                  }}
                  placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
              />
              <View className="absolute left-3 top-3.5">
                <Calendar size={18} color="#9ca3af" />
              </View>
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
              {t('description')}
            </Text>
            <TextInput
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                className="w-full p-3 rounded-xl border"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db',
                  color: theme === 'dark' ? '#ffffff' : '#111827'
                }}
                textAlignVertical="top"
                placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
            />
          </View>

          <TouchableOpacity
              onPress={handleSave}
              className="w-full bg-indigo-600 py-3 px-4 rounded-xl shadow-md flex-row items-center justify-center mt-8"
          >
            <Save size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold text-lg ml-2">{t('save')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
  );
};
