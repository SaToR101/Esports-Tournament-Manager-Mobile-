import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Moon, Sun, Check, LogOut } from 'lucide-react-native';
import clsx from 'clsx';
import { useSettings } from '../hooks/useSettings';
// Импорты для выхода
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

export const SettingsScreen = () => {
  const { theme, toggleTheme, language, setLanguage, t } = useSettings();

  return (
      <ScrollView className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
        <View className="space-y-6">

          {/* Theme Section */}
          <View>
            <Text className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {t('theme')}
            </Text>
            <View className="rounded-xl overflow-hidden shadow-sm border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
              <TouchableOpacity onPress={toggleTheme} className="w-full flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                  {theme === 'dark' ? <Moon size={20} color="#6366f1" style={{ marginRight: 12 }} /> : <Sun size={20} color="#f97316" style={{ marginRight: 12 }} />}
                  <Text className="font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    {theme === 'dark' ? t('dark') : t('light')}
                  </Text>
                </View>
                <View className={clsx("w-11 h-6 rounded-full justify-center", theme === 'dark' ? "bg-indigo-600" : "bg-gray-200")}>
                  <View className={clsx("bg-white h-5 w-5 rounded-full shadow-sm", theme === 'dark' ? "self-end mr-0.5" : "self-start ml-0.5")} />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Language Section */}
          <View>
            <Text className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
              {t('language')}
            </Text>
            <View className="rounded-xl overflow-hidden shadow-sm border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
              <TouchableOpacity onPress={() => setLanguage('ru')} className="w-full flex-row items-center justify-between p-4 border-b" style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">🇷🇺</Text>
                  <Text className="font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{t('russian')}</Text>
                </View>
                {language === 'ru' && <Check size={20} color="#4f46e5" />}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setLanguage('en')} className="w-full flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                  <Text className="text-2xl mr-3">🇺🇸</Text>
                  <Text className="font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{t('english')}</Text>
                </View>
                {language === 'en' && <Check size={20} color="#4f46e5" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* Кнопка Выйти */}
          <TouchableOpacity
              onPress={() => signOut(auth)}
              className="w-full bg-red-500 py-4 rounded-xl items-center shadow-md mt-6 flex-row justify-center"
          >
            <LogOut size={20} color="white" className="mr-2" />
            <Text className="text-white font-bold text-lg">{t('logout') || 'Выйти'}</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
  );
};