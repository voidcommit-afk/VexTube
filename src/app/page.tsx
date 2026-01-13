import Link from 'next/link';
import { Sparkles, PenTool, Layout, ArrowRight } from 'lucide-react';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#171717] flex flex-col items-center justify-center text-gray-200 p-6 selection:bg-green-500/30">

            <main className="max-w-4xl mx-auto w-full text-center space-y-12 animate-slide-in">

                {/* Hero Section */}
                <div className="space-y-6">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
                        VexTube
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light">
                        A focused YouTube player designed for distraction-free learning
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 text-left py-12">
                    <div className="p-6 rounded-2xl bg-[#232323] border border-gray-800 hover:border-green-500/50 transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Layout className="w-6 h-6 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Focused Player</h3>
                        <p className="text-gray-400">Remove distractions and focus entirely on your content with our simplified interface.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#232323] border border-gray-800 hover:border-blue-500/50 transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-6 h-6 text-blue-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">AI Summaries</h3>
                        <p className="text-gray-400">Generate concise summaries of videos instantly to grasp key concepts faster.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#232323] border border-gray-800 hover:border-purple-500/50 transition-colors group">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <PenTool className="w-6 h-6 text-purple-500" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Smart Notes</h3>
                        <p className="text-gray-400">Take seamless notes while watching, automatically synced to video timestamps.</p>
                    </div>
                </div>

                {/* CTA */}
                <div>
                    <Link
                        href="/app"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 text-lg"
                    >
                        Launch App
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

            </main>

            <footer className="fixed bottom-6 text-gray-600 text-sm">
                © {new Date().getFullYear()} VexTube
            </footer>
        </div>
    );
}
