import { useState, useCallback, useMemo } from 'react';
import { getTournaments, Tournament as LocalTournament } from '../lib/storage';
import { fetchProTournaments, ProTournament } from '../services/api';
import Fuse from 'fuse.js';

export type SortType = 'date' | 'name';

export const useHomeScreen = () => {
    const [localTournaments, setLocalTournaments] = useState<LocalTournament[]>([]);
    const [proTournaments, setProTournaments] = useState<ProTournament[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    // Новые стейты для Лабы 3
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('date');

    const loadAllData = useCallback(async () => {
        const localData = await getTournaments();
        setLocalTournaments(localData);

        const proData = await fetchProTournaments();
        setProTournaments(proData.data);
        setIsOffline(proData.isOffline);
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadAllData();
        setRefreshing(false);
    };

    // АЛГОРИТМ: Нечеткий поиск и сортировка для ПРО-турниров
    const processedProTournaments = useMemo(() => {
        let result = [...proTournaments];

        if (searchQuery) {
            const fuse = new Fuse(result, {
                keys: ['name', 'league.name'],
                threshold: 0.4,
            });
            result = fuse.search(searchQuery).map(res => res.item);
        }

        result.sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            const dateA = new Date(a.begin_at || 0).getTime();
            const dateB = new Date(b.begin_at || 0).getTime();
            return dateB - dateA; // По дате (сначала новые)
        });

        return result;
    }, [proTournaments, searchQuery, sortBy]);

    // АЛГОРИТМ: Нечеткий поиск и сортировка для ЛОКАЛЬНЫХ турниров
    const processedLocalTournaments = useMemo(() => {
        let result = [...localTournaments];

        if (searchQuery) {
            const fuse = new Fuse(result, {
                keys: ['title', 'description'],
                threshold: 0.4,
            });
            result = fuse.search(searchQuery).map(res => res.item);
        }

        result.sort((a, b) => {
            if (sortBy === 'name') return a.title.localeCompare(b.title);
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA;
        });

        return result;
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