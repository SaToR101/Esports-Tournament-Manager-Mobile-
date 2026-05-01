import React, { useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Save, Trash2, Calendar, ImagePlus } from 'lucide-react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTournamentDetails } from '../hooks/useTournamentDetails';

export const DetailsScreen = ({ route, navigation }: any) => {
    const { id } = route.params || {};
    const { t } = useLanguage();
    const { theme } = useTheme();

    const {
        formData,
        setFormData,
        handleSave,
        handleDelete,
        isNew,
        pickImage,
        isSaving,
        isLoading
    } = useTournamentDetails(id, navigation, t);

    useLayoutEffect(() => {
        if (!isNew) {
            navigation.setOptions({
                headerRight: () => (
                    // Скрываем корзину, пока идет загрузка или сохранение
                    isSaving || isLoading ? null : (
                        <TouchableOpacity onPress={handleDelete} className="p-2">
                            <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                    )
                ),
            });
        }
    }, [navigation, isNew, id, handleDelete, isSaving, isLoading]);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="mt-4" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                    {t('loading')}
                </Text>
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>

            <View className="items-center mb-6 mt-2">
                <TouchableOpacity
                    onPress={pickImage}
                    disabled={isSaving} // Блокируем смену картинки при сохранении
                    className={`w-32 h-32 rounded-full border-2 border-dashed items-center justify-center overflow-hidden ${isSaving ? 'opacity-50' : ''}`}
                    style={{
                        borderColor: theme === 'dark' ? '#4f46e5' : '#6366f1',
                        backgroundColor: theme === 'dark' ? '#1f2937' : '#e0e7ff'
                    }}
                >
                    {formData.image ? (
                        <Image source={{ uri: formData.image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="items-center">
                            <ImagePlus size={32} color={theme === 'dark' ? '#a5b4fc' : '#4f46e5'} />
                            <Text className="text-xs mt-2 text-center" style={{ color: theme === 'dark' ? '#a5b4fc' : '#4f46e5' }}>
                                {t('select_image')}
                            </Text>
                        </View>
                    )}
                </TouchableOpacity>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('title')}</Text>
                    <TextInput
                        value={formData.title}
                        onChangeText={(text) => setFormData({ ...formData, title: text })}
                        editable={!isSaving} // 🔥 ЗАМОРАЖИВАЕМ ПОЛЕ
                        className={`w-full p-3 rounded-xl border ${isSaving ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? '#ffffff' : '#111827' }}
                        placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#6b7280'}
                    />
                </View>

                <View>
                    <Text className="text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('date')} (YYYY-MM-DD)</Text>
                    <View className="relative">
                        <TextInput
                            value={formData.date}
                            onChangeText={(text) => setFormData({ ...formData, date: text })}
                            editable={!isSaving}
                            className={`w-full p-3 pl-10 rounded-xl border ${isSaving ? 'opacity-50' : ''}`}
                            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? '#ffffff' : '#111827' }}
                        />
                        <View className="absolute left-3 top-3.5">
                            <Calendar size={18} color="#9ca3af" />
                        </View>
                    </View>
                </View>

                <View>
                    <Text className="text-sm font-medium mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('description')}</Text>
                    <TextInput
                        multiline
                        numberOfLines={4}
                        value={formData.description}
                        onChangeText={(text) => setFormData({ ...formData, description: text })}
                        editable={!isSaving}
                        className={`w-full p-3 rounded-xl border ${isSaving ? 'opacity-50' : ''}`}
                        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? '#ffffff' : '#111827' }}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={isSaving}
                    className={`w-full py-3 px-4 rounded-xl shadow-md flex-row items-center justify-center mt-8 ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                >
                    {isSaving ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <Save size={20} color="white" className="mr-2" />
                            <Text className="text-white font-semibold text-lg ml-2">{t('save')}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};