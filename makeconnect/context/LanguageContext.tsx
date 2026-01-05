import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LanguageCode } from '../constants/translations';

interface LanguageContextProps {
    currentLanguage: LanguageCode;
    setLanguage: (code: LanguageCode) => Promise<void>;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentLanguage, setCurrentLanguageState] = useState<LanguageCode>('en');

    useEffect(() => {
        loadLanguage();
    }, []);

    const loadLanguage = async () => {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        if (savedLanguage && (savedLanguage as any) in translations) {
            setCurrentLanguageState(savedLanguage as LanguageCode);
        }
    };

    const setLanguage = async (code: LanguageCode) => {
        setCurrentLanguageState(code);
        await AsyncStorage.setItem('appLanguage', code);
    };

    const t = (path: string) => {
        const keys = path.split('.');
        let result = translations[currentLanguage];
        for (const key of keys) {
            if (result && result[key]) {
                result = result[key];
            } else {
                return path; // Return key if translation not found
            }
        }
        return result as string;
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
