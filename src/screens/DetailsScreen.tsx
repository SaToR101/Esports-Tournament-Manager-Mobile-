import React, { useLayoutEffect, useState } from 'react';
// ДОБАВИЛИ Share СЮДА
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Modal, Share } from 'react-native';
// ДОБАВИЛИ Share2 СЮДА
import { Save, Trash2, Calendar, ImagePlus, Camera, Image as ImageIcon, X, Share2 } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTournamentDetails } from '../hooks/useTournamentDetails';

export const DetailsScreen = ({ route, navigation }: any) => {
    const { id } = route.params || {};
    const { t } = useLanguage();
    const { theme } = useTheme();

    const [isModalVisible, setModalVisible] = useState(false);

    const {
        formData,
        setFormData,
        handleSave,
        handleDelete,
        isNew,
        openCamera,
        openGallery,
        isSaving,
        isLoading
    } = useTournamentDetails(id, navigation, t);

    useLayoutEffect(() => {
        if (!isNew) {
            navigation.setOptions({
                headerRight: () => (
                    isSaving || isLoading ? null : (
                        <TouchableOpacity onPress={handleDelete} className="p-2">
                            <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                    )
                ),
            });
        }
    }, [navigation, isNew, id, handleDelete, isSaving, isLoading]);

    const handleCameraPress = () => {
        setModalVisible(false);
        setTimeout(openCamera, 300);
    };

    const handleGalleryPress = () => {
        setModalVisible(false);
        setTimeout(openGallery, 300);
    };

    // --- ФУНКЦИЯ ПОДЕЛИТЬСЯ ДЛЯ ЛОКАЛЬНЫХ ТУРНИРОВ ---
    const handleShare = async () => {
        try {
            // Подставляем данные из формы (даже если турнир еще не сохранен)
            let message = t('share_local_text')
                .replace('TITLE', formData.title || 'Без названия')
                .replace('DATE', formData.date || t('tba'))
                .replace('DESC', formData.description || 'Без описания');

            await Share.share({
                message: message,
            });
        } catch (error) {
            console.error("Ошибка при шаринге:", error);
        }
    };

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
        <>
            <KeyboardAwareScrollView
                className="flex-1 p-4"
                style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}
                enableOnAndroid={true}
                extraScrollHeight={20}
            >
                <View className="items-center mb-6 mt-2">
                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        disabled={isSaving}
                        className={`w-32 h-32 rounded-full border-2 border-dashed items-center justify-center overflow-hidden ${isSaving ? 'opacity-50' : ''}`}
                        style={{ borderColor: theme === 'dark' ? '#4f46e5' : '#6366f1', backgroundColor: theme === 'dark' ? '#1f2937' : '#e0e7ff' }}
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
                            editable={!isSaving}
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

                    {/* --- РАЗДЕЛ С КНОПКАМИ --- */}
                    <View className="mt-8 mb-10 space-y-3">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={isSaving}
                            className={`w-full py-3 px-4 rounded-xl shadow-md flex-row items-center justify-center ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600'}`}
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

                        {/* ПОКАЗЫВАЕМ КНОПКУ ПОДЕЛИТЬСЯ ТОЛЬКО ДЛЯ УЖЕ СОЗДАННЫХ ТУРНИРОВ */}
                        {!isNew && (
                            <TouchableOpacity
                                onPress={handleShare}
                                disabled={isSaving}
                                className={`w-full py-3 px-4 rounded-xl border flex-row items-center justify-center ${isSaving ? 'opacity-50' : ''}`}
                                style={{ borderColor: theme === 'dark' ? '#4f46e5' : '#6366f1' }}
                            >
                                <Share2 size={20} color={theme === 'dark' ? '#818cf8' : '#4f46e5'} className="mr-2" />
                                <Text className="font-semibold text-lg ml-2" style={{ color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>
                                    {t('share')}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </KeyboardAwareScrollView>

            {/* --- КРАСИВАЯ ШТОРКА (MODAL) --- */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    className="flex-1 justify-end bg-black/50"
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View
                        className="rounded-t-3xl p-6"
                        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
                    >
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                {t('select_image')}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={handleCameraPress}
                            className="flex-row items-center p-4 mb-3 rounded-xl border"
                            style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb', borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb' }}
                        >
                            <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-4">
                                <Camera size={20} color="#4f46e5" />
                            </View>
                            <Text className="text-lg font-medium" style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                                {t('take_photo')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleGalleryPress}
                            className="flex-row items-center p-4 mb-6 rounded-xl border"
                            style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb', borderColor: theme === 'dark' ? '#4b5563' : '#e5e7eb' }}
                        >
                            <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-4">
                                <ImageIcon size={20} color="#16a34a" />
                            </View>
                            <Text className="text-lg font-medium" style={{ color: theme === 'dark' ? '#e5e7eb' : '#374151' }}>
                                {t('choose_gallery')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};