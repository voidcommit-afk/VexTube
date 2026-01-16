import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
    return (
        <div className="bg-vex-bg text-vex-text antialiased selection:bg-vex-primary selection:text-black flex flex-col min-h-screen">

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-vex-border/50 bg-vex-bg/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image
                            src="/logo.jpg"
                            alt="VexTube Logo"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="font-bold text-xl tracking-tight text-white">VexTube</span>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow flex items-center justify-center relative pt-20 pb-16 px-4 sm:px-6 overflow-hidden">

                {/* Background Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-vex-primary/5 blur-[100px] rounded-full -z-10 pointer-events-none"></div>

                <div className="max-w-3xl mx-auto text-center flex flex-col items-center">

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-vex-surface border border-vex-border mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-vex-primary animate-pulse"></span>
                        <span className="text-xs font-medium text-vex-muted uppercase tracking-wider">v2.0 Now Live</span>
                    </div>

                    {/* Hero Heading */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        YouTube, but for <br />
                        <span className="text-vex-primary">Deep Focus.</span>
                    </h1>

                    {/* Subheading */}
                    <p className="text-lg sm:text-xl text-vex-muted mb-10 leading-relaxed max-w-2xl mx-auto">
                        Remove ads, comments, and algorithm rabbit holes.
                        Take <span className="text-white font-medium">smart notes</span> with instant export.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                        <Link
                            href="/app"
                            className="h-12 px-8 rounded-lg bg-vex-primary hover:bg-vex-primaryHover text-black font-bold flex items-center justify-center transition-all hover:scale-105 shadow-glow"
                        >
                            Launch Player ➔
                        </Link>

                        <Link
                            href="/login"
                            className="h-12 px-8 rounded-lg bg-vex-surface border border-vex-border hover:border-white/50 text-white font-medium flex items-center justify-center transition-all"
                        >
                            Sign In
                        </Link>
                    </div>

                </div>
            </main>

            {/* Footer */}
            <footer className="py-8 border-t border-vex-border/30">
                <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 text-center opacity-70">
                    <span className="flex items-center gap-2 text-sm text-vex-muted">
                        🚫 No Ads
                    </span>
                    <span className="flex items-center gap-2 text-sm text-vex-muted">
                        📝 Export-ready note taking (Desktop)
                    </span>
                    <span className="flex items-center gap-2 text-sm text-vex-muted">
                        🎯 Progress tracking
                    </span>
                </div>
            </footer>

        </div>
    );
}
