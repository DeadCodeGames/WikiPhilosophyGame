import { GridBG, GlowFX } from '@/components/bg'
import i18n from '@/locales/i18n';
import { t } from 'i18next';
import { Sun, Moon, X, Check, GitPullRequest, Code2, ExternalLink } from 'lucide-react';
import { useLayoutEffect, useState } from 'react';
import { Trans } from 'react-i18next';
import Twemoji from 'react-twemoji';

interface CommitAuthor {
    email: string;
    id: string;
    login: string;
    name: string;
}

interface Commit {
    authoredDate: string; // ISO 8601 string
    authors: CommitAuthor[];
    committedDate: string; // ISO 8601 string
    messageBody: string;
    messageHeadline: string;
    oid: string;
}

interface PullRequest {
    commits: Commit[];
    headRefName: string;
    number: number;
    failed?: boolean;
}

export default function Preview({ PRs }: { PRs: PullRequest[] }) {
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

    console.log(PRs)

    return (
        <div className="min-h-screen bg-white dark:bg-black transition-colors relative overflow-hidden flex flex-col items-center">
            <div className='pointer-events-none'>
                <GridBG />
                <GlowFX />
            </div>
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
            <h1 className='text-5xl font-bold mt-8 mb-1 text-black dark:text-white tracking-tight font-wiki'>
                {t('title')}
            </h1>
            <h3 className='text-3xl font-bold mb-3 text-black dark:text-white tracking-tight font-mono'>
                {t('preview.title')}
            </h3>
            <span className='text-lg font-bold mb-3 text-black dark:text-white tracking-tight font-mono flex flex-row gap-x-4 items-center'><code className="text-lg font-bold py-1.5 px-3 text-black bg-[#F0F0F0] dark:text-white dark:bg-[#0F0F0F] rounded-[12px] tracking-tight font-mono">main</code> <a href="https://github.com/DeadCodeGames/WikiPhilosophyGame/tree/main" target='_blank' rel='norefferer noopener' className='cursor-pointer flex flex-row items-center gap-x-2'>{t("preview.GitHubBranch")}<Code2 /></a><a href='/' className='cursor-pointer flex flex-row items-center gap-x-2'>{t("preview.previewLink")}<ExternalLink /></a></span>
            {PRs.map(pr =>
            (<span className='text-lg font-bold mb-3 text-black dark:text-white tracking-tight font-mono flex flex-row gap-x-4 items-center' key={pr.number}>
                {pr.failed === true ? <X className="size-8 text-red-700 dark:text-red-400" /> : <Check className="size-8 text-green-700 dark:text-green-400" />}
                <code className='text-lg font-bold py-1.5 px-3 text-black bg-[#F0F0F0] dark:text-white dark:bg-[#0F0F0F] rounded-[12px] tracking-tight font-mono'>{pr.headRefName}</code>
                <a href={`https://github.com/DeadCodeGames/WikiPhilosophyGame/pull/${pr.number}`} target='_blank' rel='norefferer noopener' className='cursor-pointer flex flex-row items-center gap-x-2'><code className='text-lg font-bold py-1.5 px-3 text-black bg-[#F0F0F0] dark:text-white dark:bg-[#0F0F0F] rounded-[12px] tracking-tight font-mono flex items-center gap-x-1'>#{pr.number}<GitPullRequest className='size-4' /></code></a>
                <a href={`https://github.com/DeadCodeGames/WikiPhilosophyGame/tree/${pr.headRefName}`} target='_blank' rel='norefferer noopener' className='cursor-pointer flex flex-row items-center gap-x-2'>{t("preview.GitHubBranch")}<Code2 /></a>
                {!pr.failed && <a href={`/WikiPhilosophyGame/preview/pr-${pr.number}`} className='cursor-pointer flex flex-row items-center gap-x-2'>{t("preview.previewLink")}<ExternalLink /></a>}
            </span>))}
        </div>
    )
}