import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export interface ProTournament {
    id: number;
    name: string;
    status: string | null;
    tier: string;
    begin_at: string | null;
    end_at: string | null;
    prizepool: string | null;
    league: {
        name: string;
        image_url: string | null;
    };
    // ДОБАВИЛИ id СЮДА:
    teams: { id: number; name: string; image_url: string | null }[];
}

// --- НОВЫЕ ДАННЫЕ ДЛЯ ИГРОКОВ ---
export interface Player {
    id: number;
    name: string; // Никнейм (s1mple, m0NESY)
    first_name: string | null; // Имя
    last_name: string | null;  // Фамилия
    image_url: string | null;  // Фотка
    nationality: string | null; // Страна (RU, UA, FR и тд)
}

export interface TeamDetails {
    id: number;
    name: string;
    image_url: string | null;
    players: Player[];
}

const API_KEY = 'Fga12TTcwWPX8XnU1Toq8mfZ5dMKIi7cCHlPJaLr7iTX70pCMpU';
const API_URL = 'https://api.pandascore.co/csgo/tournaments?per_page=5&filter[tier]=s,a&sort=-begin_at';
const CACHE_KEY = '@pro_tournaments_cache';

export const fetchTeamDetails = async (teamId: number): Promise<TeamDetails | null> => {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return null; // Если нет инета, игроков не грузим

    try {
        const response = await axios.get(`https://api.pandascore.co/teams/${teamId}`, {
            headers: { Authorization: `Bearer ${API_KEY}` }
        });
        return response.data;
    } catch (error) {
        console.warn("Ошибка при загрузке команды", error);
        return null;
    }
};

export const fetchProTournaments = async (): Promise<{ data: ProTournament[], isOffline: boolean }> => {
    // Пункт 3: Мониторинг сети
    const netState = await NetInfo.fetch();
    const isConnected = netState.isConnected;

    if (isConnected) {
        try {
            // Пункт 2: Web-API (Получаем турниры по CS2)
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${API_KEY}` }
            });
            const tournaments = response.data;

            // Пункт 4: Кэширование (Оффлайн-режим)
            await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(tournaments));
            return { data: tournaments, isOffline: false };
        } catch (error) {
            console.warn("API Error, fallback to cache", error);
        }
    }

    // Пункт 4: Достаем из кэша, если нет инета
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
        return { data: JSON.parse(cached), isOffline: true };
    }

    return { data: [], isOffline: true };
};