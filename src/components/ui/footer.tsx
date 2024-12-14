import { useTranslation, Trans } from 'react-i18next';

export default function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="absolute bottom-0 pt-2 pb-3.5 text-black dark:text-white font-mono font-bold w-full text-center *:after:content-['_・_'] last:*:after:content-none">
            <span>{t(process.env.NODE_ENV === "development" ? "footer.devmode" : "footer.prodmode")}</span>
        </footer>
    )
}
