import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://oyhoxxbtzakonitduqvs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95aG94eGJ0emFrb25pdGR1cXZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODExODAsImV4cCI6MjA5Mzg1NzE4MH0.UyiSSU_kRa1DlK3dzUZdZUK30uNiD_1UWAMYA1AOnBw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});