import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ImageBackground, ActivityIndicator } from 'react-native';
import { ChevronRight, Map as MapIcon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { getMatchMaps, MapPlayed } from '../lib/storage';

// Ссылки на фоны карт (те же, что и в Scoreboard)
const mapBackgrounds: any = {
    'Mirage': 'https://static.wikia.nocookie.net/cswikia/images/f/f5/De_mirage_cs2.png/revision/latest?cb=20230807124319',
    'Inferno': 'https://static.wikia.nocookie.net/cswikia/images/1/17/Cs2_inferno_remake.png/revision/latest/scale-to-width-down/1200?cb=20260304235624',
    'Ancient': 'https://static.wikia.nocookie.net/cswikia/images/5/5c/De_ancient_cs2.png/revision/latest/scale-to-width-down/1200?cb=20250815011913',
    'Nuke': 'https://static.wikia.nocookie.net/cswikia/images/d/d6/De_nuke_cs2.png/revision/latest/scale-to-width-down/1200?cb=20240426010253',
    'Anubis': 'https://static.wikia.nocookie.net/cswikia/images/a/a0/CS2_Anubis_B_site.png/revision/latest/scale-to-width-down/1200?cb=20260122021359',
    'Dust II': 'https://assets.csnades.gg/dust2_background_849ac079dc.webp',
    'Vertigo': 'https://static.wikia.nocookie.net/cswikia/images/8/88/De_vertigo_cs2.jpg/revision/latest/scale-to-width-down/1200?cb=20231009185617'
};

export const MatchMapsScreen = ({ route, navigation }: any) => {
    const { match, team1, team2 } = route.params;
    const { theme } = useTheme();
    const [maps, setMaps] = useState<MapPlayed[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMatchMaps(match.id).then(data => {
            setMaps(data);
            setLoading(false);
        });
    }, [match.id]);

    if (loading) return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
            <ActivityIndicator size="large" color="#6366f1" />
        </View>
    );

    return (
        <ScrollView
            className="flex-1 p-4"
            style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}
            showsVerticalScrollIndicator={false}
        >
            <Text className="text-gray-500 font-black text-[10px] uppercase mb-4 tracking-widest ml-2">
                Select Map for Analysis
            </Text>

            {maps.map((map) => (
                <TouchableOpacity
                    key={map.id}
                    onPress={() => navigation.navigate('MapScoreboard', { mapPlayed: map, team1, team2 })}
                    activeOpacity={0.9}
                    className="mb-4 rounded-[24px] overflow-hidden border"
                    style={{
                        borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : '#eee',
                        height: 100
                    }}
                >
                    <ImageBackground
                        source={{ uri: mapBackgrounds[map.map_name] || 'https://via.placeholder.com/400x200' }}
                        className="w-full h-full"
                    >
                        <View
                            className="flex-1 flex-row items-center justify-between px-6"
                            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                        >
                            <View className="flex-row items-center">
                                <View className="bg-white/20 p-2 rounded-xl mr-4 border border-white/20">
                                    <MapIcon size={20} color="white" />
                                </View>
                                <View>
                                    <Text className="text-white text-2xl font-black italic tracking-tighter">
                                        {map.map_name.toUpperCase()}
                                    </Text>
                                    <Text className="text-indigo-300 font-bold text-xs uppercase">
                                        Result: {map.team1_score} - {map.team2_score}
                                    </Text>
                                </View>
                            </View>
                            <View className="bg-white/10 p-2 rounded-full">
                                <ChevronRight size={20} color="white" />
                            </View>
                        </View>
                    </ImageBackground>
                </TouchableOpacity>
            ))}
            {/* ВАЖНО: Никаких комментариев или текста просто так в конце ScrollView */}
            <View style={{ height: 40 }} />
        </ScrollView>
    );
};