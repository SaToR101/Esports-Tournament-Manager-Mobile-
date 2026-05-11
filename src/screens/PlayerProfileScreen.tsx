import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image } from 'react-native';
import { User, Zap, Target, BarChart3, Activity, Award } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getFullPlayerProfile } from '../lib/storage';

export const PlayerProfileScreen = ({ route }: any) => {
    const { playerId, nickname } = route.params;
    const { theme } = useTheme();
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        getFullPlayerProfile(playerId).then(setStats);
    }, [playerId]);

    // --- ЛОГИКА ЦВЕТОВ (HLTV STYLE) ---
    const getStatColor = (val: number, type: string) => {
        // Пороги для Rating 2.0
        if (type === 'rating') {
            if (val >= 1.15) return '#10b981'; // Ярко-зеленый
            if (val >= 1.05) return '#84cc16'; // Салатовый
            if (val >= 0.95) return '#f59e0b'; // Желтый
            return '#ef4444'; // Красный
        }
        // Пороги для K/D
        if (type === 'kd') {
            if (val >= 1.20) return '#10b981';
            if (val >= 1.00) return '#84cc16';
            if (val >= 0.90) return '#f59e0b';
            return '#ef4444';
        }
        // Пороги для ADR (Средний урон)
        if (type === 'adr') {
            if (val >= 85) return '#10b981';
            if (val >= 75) return '#84cc16';
            if (val >= 68) return '#f59e0b';
            return '#ef4444';
        }
        // Пороги для Impact
        if (type === 'impact') {
            if (val >= 1.25) return '#10b981';
            if (val >= 1.05) return '#84cc16';
            if (val >= 0.90) return '#f59e0b';
            return '#ef4444';
        }
        // Пороги для Headshots %
        if (type === 'hs') {
            if (val >= 55) return '#10b981';
            if (val >= 45) return '#84cc16';
            if (val >= 38) return '#f59e0b';
            return '#ef4444';
        }
        return '#6366f1'; // Дефолтный индиго
    };

    if (!stats) return <View className="flex-1 justify-center"><ActivityIndicator size="large" color="#6366f1" /></View>;

    const StatCard = ({ label, value, icon: Icon, type }: any) => {
        const valNum = parseFloat(value);
        const color = getStatColor(valNum, type);
        return (
            <View className="w-[48%] p-6 rounded-[32px] mb-4 border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#eee' }}>
                <View className="flex-row items-center mb-3">
                    <View className="p-2 rounded-xl" style={{backgroundColor: color + '15'}}>
                        <Icon size={18} color={color} />
                    </View>
                </View>
                <Text className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{label}</Text>
                <Text className="text-3xl font-black mt-1" style={{ color: color }}>{value}</Text>
            </View>
        );
    };

    return (
        <ScrollView className="flex-1" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
            {/* ШАПКА ПРОФИЛЯ */}
            <View className="items-center py-10 bg-indigo-600/5 border-b border-indigo-600/10">
                <View className="w-32 h-32 bg-indigo-600 rounded-full items-center justify-center mb-4 shadow-2xl border-4 border-white">
                    <User size={64} color="white" />
                </View>
                <Text className="text-4xl font-black italic uppercase" style={{ color: theme === 'dark' ? '#fff' : '#111' }}>{nickname}</Text>
                <View className="flex-row items-center mt-2 bg-indigo-600 px-4 py-1 rounded-full">
                    <Award size={14} color="white" className="mr-2" />
                    <Text className="text-white font-bold text-xs">PRO PLAYER</Text>
                </View>
            </View>

            {/* СЕТКА СТАТИСТИКИ */}
            <View className="p-4 flex-row flex-wrap justify-between pt-8">
                <StatCard label="Rating 2.0" value={stats.rating} icon={Activity} type="rating" />
                <StatCard label="K/D Ratio" value={stats.kd} icon={Target} type="kd" />
                <StatCard label="ADR" value={stats.adr} icon={Zap} type="adr" />
                <StatCard label="Impact" value={stats.impact} icon={BarChart3} type="impact" />
                <StatCard label="Headshots" value={stats.hs + '%'} icon={Target} type="hs" />
            </View>

            <View className="px-4 pb-10">
                <View className="p-6 rounded-3xl bg-indigo-600">
                    <Text className="text-white/60 font-bold uppercase text-[10px] tracking-widest">Performance Summary</Text>
                    <Text className="text-white text-lg font-medium mt-2 leading-6">
                        {parseFloat(stats.rating) >= 1.1
                            ? `${nickname} is currently performing at an elite level, consistently delivering impact rounds for the team.`
                            : `${nickname} is showing consistent performance, fulfilling the tactical requirements of the roster.`}
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};