import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator, Modal, Share, Platform, Linking } from 'react-native';
import { Save, Trash2, Calendar, ImagePlus, Camera, Image as ImageIcon, X, Share2, CheckCircle2, Users, Trophy, ChevronDown, ChevronUp, Swords, Tv, Plus, Settings } from 'lucide-react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useTournamentDetails } from '../hooks/useTournamentDetails';

export const DetailsScreen = ({ route, navigation }: any) => {
    const { id } = route.params || {};
    const { t } = useLanguage();
    const { theme } = useTheme();
    const [isModalVisible, setModalVisible] = useState(false);

    const {
        formData, setFormData, handleSave, handleDelete, isNew,
        openCamera, openGallery, isSaving, isLoading,
        games, formats, allSponsors, toggleSponsor, allTeams, toggleTeam,
        showDatePicker, setShowDatePicker, onDateChange,
        isTeamsOpen, setIsTeamsOpen, matches
    } = useTournamentDetails(id, navigation, t);

    useLayoutEffect(() => {
        if (!isNew) {
            navigation.setOptions({
                headerRight: () => (
                    isSaving || isLoading ? null : (
                        <TouchableOpacity onPress={handleDelete} className="p-2">
                            <Trash2 size={20} color="#ef4444" />
                        </TouchableOpacity>
                    )
                ),
            });
        }
    }, [navigation, isNew, id, handleDelete, isSaving, isLoading]);

    const handleShare = async () => {
        try {
            const message = t('share_local_text').replace('TITLE', formData.title || '---').replace('DATE', formData.date || '---').replace('DESC', formData.description || '---');
            await Share.share({ message });
        } catch (error) { console.error(error); }
    };

    if (isLoading) return (
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text className="mt-4" style={{ color: theme === 'dark' ? '#9ca3af' : '#6b7280' }}>{t('loading')}</Text>
        </View>
    );

    return (
        <>
            <KeyboardAwareScrollView className="flex-1 p-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }} enableOnAndroid={true} extraScrollHeight={20}>

                {/* ЛОГО ТУРНИРА */}
                <View className="items-center mb-6 mt-2">
                    <TouchableOpacity onPress={() => setModalVisible(true)} disabled={isSaving} className="w-32 h-32 rounded-full border-2 border-dashed items-center justify-center overflow-hidden" style={{ borderColor: '#6366f1', backgroundColor: theme === 'dark' ? '#1f2937' : '#e0e7ff' }}>
                        {formData.image ? <Image source={{ uri: formData.image }} className="w-full h-full" resizeMode="cover" /> : <View className="items-center"><ImagePlus size={32} color="#4f46e5" /><Text className="text-xs mt-2" style={{ color: '#4f46e5' }}>{t('select_image')}</Text></View>}
                    </TouchableOpacity>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-bold mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('title')}</Text>
                        <TextInput value={formData.title} onChangeText={(text) => setFormData({ ...formData, title: text })} editable={!isSaving} className="p-3 rounded-xl border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? '#ffffff' : '#111827' }} />
                    </View>

                    <View className="flex-row justify-between">
                        <View className="flex-1 mr-2">
                            <Text className="text-sm font-bold mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('game')}</Text>
                            <View className="rounded-xl border overflow-hidden" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db' }}>
                                <Picker selectedValue={formData.game_id} onValueChange={(val) => setFormData({ ...formData, game_id: val })} enabled={!isSaving} dropdownIconColor={theme === 'dark' ? '#ffffff' : '#111827'} style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}><Picker.Item label="---" value={null} />{games.map(g => <Picker.Item key={g.id} label={g.name} value={g.id} />)}</Picker>
                            </View>
                        </View>
                        <View className="flex-1 ml-2">
                            <Text className="text-sm font-bold mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('format')}</Text>
                            <View className="rounded-xl border overflow-hidden" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db' }}>
                                <Picker selectedValue={formData.format_id} onValueChange={(val) => setFormData({ ...formData, format_id: val })} enabled={!isSaving} dropdownIconColor={theme === 'dark' ? '#ffffff' : '#111827'} style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}><Picker.Item label="---" value={null} />{formats.map(f => <Picker.Item key={f.id} label={f.name} value={f.id} />)}</Picker>
                            </View>
                        </View>
                    </View>

                    {/* КОМАНДЫ (АККОРДЕОН) */}
                    <View className="border rounded-xl overflow-hidden" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb', backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}>
                        <TouchableOpacity onPress={() => setIsTeamsOpen(!isTeamsOpen)} className="flex-row items-center justify-between p-4">
                            <View className="flex-row items-center">
                                <Users size={20} color="#6366f1" className="mr-3" />
                                <Text className="font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{t('teams_list')}</Text>{formData.team_ids.length > 0 && <View className="bg-indigo-600 rounded-full px-2 py-0.5 ml-2"><Text className="text-white text-[10px]">{formData.team_ids.length}</Text></View>}
                            </View>
                            {isTeamsOpen ? <ChevronUp size={20} color="#9ca3af" /> : <ChevronDown size={20} color="#9ca3af" />}
                        </TouchableOpacity>
                        {isTeamsOpen && (
                            <View className="flex-row flex-wrap justify-between p-3 border-t" style={{ borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}>
                                {allTeams.map(tm => (
                                    <TouchableOpacity key={tm.id} onPress={() => toggleTeam(tm.id)} disabled={isSaving} className={`mb-2 px-2 py-3 rounded-xl border flex-row items-center ${formData.team_ids.includes(tm.id) ? 'bg-indigo-600 border-indigo-600' : 'bg-transparent border-gray-300'}`} style={{ width: '48%' }}>
                                        <View className="w-8 h-8 mr-2 bg-white rounded-lg p-1 items-center justify-center shadow-sm">{tm.logo_url ? <Image source={{uri: tm.logo_url}} style={{width: '100%', height: '100%'}} resizeMode="contain" /> : <Trophy size={14} color="#ccc" />}</View>
                                        <Text className={`text-[10px] font-bold flex-1 ${formData.team_ids.includes(tm.id) ? 'text-white' : 'text-gray-500'}`} numberOfLines={2}>{tm.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* СПОНСОРЫ */}
                    <View><View className="flex-row items-center mb-2"><Trophy size={18} color="#16a34a" className="mr-2" /><Text className="text-sm font-bold" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('sponsors')}</Text></View>
                        <View className="flex-row flex-wrap">{allSponsors.map(s => (
                            <TouchableOpacity key={s.id} onPress={() => toggleSponsor(s.id)} disabled={isSaving} className={`mr-2 mb-2 px-4 py-2 rounded-full border-2 flex-row items-center ${formData.sponsor_ids.includes(s.id) ? 'bg-green-600 border-green-600' : 'border-gray-300'}`}>
                                {formData.sponsor_ids.includes(s.id) && <CheckCircle2 size={14} color="white" style={{marginRight: 6}} />}
                                <Text className={`text-xs font-bold ${formData.sponsor_ids.includes(s.id) ? 'text-white' : 'text-gray-500'}`}>{s.name}</Text>
                            </TouchableOpacity>
                        ))}</View></View>

                    {/* --- ВЫВОД МАТЧЕЙ (ИСПРАВЛЕННАЯ ВЕРСИЯ) --- */}
                    {!isNew && matches && matches.length > 0 ? (
                        <View className="mt-4 mb-2">
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-row items-center">
                                    <Swords size={20} color="#f43f5e" className="mr-2" />
                                    <Text className="text-lg font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                        {t('matches')}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={() => navigation.navigate('CreateMatch', { tournamentId: id })}
                                    className="bg-indigo-600/10 p-2 rounded-lg border border-indigo-600/20"
                                >
                                    <Plus size={18} color="#6366f1" />
                                </TouchableOpacity>
                            </View>

                            {matches.map((m: any) => (
                                <View
                                    key={m.id}
                                    className="rounded-2xl border mb-4 overflow-hidden"
                                    style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#e5e7eb' }}
                                >
                                    {/* 1. ВЕРХНЯЯ ЗОНА: НАСТРОЙКИ */}
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('CreateMatch', { tournamentId: id, match: m })}
                                        className="flex-row justify-between items-center px-4 py-2 bg-black/5 border-b"
                                        style={{ borderColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}
                                    >
                                        <View className="flex-row items-center">
                                            <Settings size={12} color="#6366f1" className="mr-2" />
                                            <Text className="text-[10px] font-bold uppercase text-indigo-500">
                                                {m.stage_name} (BO{m.best_of})
                                            </Text>
                                        </View>
                                        <Text className="text-[10px] font-bold" style={{ color: m.status === 'live' ? '#ef4444' : (theme === 'dark' ? '#9ca3af' : '#6b7280') }}>
                                            {t(m.status)}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* 2. НИЖНЯЯ ЗОНА: ПРОСМОТР */}
                                    <TouchableOpacity
                                        onPress={() => navigation.navigate('MatchMaps', { match: m, team1: m.team1, team2: m.team2 })}
                                        className="p-4"
                                    >
                                        <View className="flex-row items-center justify-between">
                                            <View className="flex-row items-center flex-1">
                                                {m.team1?.logo_url ? (
                                                    <Image source={{uri: m.team1.logo_url}} className="w-8 h-8 mr-2 bg-white rounded p-0.5" resizeMode="contain" />
                                                ) : null}
                                                <Text className="font-bold text-xs" numberOfLines={1} style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                                    {m.team1?.name}
                                                </Text>
                                            </View>

                                            <View className="px-4">
                                                <Text className="text-xl font-black" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>
                                                    {m.team1_score} - {m.team2_score}
                                                </Text>
                                            </View>

                                            <View className="flex-row items-center flex-1 justify-end">
                                                <Text className="font-bold text-xs mr-2 text-right" numberOfLines={1} style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                                                    {m.team2?.name}
                                                </Text>
                                                {m.team2?.logo_url ? (
                                                    <Image source={{uri: m.team2.logo_url}} className="w-8 h-8 bg-white rounded p-0.5" resizeMode="contain" />
                                                ) : null}
                                            </View>
                                        </View>
                                    </TouchableOpacity>

                                    {m.stream_url ? (
                                        <TouchableOpacity onPress={() => Linking.openURL(m.stream_url)} className="mx-4 mb-4 py-2 rounded-lg flex-row items-center justify-center bg-rose-500/10 border border-rose-500/30">
                                            <Tv size={14} color="#f43f5e" className="mr-2" />
                                            <Text className="text-xs font-bold text-rose-500">{t('watch_stream') || 'Watch Stream'}</Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            ))}
                        </View>
                    ) : null}

                    <View><Text className="text-sm font-bold mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('date')}</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} disabled={isSaving} className="p-3 pl-10 rounded-xl border flex-row items-center" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db' }}><View className="absolute left-3"><Calendar size={18} color="#9ca3af" /></View><Text style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{formData.date}</Text></TouchableOpacity>
                        {showDatePicker && <DateTimePicker value={new Date(formData.date)} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} onChange={onDateChange} />}</View>

                    <View><Text className="text-sm font-bold mb-1" style={{ color: theme === 'dark' ? '#d1d5db' : '#374151' }}>{t('description')}</Text>
                        <TextInput multiline numberOfLines={4} value={formData.description} onChangeText={t => setFormData({...formData, description: t})} editable={!isSaving} className="p-3 rounded-xl border" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#4b5563' : '#d1d5db', color: theme === 'dark' ? '#ffffff' : '#111827' }} textAlignVertical="top" /></View>

                    <View className="mt-8 mb-10 space-y-4">
                        <TouchableOpacity onPress={handleSave} disabled={isSaving} className={`w-full py-4 rounded-xl shadow-md items-center justify-center ${isSaving ? 'bg-indigo-400' : 'bg-indigo-600'}`}>{isSaving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">{t('save')}</Text>}</TouchableOpacity>
                        {!isNew && <TouchableOpacity onPress={handleShare} disabled={isSaving} className="w-full py-4 rounded-xl border-2 flex-row items-center justify-center" style={{ borderColor: '#6366f1' }}><Share2 size={20} color="#6366f1" /><Text className="ml-2 font-bold text-lg" style={{ color: '#6366f1' }}>{t('share')}</Text></TouchableOpacity>}
                    </View>
                </View>
            </KeyboardAwareScrollView>

            <Modal visible={isModalVisible} transparent={true} animationType="slide" onRequestClose={() => setModalVisible(false)}>
                <TouchableOpacity className="flex-1 justify-end bg-black/50" activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View className="rounded-t-3xl p-6" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}>
                        <View className="flex-row justify-between items-center mb-6"><Text className="text-xl font-bold" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>{t('select_image')}</Text><TouchableOpacity onPress={() => setModalVisible(false)}><X size={24} color="#9ca3af" /></TouchableOpacity></View>
                        <TouchableOpacity onPress={() => { setModalVisible(false); setTimeout(openCamera, 300); }} className="flex-row items-center p-4 mb-3 rounded-xl bg-gray-100" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}><Camera size={20} color="#4f46e5" /><Text className="ml-4 text-lg font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#374151' }}>{t('take_photo')}</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => { setModalVisible(false); setTimeout(openGallery, 300); }} className="flex-row items-center p-4 mb-6 rounded-xl bg-gray-100" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#f3f4f6' }}><ImageIcon size={20} color="#16a34a" /><Text className="ml-4 text-lg font-medium" style={{ color: theme === 'dark' ? '#ffffff' : '#374151' }}>{t('choose_gallery')}</Text></TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};