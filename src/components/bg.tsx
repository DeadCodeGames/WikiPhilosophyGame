function GridBG() {
    return (
        <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,#000_70%)]"></div>
        </div>
    )
}

function GlowFX() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none animate-spin">
            <div className="absolute top-1/2 left-[12.5%] w-[min(25vw,25vh)] h-[min(25vw,25vh)] bg-white/20 rounded-full mix-blend-lighten filter blur-[min(5vw,5vh)] opacity-50 animate-pulse"></div>
            <div className="absolute bottom-1/2 right-[12.5%] w-[min(25vw,25vh)] h-[min(25vw,25vh)] bg-white/20 rounded-full mix-blend-lighten filter blur-[min(5vw,5vh)] opacity-50 animate-pulse"></div>
        </div>
    )
}

export { GridBG, GlowFX }