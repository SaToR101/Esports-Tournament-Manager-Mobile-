import { useState, useCallback } from 'react';
import { getTournaments, Tournament as LocalTournament } from '../lib/storage';
import { fetchProTournaments, ProTournament } from '../services/api';

export const useHomeScreen = () => {
    // Стейты для твоих локальных турниров
    const [localTournaments, setLocalTournaments] = useState<LocalTournament[]>([]);
    // Стейты для API турниров
    const [proTournaments, setProTournaments] = useState<ProTournament[]>([]);

    const [refreshing, setRefreshing] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    // Пункт 1: Архитектура MVVM (Вся бизнес-логика тут)
    const loadAllData = useCallback(async () => {
        // Грузим твои турниры из хранилища
        const localData = await getTournaments();
        setLocalTournaments(localData);

        // Грузим CS2 турниры из PandaScore API
        const proData = await fetchProTournaments();
        setProTournaments(proData.data);
        setIsOffline(proData.isOffline);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    return {
        localTournaments,
        proTournaments,
        refreshing,
        isOffline,
        loadAllData,
        onRefresh
    };
};