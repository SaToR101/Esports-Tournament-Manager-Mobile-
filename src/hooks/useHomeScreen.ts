import { useState, useCallback, useMemo, useEffect } from 'react';
// Импортируем нашу функцию подписки
import { subscribeToTournaments, Tournament as LocalTournament } from '../lib/storage';
import { fetchProTournaments, ProTournament } from '../services/api';
import Fuse from 'fuse.js';

export type SortType = 'date' | 'name';

export const useHomeScreen = () => {
    const [localTournaments, setLocalTournaments] = useState<LocalTournament[]>([]);
    const [proTournaments, setProTournaments] = useState<ProTournament[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortType>('date');

    // --- REAL-TIME ПОДПИСКА (ПУНКТ 2) ---
    useEffect(() => {
        // Подписываемся на базу данных при запуске экрана
        const unsubscribe = subscribeToTournaments((data) => {
            // Как только в базе что-то меняется, Firebase сам присылает нам новые данные
            setLocalTournaments(data || []);
        });

        // Отписываемся, если компонент удаляется
        return () => unsubscribe();
    }, []);
    // ------------------------------------

    const loadAllData = useCallback(async () => {
        try {
            // Теперь здесь грузим ТОЛЬКО Pro турниры из API,
            // потому что локальные турниры грузятся сами через Real-time подписку выше!
            const proData = await fetchProTournaments();
            setProTournaments(proData?.data || []);
            setIsOffline(proData?.isOffline || false);
        } catch (error) {
            console.error("Ошибка загрузки Pro-данных:", error);
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
                const fuse = new Fuse(result, {
                    keys: ['name', 'league.name'],
                    threshold: 0.4,
                });
                result = fuse.search(searchQuery).map(res => res.item);
            }

            result.sort((a, b) => {
                if (sortBy === 'name') {
                    const nameA = a.name || '';
                    const nameB = b.name || '';
                    return nameA.localeCompare(nameB);
                }
                const dateA = new Date(a.begin_at || 0).getTime();
                const dateB = new Date(b.begin_at || 0).getTime();
                return dateB - dateA;
            });

            return result;
        } catch (error) {
            return proTournaments;
        }
    }, [proTournaments, searchQuery, sortBy]);

    // БЕЗОПАСНЫЙ ПОИСК ДЛЯ ЛОКАЛЬНЫХ ТУРНИРОВ
    const processedLocalTournaments = useMemo(() => {
        try {
            if (!localTournaments.length) return [];
            let result = [...localTournaments];

            if (searchQuery) {
                const fuse = new Fuse(result, {
                    keys: ['title', 'description'],
                    threshold: 0.4,
                });
                result = fuse.search(searchQuery).map(res => res.item);
            }

            result.sort((a, b) => {
                if (sortBy === 'name') {
                    const titleA = a.title || '';
                    const titleB = b.title || '';
                    return titleA.localeCompare(titleB);
                }
                const dateA = new Date(a.date || 0).getTime();
                const dateB = new Date(b.date || 0).getTime();
                return dateB - dateA;
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