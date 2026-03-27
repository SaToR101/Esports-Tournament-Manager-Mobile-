import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { getTournamentById, saveTournament, deleteTournament } from '../lib/storage';

export const useTournamentDetails = (id: string | undefined, navigation: any, t: any) => {
    const isNew = !id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        if (!isNew && id) {
            getTournamentById(id).then((data) => {
                if (data) {
                    setFormData({
                        title: data.title || '',
                        description: data.description || '',
                        date: data.date || '',
                    });
                }
            });
        }
    }, [id, isNew]);

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

    return { formData, setFormData, handleSave, handleDelete, isNew };
};