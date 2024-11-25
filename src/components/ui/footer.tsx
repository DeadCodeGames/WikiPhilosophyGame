export default function Footer() {
    return (
        <footer className="absolute bottom-0 py-2 text-white font-mono font-bold w-full text-center">
            <span>{process.env.NODE_ENV === "development" ? "Development Mode" : "Production Build"}</span>
        </footer>
    )
}