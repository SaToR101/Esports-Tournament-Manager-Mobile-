import React, { useEffect, useState } from 'react';
import { View, Text, ImageBackground, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { getMapScoreboard } from '../lib/storage';
import { ChevronLeft, Zap, Activity } from 'lucide-react-native';

const mapBackgrounds: any = {
    'Mirage': 'https://static.wikia.nocookie.net/cswikia/images/f/f5/De_mirage_cs2.png/revision/latest?cb=20230807124319',
    'Inferno': 'https://static.wikia.nocookie.net/cswikia/images/1/17/Cs2_inferno_remake.png/revision/latest/scale-to-width-down/1200?cb=20260304235624',
    'Ancient': 'https://static.wikia.nocookie.net/cswikia/images/5/5c/De_ancient_cs2.png/revision/latest/scale-to-width-down/1200?cb=20250815011913',
    'Nuke': 'https://static.wikia.nocookie.net/cswikia/images/d/d6/De_nuke_cs2.png/revision/latest/scale-to-width-down/1200?cb=20240426010253',
    'Anubis': 'https://static.wikia.nocookie.net/cswikia/images/a/a0/CS2_Anubis_B_site.png/revision/latest/scale-to-width-down/1200?cb=20260122021359',
    'Dust II': 'https://assets.csnades.gg/dust2_background_849ac079dc.webp',
    'Vertigo': 'https://static.wikia.nocookie.net/cswikia/images/8/88/De_vertigo_cs2.jpg/revision/latest/scale-to-width-down/1200?cb=20231009185617'
};

export const MapScoreboardScreen = ({ route, navigation }: any) => {
    const { mapPlayed, team1, team2 } = route.params;
    const { theme } = useTheme();
    const [stats, setStats] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [statView, setStatView] = useState<'combat' | 'advanced'>('combat');

    useEffect(() => {
        getMapScoreboard(mapPlayed.id).then(data => {
            setStats(data);
            setLoading(false);
        });
    }, [mapPlayed.id]);

    const getRatingColor = (val: number) => {
        if (val >= 1.15) return '#10b981';
        if (val >= 1.0) return '#f59e0b';
        return '#ef4444';
    };

    // Группировка игроков
    const team1P = stats.filter(s => s.players.team_rosters.some((r: any) => r.team_id === team1.id));
    const team2P = stats.filter(s => s.players.team_rosters.some((r: any) => r.team_id === team2.id));

    const PlayerCard = ({ item, isLeft }: any) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('PlayerProfile', { playerId: item.players.id, nickname: item.players.nickname })}
            className={`p-2.5 mb-1.5 rounded-xl border ${isLeft ? 'items-start' : 'items-end'}`}
            style={{
                backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.06)' : '#fff',
                borderColor: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#eee'
            }}
        >
            <Text className="font-black text-[13px]" style={{ color: theme === 'dark' ? '#fff' : '#111' }} numberOfLines={1}>
                {item.players.nickname.toUpperCase()}
            </Text>

            <View className={`flex-row items-center mt-0.5 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
                {statView === 'combat' ? (
                    <>
                        <Text className="font-black text-[10px]" style={{ color: getRatingColor(item.hltv_rating) }}>{item.hltv_rating.toFixed(2)}</Text>
                        <Text className="text-[9px] text-gray-500 font-bold ml-2 mr-2">|</Text>
                        <Text className="text-[10px] text-gray-500 font-bold">{item.kills}/{item.deaths}</Text>
                    </>
                ) : (
                    <>
                        <Text className="font-black text-[10px] text-indigo-400">{Math.round(item.adr)} ADR</Text>
                        <Text className="text-[9px] text-gray-500 font-bold ml-2 mr-2">|</Text>
                        <Text className="text-[10px] text-gray-500 font-bold">{Math.round(item.hs_percent)}% HS</Text>
                    </>
                )}
            </View>
        </TouchableOpacity>
    );

    if (loading) return <View className="flex-1 justify-center"><ActivityIndicator size="large" color="#6366f1" /></View>;

    return (
        <View className="flex-1" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
            {/* ШАПКА (Сжатая для статичности) */}
            <ImageBackground source={{ uri: mapBackgrounds[mapPlayed.map_name] }} className="h-56 justify-end">
                <View className="absolute inset-0 bg-black/40" />
                <View className="p-4 bg-black/60 rounded-t-[30px] border-t border-white/10">
                    <Text className="text-white text-center text-2xl font-black italic mb-3">{mapPlayed.map_name.toUpperCase()}</Text>

                    <View className="flex-row justify-between items-center px-4">
                        <View className="items-center flex-1">
                            <View className="w-10 h-10 bg-white rounded-xl p-1 mb-1 shadow-lg">
                                <Image source={{ uri: team1.logo_url }} className="w-full h-full" resizeMode="contain" />
                            </View>
                            <Text className="text-white font-black text-[8px] uppercase" numberOfLines={1}>{team1.name}</Text>
                        </View>

                        <View className="bg-indigo-600 px-5 py-1 rounded-xl shadow-2xl border border-white/20">
                            <Text className="text-white text-3xl font-black">{mapPlayed.team1_score}:{mapPlayed.team2_score}</Text>
                        </View>

                        <View className="items-center flex-1">
                            <View className="w-10 h-10 bg-white rounded-xl p-1 mb-1 shadow-lg">
                                <Image source={{ uri: team2.logo_url }} className="w-full h-full" resizeMode="contain" />
                            </View>
                            <Text className="text-white font-black text-[8px] uppercase" numberOfLines={1}>{team2.name}</Text>
                        </View>
                    </View>
                </View>
            </ImageBackground>

            {/* ОСНОВНОЙ КОНТЕНТ (Без видимых скролл-баров) */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                className="flex-1"
            >
                <View className="flex-row p-3 pt-4">
                    <View className="flex-1 pr-1.5">
                        <Text className="text-[9px] font-black text-indigo-500 mb-2 ml-2 uppercase tracking-tighter">Terrorists</Text>
                        {team1P.map(p => <PlayerCard key={p.id} item={p} isLeft={true} />)}
                    </View>
                    <View className="flex-1 pl-1.5">
                        <Text className="text-[9px] font-black text-rose-500 mb-2 text-right mr-2 uppercase tracking-tighter">Counter-Terrorists</Text>
                        {team2P.map(p => <PlayerCard key={p.id} item={p} isLeft={false} />)}
                    </View>
                </View>
            </ScrollView>

            {/* ФИКСИРОВАННЫЙ ПЕРЕКЛЮЧАТЕЛЬ */}
            <View className="px-10 pb-8 pt-2">
                <View className="flex-row bg-white/5 p-1 rounded-2xl border border-white/5" style={{backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}}>
                    <TouchableOpacity
                        onPress={() => setStatView('combat')}
                        className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${statView === 'combat' ? 'bg-indigo-600' : ''}`}
                    >
                        <Activity size={14} color={statView === 'combat' ? 'white' : '#555'} className="mr-2" />
                        <Text className={`font-black text-[9px] ${statView === 'combat' ? 'text-white' : 'text-gray-500'}`}>COMBAT</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setStatView('advanced')}
                        className={`flex-1 py-2.5 rounded-xl flex-row items-center justify-center ${statView === 'advanced' ? 'bg-indigo-600' : ''}`}
                    >
                        <Zap size={14} color={statView === 'advanced' ? 'white' : '#555'} className="mr-2" />
                        <Text className={`font-black text-[9px] ${statView === 'advanced' ? 'text-white' : 'text-gray-500'}`}>ADVANCED</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};