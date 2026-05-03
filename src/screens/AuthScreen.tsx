import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Mail, Lock, Trophy } from 'lucide-react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';

export const AuthScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useLanguage();
    const { theme } = useTheme();

    // УМНАЯ ФУНКЦИЯ ДЛЯ ПЕРЕВОДА ОШИБОК FIREBASE
    const getErrorMessage = (errorCode: string) => {
        switch (errorCode) {
            case 'auth/invalid-email': return t('err_invalid_email');
            case 'auth/user-not-found': return t('err_user_not_found');
            case 'auth/wrong-password': return t('err_wrong_password');
            case 'auth/email-already-in-use': return t('err_email_in_use');
            case 'auth/weak-password': return t('err_weak_password');
            default: return t('err_default');
        }
    };

    const handleLogin = async () => {
        // Заменяем страшный Alert на красивый красный Toast
        if (!email || !password) {
            return Toast.show({ type: 'error', text1: t('error'), text2: t('fill_all_fields') });
        }

        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), password);
            Toast.show({ type: 'success', text1: 'Успешно!', text2: 'Вы вошли в систему' });
        } catch (error: any) {
            // Показываем красивую переведенную ошибку
            Toast.show({ type: 'error', text1: t('auth_error'), text2: getErrorMessage(error.code) });
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async () => {
        if (!email || !password) {
            return Toast.show({ type: 'error', text1: t('error'), text2: t('fill_all_fields') });
        }

        setIsLoading(true);
        try {
            await createUserWithEmailAndPassword(auth, email.trim(), password);
            Toast.show({ type: 'success', text1: 'Успешно!', text2: 'Аккаунт создан' });
        } catch (error: any) {
            Toast.show({ type: 'error', text1: t('auth_error'), text2: getErrorMessage(error.code) });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 justify-center p-6" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#f9fafb' }}>
            <View className="items-center mb-10">
                <View className="w-24 h-24 bg-indigo-600 rounded-full items-center justify-center mb-4 shadow-lg">
                    <Trophy size={48} color="white" />
                </View>
                <Text className="text-3xl font-bold text-center" style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}>
                    {t('app_name')}
                </Text>
            </View>

            <View className="space-y-4">
                <View className="flex-row items-center border p-3 rounded-xl" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }}>
                    <Mail size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                        className="flex-1"
                        placeholder={t('email')}
                        placeholderTextColor="#9ca3af"
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                    />
                </View>

                <View className="flex-row items-center border p-3 rounded-xl" style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', borderColor: theme === 'dark' ? '#374151' : '#d1d5db' }}>
                    <Lock size={20} color="#9ca3af" className="mr-3" />
                    <TextInput
                        className="flex-1"
                        placeholder={t('password')}
                        placeholderTextColor="#9ca3af"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={{ color: theme === 'dark' ? '#ffffff' : '#111827' }}
                    />
                </View>

                {isLoading ? (
                    <ActivityIndicator size="large" color="#4f46e5" className="my-4" />
                ) : (
                    <View className="mt-6 space-y-3">
                        <TouchableOpacity onPress={handleLogin} className="w-full bg-indigo-600 py-4 rounded-xl items-center shadow-md mb-3">
                            <Text className="text-white font-bold text-lg">{t('login')}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleRegister} className="w-full border border-indigo-600 py-4 rounded-xl items-center">
                            <Text className="font-bold text-lg" style={{ color: theme === 'dark' ? '#818cf8' : '#4f46e5' }}>{t('register')}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
};