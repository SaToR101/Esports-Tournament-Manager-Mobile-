import { useState, useCallback } from 'react';
import { Alert, Vibration } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <-- ДОБАВЛЕНО
import { getTournamentById, saveTournament, deleteTournament, getGames, getFormats, getSponsors, getTeams, getMatchesByTournament, Game, Format, Sponsor, Team, Match } from '../lib/storage';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

export const useTournamentDetails = (id: string | undefined, navigation: any, t: any) => {
    const isNew = !id;

    const [formData, setFormData] = useState({
        title: '', description: '', date: new Date().toISOString().split('T')[0],
        image: '', game_id: null as number | null, format_id: null as number | null,
        sponsor_ids: [] as number[], team_ids: [] as number[],
    });

    const [games, setGames] = useState<Game[]>([]);
    const [formats, setFormats] = useState<Format[]>([]);
    const [allSponsors, setAllSponsors] = useState<Sponsor[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isTeamsOpen, setIsTeamsOpen] = useState(false);

    // --- ИСПОЛЬЗУЕМ useFocusEffect ДЛЯ АВТООБНОВЛЕНИЯ МАТЧЕЙ ---
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                setIsLoading(true);
                try {
                    const [g, f, s, tm] = await Promise.all([getGames(), getFormats(), getSponsors(), getTeams()]);
                    setGames(g || []); setFormats(f || []); setAllSponsors(s || []); setAllTeams(tm || []);

                    if (!isNew && id) {
                        const [data, tournamentMatches] = await Promise.all([
                            getTournamentById(id),
                            getMatchesByTournament(Number(id))
                        ]);
                        if (data) {
                            setFormData({
                                title: data.title || '', description: data.description || '',
                                date: data.date || new Date().toISOString().split('T')[0],
                                image: data.image || '', game_id: data.game_id || null,
                                format_id: data.format_id || null,
                                sponsor_ids: data.sponsor_ids || [], team_ids: data.team_ids || [],
                            });
                        }
                        setMatches(tournamentMatches || []);
                    }
                } catch (error) { console.error(error); } finally { setIsLoading(false); }
            };
            loadData();
        }, [id, isNew])
    );

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setFormData(prev => ({ ...prev, date: selectedDate.toISOString().split('T')[0] }));
    };

    const toggleSponsor = (sId: number) => {
        Vibration.vibrate(10);
        setFormData(prev => ({ ...prev, sponsor_ids: prev.sponsor_ids.includes(sId) ? prev.sponsor_ids.filter(i => i !== sId) : [...prev.sponsor_ids, sId] }));
    };

    const toggleTeam = (tId: number) => {
        Vibration.vibrate(10);
        setFormData(prev => ({ ...prev, team_ids: prev.team_ids.includes(tId) ? prev.team_ids.filter(i => i !== tId) : [...prev.team_ids, tId] }));
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') return;
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.1, base64: true });
        if (!result.canceled && result.assets) setFormData(prev => ({ ...prev, image: `data:image/jpeg;base64,${result.assets[0].base64}` }));
    };

    const openGallery = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.1, base64: true });
        if (!result.canceled && result.assets) setFormData(prev => ({ ...prev, image: `data:image/jpeg;base64,${result.assets[0].base64}` }));
    };

    const handleSave = async () => {
        if (!formData.title) return Alert.alert(t('error'), t('title_required'));
        setIsSaving(true);
        try {
            await saveTournament({ id: isNew ? undefined : Number(id), ...formData });
            if (navigation.canGoBack()) navigation.goBack();
        } catch (e) { console.error(e); } finally { setIsSaving(false); }
    };

    const handleDelete = () => {
        Alert.alert(t('delete_tournament'), t('delete_confirm'), [{ text: t('cancel'), style: 'cancel' }, {
            text: t('delete_tournament'), style: 'destructive', onPress: async () => {
                setIsSaving(true);
                if (id) await deleteTournament(id);
                if (navigation.canGoBack()) navigation.goBack();
            }
        }]);
    };

    return {
        formData, setFormData, handleSave, handleDelete, isNew, openCamera, openGallery,
        isSaving, isLoading, games, formats, allSponsors, toggleSponsor, allTeams, toggleTeam,
        showDatePicker, setShowDatePicker, onDateChange, isTeamsOpen, setIsTeamsOpen, matches
    };
};