import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridBG, GlowFX } from '@/components/bg'
import Footer from '@/components/ui/footer'
import { parseWikipediaArticle } from '@/utils/wikipediaApi'
import { ArrowRight, Globe, BookOpen, Sparkles, CircleArrowDown, CirclePause } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

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

                console.log(previousStep, "=>", { title, section, nextLink, isRedirect, redirectTarget, redirectSection })

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
                const { title, isRedirect, redirectTarget } = await parseWikipediaArticle(
                    currentArticle,
                    selectedLanguage.code
                );
                setPath(prev => [...prev.map(step => ({ ...step, isLoopCulpit: step.title === title })), { title, isRedirect, redirectTarget: redirectTarget || undefined, isLoopCulpit: true }]);
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

    return (
        <div className="min-h-screen bg-black relative overflow-hidden flex">
            <GridBG />
            <GlowFX />

            <div className="container mx-auto p-4 relative self-center">
                <div className="max-w-4xl mx-auto pt-12 pb-8">
                    <div className="text-center mb-12 animate-fade-in">
                        <div className="inline-block p-3 bg-white/5 backdrop-blur-sm rounded-full mb-4 hover:bg-white/10 transition-all duration-300">
                            <BookOpen className="w-12 h-12 text-white translate-y-0.5" />
                        </div>
                        <h1 className="text-5xl font-bold mb-3 text-white tracking-tight font-wiki">
                            Wikipedia Philosophy Game
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto">
                            Start with any article and follow the first link to see if you can reach Philosophy!
                        </p>
                    </div>

                    <form onSubmit={startArticle === 'Special:Random' ? (e) => {e.preventDefault(); fetchRandomArticle()} : startGame} className="mb-8 animate-slide-up">
                        <div className="flex gap-3">
                            <Select
                                value={selectedLanguage.code}
                                onValueChange={handleLanguageChange}
                            >
                                <SelectTrigger className="w-[180px] bg-white/5 backdrop-blur-sm border-white/10 text-white hover:bg-white/10 transition-colors rounded-[8px] grain">
                                    <Globe className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                                <SelectContent className="bg-black/95 border-white/10 text-white rounded-[8px]">
                                    {SUPPORTED_LANGUAGES.map((language) => (
                                        <SelectItem key={language.code} value={language.code} className="hover:bg-white/50 hover:text-red cursor-pointer">
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
                                className="flex-grow bg-white/5 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-white/20 hover:bg-white/10 transition-colors rounded-[8px] grain"
                            />
                            <Button
                                type="button"
                                onClick={fetchRandomArticle}
                                className="bg-black hover:bg-[#0F0F0F] border-white/100 border-solid border-2 rounded-[8px] text-white"
                            >
                                Surprise me!<Sparkles />
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-white text-black hover:bg-gray-200 transition-colors px-6 rounded-[8px]"
                            >
                                {isLoading ? 'Searching...' : 'Start'}
                            </Button>
                        </div>
                    </form>

                    {error && (
                        <Card className="mb-8 bg-red-500/10 border-red-500/20 text-white animate-fade-in relative grain">
                            <CardHeader>
                                <CardTitle className="text-red-400">{(error === ("A loop was detected in the article chain.") || error.startsWith("No valid links found in ")) ? "Game Over" : "Error"}</CardTitle>
                            </CardHeader>
                            <CardContent>{error}</CardContent>
                        </Card>
                    )}

                    {path.length > 0 && (
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10 animate-slide-up relative grain">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5" />
                                    Path to <span className={`${path[path.length - 1].title.toLowerCase() === playingLanguage.philosophyTitle.toLowerCase() ? "text-green-600" : path[path.length - 1].isLoopCulpit ? "text-red-600" : "text-white"} transition-colors`}>{playingLanguage.philosophyTitle}</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap items-center gap-3">
                                    {path.map((step, index) => (
                                        <div key={index} className="flex items-center group animate-fade-in">
                                            <span className={`font-medium ${step.title.toLowerCase() === playingLanguage.philosophyTitle.toLowerCase() ? "text-green-600" : step.isLoopCulpit ? "text-red-600 group-hover:text-red-800" : "text-white group-hover:text-gray-300"} transition-colors`}>
                                                <a href={`https://${playingLanguage.code}.wikipedia.org/wiki/${encodeURIComponent(step.redirectTarget ? step.redirectTarget : step.title)}`} target="_blank" rel="noopener noreferrer">
                                                    {step.redirectTarget ? step.redirectTarget : step.title}
                                                </a>
                                            </span>
                                            {(step.isRedirect || step.section || step.redirectSection) && (
                                                <span className={`text-xs ${step.title.toLowerCase() === playingLanguage.philosophyTitle.toLowerCase() ? "text-green-900" :step.isLoopCulpit ? "text-red-900" : "text-gray-400"} ml-1 translate-y-0.5`}>
                                                    (<a href={`https://${playingLanguage.code}.wikipedia.org/wiki/${encodeURIComponent(step.title)}`} target="_blank" rel="noopener noreferrer">
                                                        {[step.redirectSection ? ("section #" + step.redirectSection) : null, step.title ? ("redirected from " + step.title) : null, step.section ? ("section #" + step.section) : null].filter(Boolean).join(", ")}
                                                    </a>)
                                                </span>
                                            )}
                                            {index < path.length - 1 && (
                                                <ArrowRight className="ml-2 text-gray-400 transition-transform" />
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
                className="fixed bottom-4 right-4 bg-white text-black hover:bg-gray-200 transition-colors p-0 rounded-full aspect-square scale-4"
            >
                {isUserScrolling ? <CircleArrowDown className="scale-150" /> : <CirclePause className="scale-150" />}
            </Button>

            <Footer />
        </div>
    );
}