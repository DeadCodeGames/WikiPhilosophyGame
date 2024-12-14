import { GridBG, GlowFX } from '@/components/bg'
import i18n from '@/locales/i18n';
import { Sun, Moon } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import Twemoji from 'react-twemoji';

export default function Preview() {
    const UI_LANGUAGES = ['en', 'sk', 'cs', 'ja', 'zh'];
    const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
    const [currentLang, setCurrentLang] = useState(i18n.language);
    const [iLang, setILang] = useState(0);

    useLayoutEffect(() => {
        const savedLang = localStorage.getItem('language') || 'en';
        i18n.changeLanguage(savedLang);
        setCurrentLang(savedLang);
    }, []);

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        localStorage.theme = darkMode ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark');
    }

    const changeLang = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
        setCurrentLang(lang);
    };

    const cycleUILang = () => {
        const currentIndex = UI_LANGUAGES.findIndex(lang => lang === i18n.language);
        const nextIndex = (currentIndex + 1) % UI_LANGUAGES.length;
        changeLang(UI_LANGUAGES[nextIndex]);
        setILang(nextIndex);
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors relative overflow-hidden flex">
            <GridBG />
            <GlowFX />
            <div className='flex flex-col gap-0 hover:gap-5 hoverNone:gap-5 justify-center align-middle items-center group/icons transition-[gap] duration-300 w-fit'>
                <div className="block p-2 bg-black/10 dark:bg-white/5 backdrop-blur-sm rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 scale-75 z-0 hover:ml-0 hover:scale-100 opacity-75 hover:opacity-100 hoverNone:ml-0 hoverNone:scale-100 absolute top-4 left-4">
                    {darkMode ? <Sun className="size-8 text-black dark:text-white" onClick={toggleDarkMode} /> : <Moon className="size-8 text-black dark:text-white" onClick={toggleDarkMode} />}
                </div>
                <div className="block p-2 bg-black/10 dark:bg-white/5 backdrop-blur-sm rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 scale-75 z-0 hover:mr-0 hover:scale-100 opacity-75 hover:opacity-100 hoverNone:mr-0 hoverNone:scale-100 absolute top-4 right-4" onClick={cycleUILang}>
                    <Trans i18nKey="langEmoji">
                        <Twemoji key={currentLang} options={{ className: 'twemoji size-8' }}></Twemoji>
                    </Trans>
                </div>
            </div>
        </div>
    )
}