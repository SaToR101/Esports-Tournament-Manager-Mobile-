import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image, Modal, FlatList, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Swords, Save, Trash2, X, ChevronDown, Trophy, Plus, CheckCircle2, User, Activity, AlertCircle } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import {
    getTeams, saveMatch, deleteMatch, getAllMaps,
    getMatchMaps, saveMatchMap, deleteMatchMap,
    getTeamProfile, savePlayerMapStats, Team // <-- ПРОВЕРЬ ЭТО ИМЯ
} from '../lib/storage';
import Toast from 'react-native-toast-message';

export const CreateMatchScreen = ({ route, navigation }: any) => {
    const { tournamentId, match } = route.params;
    const isEdit = !!match;
    const { t } = useLanguage();
    const { theme } = useTheme();

    const [teams, setTeams] = useState<Team[]>([]);
    const [availableMaps, setAvailableMaps] = useState<any[]>([]);
    const [playedMaps, setPlayedMaps] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [teamModalOpen, setTeamModalOpen] = useState<'team1_id' | 'team2_id' | null>(null);
    const [statsModalOpen, setStatsModalOpen] = useState<number | null>(null);
    const [mapPlayers, setMapPlayers] = useState<any[]>([]);

    const [matchData, setMatchData] = useState({
        team1_id: match?.team1?.id || null as number | null,
        team2_id: match?.team2?.id || null as number | null,
        team1_score: match?.team1_score?.toString() || '0',
        team2_score: match?.team2_score?.toString() || '0',
        best_of: match?.best_of?.toString() || '3',
        status: match?.status || 'scheduled',
        stream_url: match?.stream_url || ''
    });

    const team1 = teams.find(t => t.id === matchData.team1_id);
    const team2 = teams.find(t => t.id === matchData.team2_id);

    // --- УЛЬТИМАТИВНЫЙ АЛГОРИТМ ВАЛИДАЦИИ CS2 ---
    const checkScore = (s1: number, s2: number) => {
        const max = Math.max(s1, s2);
        const min = Math.min(s1, s2);
        const diff = max - min;

        // 1. Отрицательный счет невозможен
        if (s1 < 0 || s2 < 0) return { possible: false, finished: false };

        // 2. ОСНОВНОЕ ВРЕМЯ (до 13 раундов)
        if (max < 13) {
            // Любой счет до 13 возможен, но игра не закончена
            return { possible: true, finished: false };
        }

        if (max === 13) {
            // 13:0 ... 13:11 — это финал карты. 13:12 — игра продолжается (идем в допы)
            const isNormalWin = min <= 11;
            return { possible: true, finished: isNormalWin };
        }

        // 3. ОВЕРТАЙМЫ (OT)
        // В овертаймы нельзя попасть, если проигравший не набрал минимум 12 раундов
        if (min < 12) return { possible: false, finished: false };

        // Вычисляем целевой порог победы для текущего овертайма
        // Пороги: 16, 19, 22, 25, 28...
        // Формула: 13 + (k * 3), где k - номер цикла овертаймов
        let k = Math.ceil((max - 13) / 3);
        let currentWinThreshold = 13 + k * 3;

        // Проверка: не "проскочили" ли мы предыдущий порог победы?
        // Например, нельзя иметь 17:12, т.к. при 16:12 игра бы закончилась.
        let prevWinThreshold = currentWinThreshold - 3;
        if (max > 13 && min < prevWinThreshold - 1 && max > prevWinThreshold) {
            return { possible: false, finished: false };
        }

        if (max === currentWinThreshold) {
            // Мы на точке победы (16, 19, 22...).
            // Если разница >= 2 (например 16:14, 16:13, 16:12), то КАРТА ОКОНЧЕНА.
            // Если разница 1 (16:15), то это просто процесс игры во вторых/третьих допах.
            const isWin = diff >= 2;
            return { possible: true, finished: isWin };
        }

        // Если мы между порогами (например 14:14, 15:15, 17:17)
        // В CS2 в овертайме разрыв не может быть больше 3 раундов (т.к. при +4 наступает победа)
        const isOTPossible = diff <= 3 || (max === currentWinThreshold - 1 && diff === 4);
        // Упростим: в процессе OT счет возможен, если никто еще не достиг WinThreshold с разрывом 2
        return { possible: true, finished: false };
    };

    const isWinningScore = (s1: number, s2: number) => checkScore(s1, s2).finished;

    // Авто-счет серии
    useEffect(() => {
        const t1Wins = playedMaps.filter(m => isWinningScore(m.team1_score, m.team2_score) && m.team1_score > m.team2_score).length;
        const t2Wins = playedMaps.filter(m => isWinningScore(m.team1_score, m.team2_score) && m.team2_score > m.team1_score).length;
        setMatchData(prev => ({ ...prev, team1_score: String(t1Wins), team2_score: String(t2Wins) }));
    }, [playedMaps]);

    useLayoutEffect(() => {
        navigation.setOptions({
            title: isEdit ? t('edit_match') : t('add_match'),
            headerRight: () => isEdit && (
                <TouchableOpacity onPress={handleDeleteMatch} className="p-2">
                    <Trash2 size={22} color="#ef4444" />
                </TouchableOpacity>
            )
        });
    }, [navigation, isEdit, t, teams, matchData]);

    const handleDeleteMatch = () => {
        Alert.alert(t('delete_match'), 'Удалить этот матч и все его карты?', [
            { text: t('cancel'), style: 'cancel' },
            { text: t('delete'), style: 'destructive', onPress: async () => {
                    setIsSaving(true);
                    await deleteMatch(match.id);
                    navigation.goBack();
                }}
        ]);
    };

    useEffect(() => {
        const loadData = async () => {
            const [allTeams, allMaps] = await Promise.all([getTeams(), getAllMaps()]);
            setTeams(allTeams); setAvailableMaps(allMaps);
            if (isEdit) {
                const maps = await getMatchMaps(match.id);
                setPlayedMaps(maps);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const handleSaveAll = async () => {
        if (!matchData.team1_id || !matchData.team2_id) return Alert.alert(t('error'), t('select_both_teams'));

        setIsSaving(true);
        try {
            // А. Сохраняем матч
            const savedMatch = await saveMatch(tournamentId, matchData, match?.id);
            if (!savedMatch) throw new Error("Match save failed");

            // Б. Сохраняем карты
            for (const m of playedMaps) {
                const savedMap = await saveMatchMap({ ...m, match_id: savedMatch.id });

                // В. Сохраняем статистику игроков для этой карты
                if (savedMap && m.players_stats) {
                    console.log(`Сохраняем статику для карты ${savedMap.id}, игроков: ${m.players_stats.length}`);
                    for (const ps of m.players_stats) {
                        await savePlayerMapStats({ ...ps, map_played_id: savedMap.id });
                    }
                }
            }

            Toast.show({ type: 'success', text1: 'Все данные успешно отправлены в БД' });
            navigation.goBack();
        } catch (e) {
            console.error(e);
            Alert.alert("Error", "Ошибка при синхронизации. Проверьте консоль.");
        } finally {
            setIsSaving(false);
        }
    };

    const addMap = () => {
        const bo = parseInt(matchData.best_of);
        const winsNeeded = Math.ceil(bo / 2);
        if (parseInt(matchData.team1_score) === winsNeeded || parseInt(matchData.team2_score) === winsNeeded) {
            return Alert.alert("Серия окончена", "Победитель уже выявлен.");
        }
        if (playedMaps.length > 0 && !checkScore(playedMaps[playedMaps.length-1].team1_score, playedMaps[playedMaps.length-1].team2_score).finished) {
            return Alert.alert("Внимание", "Доиграйте текущую карту перед добавлением новой.");
        }

        // Защита от дубликатов при автоматическом добавлении
        const usedIds = playedMaps.map(m => m.map_id);
        const nextMap = availableMaps.find(m => !usedIds.includes(m.id));

        if (!nextMap) return Alert.alert("Ошибка", "Все доступные карты уже выбраны!");

        setPlayedMaps([...playedMaps, { map_id: nextMap.id, map_name: nextMap.name, team1_score: 0, team2_score: 0 }]);
    };

    const openStatsEditor = async (mapIndex: number) => {
        if (!matchData.team1_id || !matchData.team2_id) return Alert.alert("Ошибка", "Выберите команды");
        setLoading(true);
        const [t1, t2] = await Promise.all([getTeamProfile(matchData.team1_id), getTeamProfile(matchData.team2_id)]);

        const currentStats = playedMaps[mapIndex].players_stats || [];

        const combined = [
            ...(t1?.players.map(p => ({
                ...p, side: 'left', team_name: t1.name, logo: t1.logo_url,
                kills: currentStats.find((s:any)=>s.player_id === p.id)?.kills || '0',
                deaths: currentStats.find((s:any)=>s.player_id === p.id)?.deaths || '0',
                assists: currentStats.find((s:any)=>s.player_id === p.id)?.assists || '0',
                rating: currentStats.find((s:any)=>s.player_id === p.id)?.hltv_rating || '1.00',
                adr: currentStats.find((s:any)=>s.player_id === p.id)?.adr || '0',
                hs: currentStats.find((s:any)=>s.player_id === p.id)?.hs_percent || '0',
                impact: currentStats.find((s:any)=>s.player_id === p.id)?.impact || '1.00'
            })) || []),
            ...(t2?.players.map(p => ({
                ...p, side: 'right', team_name: t2.name, logo: t2.logo_url,
                kills: currentStats.find((s:any)=>s.player_id === p.id)?.kills || '0',
                deaths: currentStats.find((s:any)=>s.player_id === p.id)?.deaths || '0',
                assists: currentStats.find((s:any)=>s.player_id === p.id)?.assists || '0',
                rating: currentStats.find((s:any)=>s.player_id === p.id)?.hltv_rating || '1.00',
                adr: currentStats.find((s:any)=>s.player_id === p.id)?.adr || '0',
                hs: currentStats.find((s:any)=>s.player_id === p.id)?.hs_percent || '0',
                impact: currentStats.find((s:any)=>s.player_id === p.id)?.impact || '1.00'
            })) || [])
        ];

        setMapPlayers(combined);
        setStatsModalOpen(mapIndex);
        setLoading(false);
    };

    const saveStatsToMap = () => {
        const newMaps = [...playedMaps];
        newMaps[statsModalOpen!].players_stats = mapPlayers.map(p => ({
            player_id: p.id,
            kills: parseInt(p.kills) || 0,
            deaths: parseInt(p.deaths) || 0,
            assists: parseInt(p.assists) || 0,
            hltv_rating: parseFloat(p.rating) || 0,
            adr: parseFloat(p.adr) || 0,
            impact: parseFloat(p.impact) || 0,
            hs_percent: parseFloat(p.hs) || 0
        }));
        setPlayedMaps(newMaps);
        setStatsModalOpen(null);
    };

    return (
        <>
            <KeyboardAwareScrollView className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
                <View className="space-y-6 mb-20">

                    {/* ТАБЛО */}
                    <View className="flex-row items-center justify-between bg-indigo-600/5 p-6 rounded-3xl border border-indigo-600/20">
                        <View className="flex-1 items-center">
                            <TouchableOpacity onPress={() => setTeamModalOpen('team1_id')} className="items-center">
                                <View className="w-16 h-16 bg-white rounded-2xl p-2 mb-2 shadow-sm"><Image source={{ uri: team1?.logo_url }} className="w-full h-full" resizeMode="contain" /></View>
                                <Text className="font-bold text-center text-[10px] uppercase" style={{color: theme === 'dark' ? '#fff' : '#111'}}>{team1?.name || '---'}</Text>
                            </TouchableOpacity>
                            <View className="mt-4 w-14 h-14 bg-white/10 items-center justify-center rounded-2xl"><Text className="font-black text-2xl" style={{color: theme === 'dark' ? '#fff' : '#000'}}>{matchData.team1_score}</Text></View>
                        </View>
                        <Swords size={24} color="#f43f5e" />
                        <View className="flex-1 items-center">
                            <TouchableOpacity onPress={() => setTeamModalOpen('team2_id')} className="items-center">
                                <View className="w-16 h-16 bg-white rounded-2xl p-2 mb-2 shadow-sm"><Image source={{ uri: team2?.logo_url }} className="w-full h-full" resizeMode="contain" /></View>
                                <Text className="font-bold text-center text-[10px] uppercase" style={{color: theme === 'dark' ? '#fff' : '#111'}}>{team2?.name || '---'}</Text>
                            </TouchableOpacity>
                            <View className="mt-4 w-14 h-14 bg-white/10 items-center justify-center rounded-2xl"><Text className="font-black text-2xl" style={{color: theme === 'dark' ? '#fff' : '#000'}}>{matchData.team2_score}</Text></View>
                        </View>
                    </View>

                    {/* --- ВОЗВРАЩЕН ВЫБОР СТАТУСА И ФОРМАТА В ИНТЕРФЕЙС --- */}
                    <View className="flex-row justify-between">
                        <View className="flex-1 mr-2">
                            <Text className="text-[10px] font-bold uppercase text-gray-500 mb-1 ml-1">{t('match_status')}</Text>
                            <View className="border rounded-2xl overflow-hidden bg-white/5" style={{ borderColor: theme === 'dark' ? '#374151' : '#ddd' }}>
                                <Picker selectedValue={matchData.status} onValueChange={v => setMatchData({...matchData, status: v})} style={{color: theme === 'dark' ? '#fff' : '#000'}} dropdownIconColor={theme === 'dark' ? '#fff' : '#000'}>
                                    <Picker.Item label={t('scheduled')} value="scheduled" />
                                    <Picker.Item label={t('live')} value="live" />
                                    <Picker.Item label={t('finished')} value="finished" />
                                </Picker>
                            </View>
                        </View>
                        <View className="flex-1 ml-2">
                            <Text className="text-[10px] font-bold uppercase text-gray-500 mb-1 ml-1">{t('bo')}</Text>
                            <View className="border rounded-2xl overflow-hidden bg-white/5" style={{ borderColor: theme === 'dark' ? '#374151' : '#ddd' }}>
                                <Picker selectedValue={matchData.best_of} onValueChange={v => setMatchData({...matchData, best_of: v})} style={{color: theme === 'dark' ? '#fff' : '#000'}} dropdownIconColor={theme === 'dark' ? '#fff' : '#000'}>
                                    <Picker.Item label="BO1" value="1" />
                                    <Picker.Item label="BO3" value="3" />
                                    <Picker.Item label="BO5" value="5" />
                                </Picker>
                            </View>
                        </View>
                    </View>

                    {/* --- ВОЗВРАЩЕН ВВОД ССЫЛКИ НА СТРИМ --- */}
                    <View>
                        <Text className="text-[10px] font-bold uppercase text-gray-500 mb-1 ml-1">{t('stream_url')}</Text>
                        <TextInput value={matchData.stream_url} onChangeText={t => setMatchData({...matchData, stream_url: t})} placeholder="https://..." placeholderTextColor="#555" className="p-3 border rounded-2xl" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', color: theme === 'dark' ? '#fff' : '#000', borderColor: '#374151' }} />
                    </View>

                    {/* КАРТЫ */}
                    <View>
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-black" style={{color: theme === 'dark' ? '#fff' : '#000'}}>MAPS</Text>
                            <TouchableOpacity onPress={addMap} className="bg-indigo-600 px-4 py-2 rounded-xl flex-row items-center shadow-lg"><Plus size={18} color="white" /><Text className="text-white font-bold ml-1">ADD</Text></TouchableOpacity>
                        </View>
                        {playedMaps.map((map, index) => {
                            const res = checkScore(map.team1_score, map.team2_score);
                            return (
                                <View key={index} className={`bg-white/5 border p-4 rounded-3xl mb-4 ${res.finished ? 'border-green-500' : res.possible ? 'border-gray-700' : 'border-red-500'}`} style={{borderWidth: 2}}>
                                    <View className="flex-row items-center justify-between mb-4">
                                        <View className="flex-1 mr-4 border rounded-xl overflow-hidden bg-black/20">
                                            <Picker
                                                selectedValue={map.map_id}
                                                onValueChange={(val) => {
                                                    if (playedMaps.some((m, i) => m.map_id === val && i !== index)) return Alert.alert("Ошибка", "Карта уже выбрана!");
                                                    const newMaps = [...playedMaps]; newMaps[index].map_id = val; newMaps[index].map_name = availableMaps.find(m => m.id === val)?.name; setPlayedMaps(newMaps);
                                                }}
                                                style={{color: '#fff'}}
                                                dropdownIconColor="#fff"
                                            >
                                                {availableMaps.map(m => <Picker.Item key={m.id} label={m.name} value={m.id} />)}
                                            </Picker>
                                        </View>
                                        <TouchableOpacity onPress={() => { if(map.id) deleteMatchMap(map.id); setPlayedMaps(playedMaps.filter((_, i) => i !== index)); }} className="p-2 bg-red-500/10 rounded-xl"><Trash2 size={18} color="#ef4444" /></TouchableOpacity>
                                    </View>
                                    <View className="flex-row items-center justify-around mb-4">
                                        <View className="items-center"><View className="w-8 h-8 bg-white rounded p-1 mb-1 shadow-sm"><Image source={{uri: team1?.logo_url}} className="w-full h-full" resizeMode="contain" /></View><TextInput value={String(map.team1_score)} onChangeText={v => { const m = [...playedMaps]; m[index].team1_score = parseInt(v) || 0; setPlayedMaps(m); }} keyboardType="numeric" className="w-14 h-12 bg-black/40 text-white text-center rounded-xl font-bold text-lg" /></View>
                                        {res.finished ? <CheckCircle2 size={24} color="#10b981" /> : !res.possible ? <AlertCircle size={24} color="#ef4444" /> : <Text className="text-gray-600 font-black">VS</Text>}
                                        <View className="items-center"><View className="w-8 h-8 bg-white rounded p-1 mb-1 shadow-sm"><Image source={{uri: team2?.logo_url}} className="w-full h-full" resizeMode="contain" /></View><TextInput value={String(map.team2_score)} onChangeText={v => { const m = [...playedMaps]; m[index].team2_score = parseInt(v) || 0; setPlayedMaps(m); }} keyboardType="numeric" className="w-14 h-12 bg-black/40 text-white text-center rounded-xl font-bold text-lg" /></View>
                                    </View>
                                    <TouchableOpacity onPress={() => openStatsEditor(index)} className="bg-indigo-600/10 p-3 rounded-xl flex-row items-center justify-center"><Activity size={16} color="#6366f1" className="mr-2" /><Text className="text-indigo-400 font-bold text-xs uppercase">Edit Stats</Text></TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>

                    <TouchableOpacity onPress={handleSaveAll} disabled={isSaving} className="bg-indigo-600 p-5 rounded-2xl items-center flex-row justify-center shadow-2xl">
                        {isSaving ? <ActivityIndicator color="white" /> : <><Save size={24} color="white" /><Text className="text-white font-black text-lg ml-3 uppercase">Sync Data</Text></>}
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>

            {/* МОДАЛКА СТАТИСТИКИ */}
            <Modal visible={statsModalOpen !== null} transparent animationType="slide">
                <View className="flex-1 bg-black/95 p-4 pt-12">
                    <View className="flex-row justify-between items-center mb-6 px-2">
                        <Text className="text-white text-2xl font-black uppercase">Detailed Stats</Text>
                        <TouchableOpacity onPress={() => setStatsModalOpen(null)}><X size={30} color="white" /></TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {['left', 'right'].map(side => {
                            const team = side === 'left' ? team1 : team2;
                            return (
                                <View key={side} className="mb-8">
                                    <View className="flex-row items-center mb-4 bg-white/10 p-3 rounded-2xl">
                                        <View className="w-8 h-8 bg-white rounded p-1 mr-3"><Image source={{ uri: team?.logo_url }} className="w-full h-full" resizeMode="contain" /></View>
                                        <Text className="text-white font-black uppercase">{team?.name}</Text>
                                    </View>

                                    {mapPlayers.filter(p => p.side === side).map((p, index) => (
                                        <View key={`${side}-${p.id}-${index}`} className="mb-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                                            <Text className="text-white font-black text-lg mb-3">{p.nickname}</Text>

                                            {/* СЕТКА ИНПУТОВ 4x2 */}
                                            <View className="flex-row flex-wrap justify-between">
                                                {[
                                                    {label: 'K', field: 'kills'}, {label: 'D', field: 'deaths'},
                                                    {label: 'A', field: 'assists'}, {label: 'Rating', field: 'rating'},
                                                    {label: 'ADR', field: 'adr'}, {label: 'HS%', field: 'hs'},
                                                    {label: 'Impact', field: 'impact'}
                                                ].map(input => (
                                                    <View key={input.field} className="w-[23%] mb-2">
                                                        <Text className="text-[9px] text-gray-500 font-bold uppercase mb-1 text-center">{input.label}</Text>
                                                        <TextInput
                                                            value={String(p[input.field])}
                                                            onChangeText={v => setMapPlayers(prev => prev.map(pl => (pl.id === p.id && pl.side === p.side) ? {...pl, [input.field]: v} : pl))}
                                                            keyboardType="numeric"
                                                            className="bg-black/40 text-white text-center py-2 rounded-lg font-bold text-xs"
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            )
                        })}
                    </ScrollView>

                    <TouchableOpacity onPress={saveStatsToMap} className="bg-indigo-600 p-5 rounded-2xl items-center mb-6 shadow-xl">
                        <Text className="text-white font-black text-lg">SAVE PLAYER STATS</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* ВЫБОР КОМАНД */}
            <Modal visible={!!teamModalOpen} transparent animationType="slide">
                <TouchableOpacity className="flex-1 justify-end bg-black/70" activeOpacity={1} onPress={() => setTeamModalOpen(null)}>
                    <View className="rounded-t-[40px] pt-6 pb-10 h-2/3" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}>
                        <FlatList data={teams} keyExtractor={(i) => i.id.toString()} renderItem={({ item }) => {
                            const isChosen = (teamModalOpen === 'team1_id' && item.id === matchData.team2_id) || (teamModalOpen === 'team2_id' && item.id === matchData.team1_id);
                            return (
                                <TouchableOpacity disabled={isChosen} onPress={() => { setMatchData({...matchData, [teamModalOpen!]: item.id}); setTeamModalOpen(null); }} className={`flex-row items-center p-4 mx-6 mb-3 rounded-2xl border ${isChosen ? 'opacity-20' : ''}`} style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f9fafb', borderColor: '#eee' }}>
                                    <View className="w-12 h-12 bg-white rounded-lg p-1.5 mr-5 shadow-sm"><Image source={{uri: item.logo_url}} className="w-full h-full" resizeMode="contain" /></View>
                                    <Text className="font-bold text-lg flex-1" style={{color: theme === 'dark' ? '#fff' : '#111'}}>{item.name}</Text>
                                    {isChosen && <Text className="text-red-500 font-bold text-[10px]">SELECTED</Text>}
                                </TouchableOpacity>
                            );
                        }} />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};