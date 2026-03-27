import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const useSettings = () => {
    // Забираем логику тем
    const { theme, toggleTheme } = useTheme();

    // Забираем логику языков
    const { language, setLanguage, t } = useLanguage();

    return {
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
    };
};