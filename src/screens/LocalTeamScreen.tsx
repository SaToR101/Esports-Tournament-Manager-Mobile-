import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { User, TrendingUp, Crosshair } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getTeamProfile, TeamProfile } from '../lib/storage';

export const LocalTeamScreen = ({ route, navigation }: any) => {
    const { teamId } = route.params;
    const { theme } = useTheme();

    const [team, setTeam] = useState<TeamProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        navigation.setOptions({ title: team ? team.name : 'Team Roster' });
    }, [navigation, team]);

    useEffect(() => {
        getTeamProfile(teamId).then(data => {
            setTeam(data);
            setLoading(false);
        });
    }, [teamId]);

    if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" color="#4f46e5" /></View>;
    if (!team) return <View className="flex-1 justify-center items-center"><Text style={{color: theme === 'dark' ? '#fff' : '#000'}}>Команда не найдена</Text></View>;

    return (
        <ScrollView className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
            {/* ШАПКА КОМАНДЫ */}
            <View className="items-center mb-8 mt-4">
                <View className="w-28 h-28 bg-white rounded-2xl items-center justify-center mb-4 shadow-sm border p-2" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                    {team.logo_url ? (
                        <Image source={{ uri: team.logo_url }} className="w-full h-full" resizeMode="contain" />
                    ) : (
                        <User size={40} color="#9ca3af" />
                    )}
                </View>
                <Text className="text-3xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{team.name}</Text>
                <Text className="text-sm uppercase font-bold text-indigo-500 mt-1">Active Roster</Text>
            </View>

            {/* СПИСОК ИГРОКОВ */}
            <View className="space-y-4 mb-10">
                {team.players.length === 0 ? (
                    <Text className="text-center" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>Нет данных об игроках</Text>
                ) : (
                    team.players.map((player) => (
                        <TouchableOpacity
                            key={player.id}
                            onPress={() => navigation.navigate('PlayerProfile', { playerId: player.id, nickname: player.nickname })}
                            className="p-4 rounded-xl border flex-row items-center mb-3"
                            style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db' }}
                        >
                            <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}>
                                <User size={24} color="#9ca3af" />
                            </View>
                            <View className="flex-1">
                                <View className="flex-row items-center">
                                    <Text className="text-lg font-bold mr-2" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                        {player.nickname}
                                    </Text>
                                    {player.role === 'captain' && <Text className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full uppercase">IGL</Text>}
                                </View>
                                <Text className="text-xs" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>
                                    {player.first_name} {player.last_name}
                                </Text>
                            </View>
                            <View className="items-end border-l pl-4" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                                <View className="flex-row items-center mb-1">
                                    <TrendingUp size={14} color={player.avg_rating >= 1.05 ? '#10b981' : '#ef4444'} className="mr-1" />
                                    <Text className="font-bold text-lg" style={{ color: player.avg_rating >= 1.05 ? '#10b981' : '#ef4444' }}>
                                        {player.avg_rating.toFixed(2)}
                                    </Text>
                                </View>
                                <View className="flex-row items-center">
                                    <Crosshair size={12} color="#9ca3af" className="mr-1" />
                                    <Text className="text-[10px] font-bold" style={{ color: theme === 'dark' ? '#d1d5db' : '#4b5563' }}>
                                        K/D: {player.avg_kills}/{player.avg_deaths}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>
        </ScrollView>
    );
};