import { useState, useEffect } from 'react';
import { Alert, Vibration } from 'react-native';
import { getTournamentById, saveTournament, deleteTournament } from '../lib/storage';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

export const useTournamentDetails = (id: string | undefined, navigation: any, t: any) => {
    const isNew = !id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        image: '',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isNew && id) {
            setIsLoading(true);
            getTournamentById(id).then((data) => {
                if (data) {
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        date: data.date || '',
                        image: data.image || '',
                    });
                }
                setIsLoading(false);
            });
        }
    }, [id, isNew]);

    // 1. ПУНКТ 3: ИСПОЛЬЗОВАНИЕ КАМЕРЫ УСТРОЙСТВА
    const openCamera = async () => {
        Vibration.vibrate(50); // Тактильный отклик (Platform API)
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return Alert.alert(t('error'), 'Нужно разрешение на использование камеры');

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.05,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setFormData({ ...formData, image: imageUri });
        }
    };

    // 2. ИСПОЛЬЗОВАНИЕ ГАЛЕРЕИ
    const openGallery = async () => {
        Vibration.vibrate(50); // Тактильный отклик
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.05,
            base64: true,
        });

        if (!result.canceled && result.assets && result.assets[0].base64) {
            const imageUri = `data:image/jpeg;base64,${result.assets[0].base64}`;
            setFormData({ ...formData, image: imageUri });
        }
    };

    const handleSave = async () => {
        if (!formData.title) return Alert.alert(t('error'), t('title_required'));
        if (isSaving) return;
        setIsSaving(true);

        try {
            const tournamentDate = new Date(formData.date);
            const today = new Date();
            let delay = 0;

            if (tournamentDate.toDateString() === today.toDateString() || tournamentDate < today) {
                delay = 5000;
            } else {
                tournamentDate.setHours(10, 0, 0, 0);
                delay = tournamentDate.getTime() - today.getTime();
            }

            if (delay > 0) {
                setTimeout(() => {
                    Toast.show({
                        type: 'success',
                        text1: t('reminder_title'),
                        text2: t('reminder_body').replace('TITLE', formData.title),
                        position: 'top',
                        visibilityTime: 5000,
                    });
                }, delay);
            }

            await saveTournament({ id: isNew ? undefined : id, ...formData });
            if (navigation.canGoBack()) navigation.goBack();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = () => {
        Alert.alert(t('delete_tournament'), t('delete_confirm'), [
            { text: t('cancel'), style: 'cancel' },
            {
                text: t('delete_tournament'),
                style: 'destructive',
                onPress: async () => {
                    setIsSaving(true);
                    await deleteTournament(id as string);
                    if (navigation.canGoBack()) navigation.goBack();
                }
            }
        ]);
    };

    // Возвращаем функции камеры и галереи
    return { formData, setFormData, handleSave, handleDelete, isNew, openCamera, openGallery, isSaving, isLoading };
};