import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridBG, GlowFX } from '@/components/bg'
import Footer from '@/components/ui/footer'
import { parseWikipediaArticle } from '@/utils/wikipediaApi'
import { ArrowRight, Globe, BookOpen, Sparkles, CircleArrowDown, CirclePause, Sun, Moon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import Twemoji from 'react-twemoji';

interface PathStep {
    title: string;
    section?: string;
    isRedirect: boolean;
    redirectTarget?: string;
    redirectSection?: string;
    isLoopCulpit?: boolean;
}

interface Language {
    code: string;
    name: string;
    philosophyTitle: string;
    placeholder: string;
    random?: string;
}

const SUPPORTED_LANGUAGES: Language[] = [
    { code: 'sk', name: 'Slovenčina', philosophyTitle: 'Filozofia', placeholder: "Napíšte názov článku v Slovenskej Wikipédii" },
    { code: 'cs', name: 'Čeština', philosophyTitle: 'Filosofie', placeholder: "Napište název článku v České Wikipédii" },
    { code: 'en', name: 'English', philosophyTitle: 'Philosophy', placeholder: "Enter the title of an English Wikipedia article", random: 'Special:Random' },
    { code: 'fr', name: 'Français', philosophyTitle: 'Philosophie', placeholder: "Entrez le titre d'un article de Wikipedia en français" },
    { code: 'de', name: 'Deutsch', philosophyTitle: 'Philosophie', placeholder: "Geben Sie den Titel eines deutschen Wikipedia-Artikels ein" },
    { code: 'es', name: 'Español', philosophyTitle: 'Filosofía', placeholder: "Introducir el título de un artículo de Wikipedia en español" },
    { code: 'it', name: 'Italiano', philosophyTitle: 'Filosofia', placeholder: "Inserisci il titolo di un articolo di Wikipedia in italiano" },
    { code: 'ja', name: '日本語', philosophyTitle: '哲学', placeholder: "日本語のウィキペディア記事のタイトルを入力してください" },
    { code: 'zh', name: '中文', philosophyTitle: '哲学', placeholder: "请输入中文维基百科文章的标题" },
    { code: 'ko', name: '한국어', philosophyTitle: '철학', placeholder: "한국어 위키백과 문서의 제목을 입력하세요" },
    { code: 'ru', name: 'Русский', philosophyTitle: 'Философия', placeholder: "Введите название статьи в Русском Википедии" },
];

const UI_LANGUAGES = ['en', 'sk'];

export default function WikipediaPhilosophyGame() {
    const location = useLocation();
    const navigate = useNavigate();
    const [startArticle, setStartArticle] = useState('')
    const [path, setPath] = useState<PathStep[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[2])
    const [playingLanguage, setPlayingLanguage] = useState<Language>(SUPPORTED_LANGUAGES[2])
    const pathEndRef = useRef<HTMLDivElement | null>(null);
    const [isUserScrolling, setIsUserScrolling] = useState(false);
    const { t, i18n } = useTranslation();
    const [iLang, setILang] = useState(0);
    const [currentLang, setCurrentLang] = useState(i18n.language);

    useLayoutEffect(() => {
        const savedLang = localStorage.getItem('language') || 'en';
        i18n.changeLanguage(savedLang);
        setCurrentLang(savedLang);
    }, []);

    const changeLang = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('language', lang);
        setCurrentLang(lang);
    };
    

    const getEmojiForLanguage = (lang: string) => {
        return i18n.getResourceBundle(lang, 'translation')?.meta?.emoji || '❓';
    };

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const langParam = params.get('lang');
        const articleParam = params.get('article');

        if (langParam) {
            const language = SUPPORTED_LANGUAGES.find(lang => lang.code === langParam);
            if (language) setSelectedLanguage(language);
        }

        if (articleParam) {
            setStartArticle(articleParam);
        }
    }, [location.search]);

    async function startGame(e?: React.FormEvent, start?: string) {
        e?.preventDefault();
        setIsLoading(true);
        setError(null);
        setPath([]);
        setPlayingLanguage(selectedLanguage);

        let currentArticle = start || startArticle;
        const visitedArticles = new Set<string>();

        const params = new URLSearchParams(location.search);
        params.set('lang', selectedLanguage.code);
        params.set('article', currentArticle);
        navigate(`?${params.toString()}`);

        try {
            let previousStep: PathStep | null = null;

            while (currentArticle.toLowerCase() !== selectedLanguage.philosophyTitle.toLowerCase() &&
                (!visitedArticles.has(currentArticle) ||
                    (visitedArticles.has(currentArticle) && (previousStep?.redirectTarget === currentArticle)))) {
                visitedArticles.add(currentArticle);

                const { title, section, nextLink, isRedirect, redirectTarget, redirectSection } = await parseWikipediaArticle(
                    currentArticle,
                    selectedLanguage.code
                );

                if (previousStep && previousStep?.title === redirectTarget) {
                    break;
                }

                console.log(previousStep, "=>", { title: redirectTarget ? redirectTarget : title, section, nextLink, isRedirect, redirectTarget, redirectSection })

                if (previousStep?.redirectTarget === title) {
                    setPath(prev => [...prev.slice(0, -1), { ...prev[prev.length - 1], nextLink: nextLink || undefined }]);
                } else {
                    const newStep: PathStep = { title, section: section || undefined, isRedirect, redirectTarget: redirectTarget || undefined, redirectSection: redirectSection || undefined };
                    setPath(prev => [...prev, newStep]);
                    previousStep = newStep;
                }

                if (!nextLink) {
                    throw new Error(`No valid links found in "${title}"`);
                }

                currentArticle = nextLink;
            }

            if (currentArticle.toLowerCase() === selectedLanguage.philosophyTitle.toLowerCase()) {
                setPath(prev => [...prev, { title: selectedLanguage.philosophyTitle, isRedirect: false }]);
            } else {
                const { title, section, nextLink, isRedirect, redirectTarget, redirectSection } = await parseWikipediaArticle(
                    currentArticle,
                    selectedLanguage.code
                );

                setPath(prev => [...prev.map(step => ({ ...step, isLoopCulpit: (((step.title === title) || (step.redirectTarget !== undefined && (step.redirectTarget === title))) || (redirectTarget !== undefined && (step.title === redirectTarget || (step.redirectTarget !== undefined && step.redirectTarget === redirectTarget)))) })), { title, section, nextLink, isRedirect, redirectTarget: redirectTarget || undefined, redirectSection: redirectSection || undefined, isLoopCulpit: true }]);
                setError('A loop was detected in the article chain.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    async function fetchRandomArticle() {
        const response = await fetch(`https://${selectedLanguage.code}.wikipedia.org/api/rest_v1/page/random/title`);
        const data = await response.json();
        const randomTitle = data.items[0].title;
        setStartArticle(randomTitle);
        startGame(undefined, randomTitle);
    }

    useEffect(() => {
        if (!isUserScrolling) {
            pathEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [path, isUserScrolling]);

    const toggleScroll = () => {
        setIsUserScrolling(prev => !prev);
    };

    const handleLanguageChange = (value: string) => {
        const language = SUPPORTED_LANGUAGES.find(lang => lang.code === value);
        if (language) {
            setSelectedLanguage(language);
            const params = new URLSearchParams(location.search);
            params.set('lang', language.code);
            navigate(`?${params.toString()}`);
        }
    };

    const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        localStorage.theme = darkMode ? 'light' : 'dark';
        document.documentElement.classList.toggle('dark');
    }

    const cycleUILang = () => {
        const currentIndex = UI_LANGUAGES.findIndex(lang => lang === i18n.language);
        const nextIndex = (currentIndex + 1) % UI_LANGUAGES.length;
        changeLang(UI_LANGUAGES[nextIndex]);
        setILang(nextIndex);
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black relative overflow-hidden flex">
            <GridBG />
            <GlowFX />

            <div className="container mx-auto p-4 relative self-center">
                <div className="max-w-4xl mx-auto pt-12 pb-8">
                    <div className="text-center mb-12 animate-fade-in flex flex-col items-center">
                        <div className='flex flex-row gap-0 hover:gap-5 justify-center align-middle items-center group/icons transition-[gap] duration-300 w-fit'>
                            <div className="block p-3 bg-black/10 dark:bg-white/5 backdrop-blur-sm rounded-full mb-4 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 -mr-8 scale-75 z-0 group-hover/icons:mr-0 group-hover/icons:scale-100 opacity-75 group-hover/icons:opacity-100" onClick={cycleUILang}>
                                <Trans i18nKey="langEmoji">
                                    <Twemoji key={currentLang} options={{ className: 'twemoji size-12' }}></Twemoji>
                                </Trans>
                            </div>
                            <div className="block p-5 bg-black/10 dark:bg-white/5 backdrop-blur-sm rounded-full mb-4 transition-all duration-300 z-10">
                                <BookOpen className="size-16 text-black dark:text-white translate-y-0.5" />
                            </div>
                            <div className="block p-3 bg-black/10 dark:bg-white/5 backdrop-blur-sm rounded-full mb-4 hover:bg-black/10 dark:hover:bg-white/10 transition-all duration-300 -ml-8 scale-75 z-0 group-hover/icons:ml-0 group-hover/icons:scale-100 opacity-75 group-hover/icons:opacity-100">
                                {document.documentElement.classList.contains('dark') ? <Sun className="size-12 text-black dark:text-white" onClick={toggleDarkMode} /> : <Moon className="size-12 text-black dark:text-white" onClick={toggleDarkMode} />}
                            </div>
                        </div>
                        <h1 className="text-5xl font-bold mb-3 text-black dark:text-white tracking-tight font-wiki">
                            {t('title')}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            {t('subtitle')}
                        </p>
                    </div>

                    <form onSubmit={startArticle === 'Special:Random' ? (e) => { e.preventDefault(); fetchRandomArticle() } : startGame} className="mb-8 animate-slide-up">
                        <div className="flex gap-3">
                            <Select
                                value={selectedLanguage.code}
                                onValueChange={handleLanguageChange}
                            >
                                <SelectTrigger className="w-[180px] bg-black/5 dark:bg-white/5 backdrop-blur-sm border-black/10 dark:border-white/10 text-black dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors rounded-[8px] grain">
                                    <Globe className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent className="bg-white/95 border-black/10 text-black dark:bg-black/95 dark:border-white/10 dark:text-white rounded-[8px]">
                                    {SUPPORTED_LANGUAGES.map((language) => (
                                        <SelectItem key={language.code} value={language.code} className="hover:bg-black/50 dark:hover:bg-white/50 cursor-pointer rounded-[8px] transition-colors">
                                            {language.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="text"
                                value={startArticle}
                                onChange={(e) => setStartArticle(e.target.value)}
                                placeholder={selectedLanguage.placeholder}
                                required
                                className="flex-grow bg-black/5 dark:bg-white/5 backdrop-blur-sm border-black/10 text-black placeholder:text-gray-400 focus:border-black/20 hover:bg-black/10 dark:border-white/10 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-white/20 dark:hover:bg-white/10 transition-colors rounded-[8px] grain"
                            />
                            <Button
                                type="button"
                                onClick={fetchRandomArticle}
                                disabled={isLoading}
                                className="bg-white dark:bg-black hover:bg-[#F0F0F0] dark:hover:bg-[#0F0F0F] border-black/100 dark:border-white/100 border-solid border-2 rounded-[8px] text-black dark:text-white"
                            >
                                {t('randomButton')}<Sparkles />
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors px-6 rounded-[8px]"
                            >
                                {isLoading ? t('searchInProgress') : t('searchStart')}
                            </Button>
                        </div>
                    </form>

                    {error && (
                        <Card className="mb-8 bg-red-400/10 dark:bg-red-500/10 border-red-400/20 dark:border-red-500/20 text-black dark:text-white animate-fade-in relative grain">
                            <CardHeader>
                                <CardTitle className="text-red-700 dark:text-red-400">{(error === ("A loop was detected in the article chain.") || error.startsWith("No valid links found in ")) ? t('gameOver') : t('error')}</CardTitle>
                            </CardHeader>
                            <CardContent>{(error === ("A loop was detected in the article chain.") ? t("loopDetected") : error.startsWith("No valid links found in ") ? t("noLinks") : error)}</CardContent>
                        </Card>
                    )}

                    {path.length > 0 && (
                        <Card className="bg-black/5 dark:bg-white/5 backdrop-blur-sm border-dark/10 dark:border-white/10 animate-slide-up relative grain">
                            <CardHeader>
                                <CardTitle className="text-black dark:text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    <span className="flex items-center gap-1">
                                        <Trans i18nKey="pathToPhilosophy" values={{ philosophyTitle: playingLanguage.philosophyTitle }} className='gap-1'>
                                            <span className={`${path[path.length - 1].title.toLowerCase() === playingLanguage.philosophyTitle.toLowerCase() ? "text-green-700 dark:text-green-500" : path[path.length - 1].isLoopCulpit ? "text-red-700 dark:text-red-500" : "text-black dark:text-white"} transition-colors`} ></span>
                                        </Trans>
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-3">
                                    {path.map((step, index) => (
                                        <div key={index} className="flex items-center group animate-fade-in">
                                            <span className={`font-medium ${step.title.toLowerCase() === playingLanguage.philosophyTitle.toLowerCase() ? "text-green-700 dark:text-green-500" : step.isLoopCulpit ? "text-red-600 group-hover:text-red-800" : "text-black group-hover:text-gray-700 dark:text-white dark:group-hover:text-gray-300"} transition-colors`}>
                                                <a href={`https://${playingLanguage.code}.wikipedia.org/wiki/${encodeURIComponent(step.redirectTarget ? step.redirectTarget : step.title)}`} target="_blank" rel="noopener noreferrer">
                                                    {step.redirectTarget ? step.redirectTarget : step.title}
                                                </a>
                                            </span>
                                            {(step.isRedirect || step.section || step.redirectSection) && (
                                                <span className={`text-xs ${step.title.toLowerCase() === playingLanguage.philosophyTitle.toLowerCase() ? "text-green-100 dark:text-green-900" : step.isLoopCulpit ? "text-red-100 dark:text-red-900" : "text-gray-500 dark:text-gray-400"} ml-1 translate-y-0.5`}>
                                                    ({step.redirectSection && (<Trans
                                                        i18nKey="sectionMarker"
                                                        values={{ section: step.redirectSection }}
                                                    ><a href={`https://${playingLanguage.code}.wikipedia.org/wiki/${encodeURIComponent(step.redirectTarget ?? step.title)}#${encodeURIComponent(step.redirectSection)}`} target="_blank" rel="noopener noreferrer" />
                                                    </Trans>)}
                                                    {(step.redirectSection && (step.title || step.section)) && t('contextSeparator')}
                                                    {step.title && (<Trans
                                                        i18nKey="redirectedMarker"
                                                        values={{ title: step.title }}
                                                    ><a href={`https://${playingLanguage.code}.wikipedia.org/wiki/${encodeURIComponent(step.title)}`} target="_blank" rel="noopener noreferrer" />
                                                    </Trans>)}
                                                    {((step.redirectSection || step.title) && step.section) && t('contextSeparator')}
                                                    {step.section && (<Trans
                                                        i18nKey="sectionMarker"
                                                        values={{ section: step.section }}
                                                    ><a href={`https://${playingLanguage.code}.wikipedia.org/wiki/${encodeURIComponent(step.title)}#${encodeURIComponent(step.section)}`} target="_blank" rel="noopener noreferrer" />
                                                    </Trans>)})
                                                </span>
                                            )}
                                            {index < path.length - 1 && (
                                                <ArrowRight className="ml-2 text-gray-500 dark:text-gray-400 transition-transform" />
                                            )}
                                        </div>
                                    ))}
                                    <div ref={pathEndRef} />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>

            {/* Toggle Scroll Button */}
            <Button
                onClick={toggleScroll}
                className="fixed bottom-4 right-4 z-10 bg-black dark:bg-white text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors p-0 rounded-full aspect-square scale-100 hover:scale-125 transition-transform"
            >
                {isUserScrolling ? <CircleArrowDown className="scale-150" /> : <CirclePause className="scale-150" />}
            </Button>

            <Footer />
        </div>
    );
}