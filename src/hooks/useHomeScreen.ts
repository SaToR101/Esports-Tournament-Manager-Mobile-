import { useState, useCallback, useMemo } from 'react';
import { getTournaments, Tournament as LocalTournament } from '../lib/storage';
import { fetchProTournaments, ProTournament } from '../services/api';
import Fuse from 'fuse.js';
import { useFocusEffect } from '@react-navigation/native'; // Для обновления при возврате на экран

export type SortType = 'date' | 'name';

export const useHomeScreen = () => {
    const [localTournaments, setLocalTournaments] = useState<LocalTournament[]>([]);
    const [proTournaments, setProTournaments] = useState<ProTournament[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('date');

    const loadAllData = useCallback(async () => {
        try {
            // Грузим наши SQL турниры из Supabase
            const localData = await getTournaments();
            setLocalTournaments(localData || []);

            // Грузим Pro турниры из API
            const proData = await fetchProTournaments();
            setProTournaments(proData?.data || []);
            setIsOffline(proData?.isOffline || false);
        } catch (error) {
            console.error("Ошибка загрузки данных:", error);
        }
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    // БЕЗОПАСНЫЙ ПОИСК ДЛЯ PRO ТУРНИРОВ
    const processedProTournaments = useMemo(() => {
        try {
            if (!proTournaments.length) return [];
            let result = [...proTournaments];

            if (searchQuery) {
                const fuse = new Fuse(result, { keys: ['name', 'league.name'], threshold: 0.4 });
                result = fuse.search(searchQuery).map(res => res.item);
            }

            result.sort((a, b) => {
                if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
                return new Date(b.begin_at || 0).getTime() - new Date(a.begin_at || 0).getTime();
            });

            return result;
        } catch (error) {
            return proTournaments;
        }
    }, [proTournaments, searchQuery, sortBy]);

    // БЕЗОПАСНЫЙ ПОИСК ДЛЯ ЛОКАЛЬНЫХ ТУРНИРОВ (SQL)
    const processedLocalTournaments = useMemo(() => {
        try {
            if (!localTournaments.length) return [];
            let result = [...localTournaments];

            if (searchQuery) {
                const fuse = new Fuse(result, { keys: ['title', 'description'], threshold: 0.4 });
                result = fuse.search(searchQuery).map(res => res.item);
            }

            result.sort((a, b) => {
                if (sortBy === 'name') return (a.title || '').localeCompare(b.title || '');
                return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
            });

            return result;
        } catch (error) {
            return localTournaments;
        }
    }, [localTournaments, searchQuery, sortBy]);

    return {
        localTournaments: processedLocalTournaments,
        proTournaments: processedProTournaments,
        refreshing,
        isOffline,
        loadAllData,
        onRefresh,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy
    };
};