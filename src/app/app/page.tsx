'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Play, Clock, PenLine, Home, ArrowLeft } from 'lucide-react';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PlaylistProgress } from '@/components/PlaylistProgress';
import { PlaylistSidebar } from '@/components/PlaylistSidebar';
import { PlaylistData } from '@/lib/types';
import { saveToStorage, loadFromStorage, getStoredVideoStatus, clearStorage } from '@/lib/storage';
import { fetchPlaylistVideos } from '@/lib/youtube';
import { NoteHistory } from '@/components/NoteHistory';
import { NoteTaker } from '@/components/NoteTaker';
import { AuthButton } from '@/components/auth-button';
import { ResizableSidebar } from '@/components/ResizableSidebar';

export default function AppPage() {
    const [playlistData, setPlaylistData] = useState<PlaylistData>({
        videos: [],
        currentIndex: 0,
        darkMode: true,
        playbackSpeed: 1,
        isFullscreen: false,
    });

    const [url, setUrl] = useState('');
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [cinemaMode, setCinemaMode] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeNav, setActiveNav] = useState<'player' | 'history' | 'notes'>('player');
    const [rightSidebarWidth, setRightSidebarWidth] = useState(320);
    const [isResizingRight, setIsResizingRight] = useState(false);

    useEffect(() => {
        setMounted(true);
        const saved = loadFromStorage();
        if (saved) {
            setPlaylistData(prev => ({
                ...prev,
                darkMode: saved.darkMode ?? true,
                playbackSpeed: saved.playbackSpeed ?? 1,
            }));
        }
        // Load right sidebar width
        const storedRightWidth = localStorage.getItem('vextube_right_sidebar_width');
        if (storedRightWidth) {
            setRightSidebarWidth(Math.min(Math.max(parseInt(storedRightWidth, 10), 280), 500));
        }
    }, []);

    useEffect(() => {
        if (playlistData.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [playlistData.darkMode]);

    useEffect(() => {
        if (mounted && playlistData.videos.length > 0) {
            saveToStorage(playlistData);
        }
    }, [playlistData, mounted]);

    // Right sidebar resize handler
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizingRight) return;
            const newWidth = window.innerWidth - e.clientX;
            const clampedWidth = Math.min(Math.max(newWidth, 280), 500);
            setRightSidebarWidth(clampedWidth);
        };

        const handleMouseUp = () => {
            if (isResizingRight) {
                setIsResizingRight(false);
                localStorage.setItem('vextube_right_sidebar_width', rightSidebarWidth.toString());
            }
        };

        if (isResizingRight) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isResizingRight, rightSidebarWidth]);

    const handlePlaylistSubmit = useCallback(async (inputUrl?: string) => {
        const urlToUse = inputUrl || url;
        if (!urlToUse.trim()) return;

        setError('');
        setLoading(true);
        try {
            const videos = await fetchPlaylistVideos(urlToUse);

            if (videos.length > 0) {
                const playlistKey = videos[0].id;
                const storedVideos = getStoredVideoStatus(playlistKey);
                const storedSettings = loadFromStorage(playlistKey);

                const mergedVideos = videos.map((v) => {
                    const storedV = storedVideos.find((sv: { id: string; completed: boolean }) => sv.id === v.id);
                    return storedV ? { ...v, completed: storedV.completed } : v;
                });

                setPlaylistData(prev => ({
                    ...prev,
                    videos: mergedVideos,
                    currentIndex: storedSettings?.currentIndex ?? 0,
                }));
                setUrl('');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load playlist');
        } finally {
            setLoading(false);
        }
    }, [url]);

    const handleVideoComplete = useCallback(() => {
        setPlaylistData(prev => {
            const updatedVideos = [...prev.videos];
            updatedVideos[prev.currentIndex] = {
                ...updatedVideos[prev.currentIndex],
                completed: true
            };
            return {
                ...prev,
                videos: updatedVideos,
            };
        });
    }, []);

    const handleVideoSelect = useCallback((index: number) => {
        setPlaylistData(prev => ({
            ...prev,
            currentIndex: index,
        }));
    }, []);

    const handleVideoSkip = useCallback(() => {
        setPlaylistData(prev => ({
            ...prev,
            currentIndex: Math.min(prev.currentIndex + 1, prev.videos.length - 1),
        }));
    }, []);

    const handleSpeedChange = useCallback((speed: number) => {
        setPlaylistData(prev => ({
            ...prev,
            playbackSpeed: speed,
        }));
    }, []);

    const handleFullscreenChange = useCallback((isFullscreen: boolean) => {
        setPlaylistData(prev => ({
            ...prev,
            isFullscreen,
        }));
    }, []);

    const handleClearData = useCallback(() => {
        clearStorage();
        setPlaylistData({
            videos: [],
            currentIndex: 0,
            darkMode: true,
            playbackSpeed: 1,
            isFullscreen: false,
        });
        setError('');
    }, []);

    const currentVideo = useMemo(() =>
        playlistData.videos[playlistData.currentIndex],
        [playlistData.videos, playlistData.currentIndex]);

    const hasVideos = playlistData.videos.length > 0;

    if (!mounted) {
        return null;
    }

    return (
        <div className="bg-vex-bg text-vex-text antialiased h-dvh w-full overflow-hidden flex selection:bg-vex-primary selection:text-black">

            {/* Desktop Sidebar */}
            <ResizableSidebar
                side="left"
                defaultWidth={256}
                minWidth={200}
                maxWidth={400}
                storageKey="vextube_left_sidebar_width"
                className="hidden md:flex flex-col border-r border-vex-border bg-vex-bg h-full shrink-0 z-20"
            >
                <div className="flex flex-col h-full p-6">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
                        <Image
                            src="/logo.jpg"
                            alt="VexTube Logo"
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="font-bold text-xl tracking-tight">VexTube</span>
                    </Link>

                    {/* Navigation or Notes Panel */}
                    {activeNav === 'notes' && hasVideos ? (
                        // Notes Panel
                        <div className="flex-1 flex flex-col min-h-0">
                            <button
                                onClick={() => setActiveNav('player')}
                                className="flex items-center gap-2 text-vex-muted hover:text-white mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span className="text-sm">Back to Player</span>
                            </button>
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <NoteTaker
                                    videoId={currentVideo.id}
                                    videoTitle={currentVideo.title}
                                />
                            </div>
                        </div>
                    ) : (
                        // Regular Navigation
                        <>
                            <nav className="space-y-2 flex-1">
                                <button
                                    onClick={() => setActiveNav('player')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeNav === 'player'
                                        ? 'bg-vex-surface/50 border border-vex-border/50 text-white font-medium shadow-sm'
                                        : 'text-vex-muted hover:bg-vex-surfaceHover hover:text-white'
                                        }`}
                                >
                                    <Play className={`w-5 h-5 ${activeNav === 'player' ? 'text-vex-primary' : ''}`} />
                                    Player
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveNav('history');
                                        setShowHistory(true);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeNav === 'history'
                                        ? 'bg-vex-surface/50 border border-vex-border/50 text-white font-medium shadow-sm'
                                        : 'text-vex-muted hover:bg-vex-surfaceHover hover:text-white'
                                        }`}
                                >
                                    <Clock className={`w-5 h-5 ${activeNav === 'history' ? 'text-vex-primary' : ''}`} />
                                    History
                                </button>
                                <button
                                    onClick={() => setActiveNav('notes')}
                                    disabled={!hasVideos}
                                    className={`w-full hidden md:flex items-center gap-3 px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeNav === 'notes'
                                        ? 'bg-vex-surface/50 border border-vex-border/50 text-white font-medium shadow-sm'
                                        : 'text-vex-muted hover:bg-vex-surfaceHover hover:text-white'
                                        }`}
                                >
                                    <PenLine className={`w-5 h-5 ${activeNav === 'notes' ? 'text-vex-primary' : ''}`} />
                                    Notes (Desktop only)
                                </button>
                            </nav>

                            {/* Bottom Actions */}
                            <div className="pt-6 border-t border-vex-border">
                                <button
                                    onClick={handleClearData}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                    Clear Data
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </ResizableSidebar>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative w-full h-full bg-vex-bg min-w-0">

                {/* Desktop Top Bar - Sign In */}
                <header className="hidden md:flex h-12 shrink-0 items-center justify-end px-4 bg-vex-bg z-20">
                    <AuthButton />
                </header>

                {/* Mobile Header */}
                <header className="md:hidden h-14 shrink-0 border-b border-vex-border flex items-center justify-between px-4 bg-vex-bg/95 backdrop-blur z-20">
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.jpg"
                            alt="VexTube"
                            width={24}
                            height={24}
                            className="rounded"
                        />
                        <span className="font-bold text-lg tracking-tight">VexTube</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleClearData}
                            className="p-2 text-red-400 hover:text-red-300"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                        <AuthButton />
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex p-4 pb-[200px] md:pb-4 no-scrollbar">

                    {hasVideos ? (
                        // Video Player View
                        <div className="flex-1 flex gap-4 w-full">
                            {/* Main Video Area */}
                            <div className="flex-1 min-w-0 space-y-6 animate-slide-in">
                                <div className={`transition-all duration-300 ${cinemaMode ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
                                    <PlaylistProgress
                                        videos={playlistData.videos}
                                        currentIndex={playlistData.currentIndex}
                                    />
                                </div>
                                <VideoPlayer
                                    video={currentVideo}
                                    onComplete={handleVideoComplete}
                                    onSkip={handleVideoSkip}
                                    onPrevious={() => handleVideoSelect(Math.max(0, playlistData.currentIndex - 1))}
                                    onNext={() => handleVideoSelect(Math.min(playlistData.videos.length - 1, playlistData.currentIndex + 1))}
                                    hasPrevious={playlistData.currentIndex > 0}
                                    hasNext={playlistData.currentIndex < playlistData.videos.length - 1}
                                    playbackSpeed={playlistData.playbackSpeed}
                                    onSpeedChange={handleSpeedChange}
                                    isFullscreen={playlistData.isFullscreen}
                                    onFullscreenChange={handleFullscreenChange}
                                    cinemaMode={cinemaMode}
                                    onCinemaModeToggle={() => setCinemaMode(!cinemaMode)}
                                />
                            </div>

                            {/* Right Sidebar - Playlist (Desktop) */}
                            <div
                                className={`hidden lg:block relative transition-all duration-300 shrink-0 ${cinemaMode ? 'w-0 opacity-0 overflow-hidden' : ''}`}
                                style={{ width: cinemaMode ? 0 : rightSidebarWidth }}
                            >
                                {/* Resize Handle */}
                                <div
                                    onMouseDown={() => setIsResizingRight(true)}
                                    className="absolute left-0 top-0 w-2 h-full cursor-col-resize group z-30 flex items-center justify-center"
                                >
                                    <div className={`w-1 h-12 rounded-full bg-vex-border opacity-0 group-hover:opacity-100 transition-opacity ${isResizingRight ? 'opacity-100 bg-vex-primary' : ''}`} />
                                </div>
                                <PlaylistSidebar
                                    videos={playlistData.videos}
                                    currentIndex={playlistData.currentIndex}
                                    onVideoSelect={handleVideoSelect}
                                />
                            </div>
                        </div>
                    ) : (
                        // Empty State - Ready to Learn
                        <div className="w-full max-w-4xl mx-auto flex flex-col justify-center min-h-[50vh] md:min-h-0 flex-1">

                            {/* Welcome Message */}
                            <div className="text-center mb-8 md:mb-12">
                                <h2 className="text-2xl md:text-4xl font-bold mb-2 text-white">Ready to learn?</h2>
                                <p className="text-sm md:text-lg text-vex-muted">Jump back in or start something new.</p>
                            </div>

                            {/* TODO: Recently Viewed - Show for logged-in users */}
                            {/* This section will display recently watched videos for authenticated users */}

                            {/* Desktop URL Input */}
                            <div className="hidden md:block max-w-2xl mx-auto w-full">
                                <form
                                    className="relative group"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        handlePlaylistSubmit();
                                    }}
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-vex-primary/30 to-blue-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                    <div className="relative flex items-center bg-vex-surface border border-vex-border rounded-2xl shadow-2xl p-2 transition-transform focus-within:scale-[1.01]">
                                        <div className="pl-4 text-vex-muted">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            value={url}
                                            onChange={(e) => setUrl(e.target.value)}
                                            placeholder="Paste YouTube Link or Playlist..."
                                            disabled={loading}
                                            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-vex-muted/50 px-4 py-4 h-14 text-lg disabled:opacity-50"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading || !url.trim()}
                                            className="bg-vex-primary hover:bg-vex-primaryHover disabled:opacity-50 disabled:hover:bg-vex-primary text-black px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(0,224,115,0.3)] hover:shadow-[0_0_25px_rgba(0,224,115,0.5)]"
                                        >
                                            {loading ? 'Loading...' : 'Launch'}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="w-full max-w-2xl mx-auto mt-4 p-4 backdrop-blur rounded-xl shadow-lg bg-vex-surface border border-red-500 text-red-400">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Mobile Bottom Section */}
                <div className="md:hidden fixed bottom-0 w-full z-50 bg-gradient-to-t from-black via-vex-bg to-transparent pb-safe-bottom">

                    {/* Mobile URL Input */}
                    {!hasVideos && (
                        <div className="px-4 pb-2 w-full">
                            <form
                                className="relative group"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handlePlaylistSubmit();
                                }}
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-vex-primary/30 to-blue-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                                <div className="relative flex items-center bg-vex-surface border border-vex-border rounded-xl shadow-2xl p-1.5">
                                    <input
                                        type="text"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="Paste YouTube Link..."
                                        disabled={loading}
                                        className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-vex-muted/50 px-3 py-3 h-12 text-base disabled:opacity-50"
                                    />
                                    <button
                                        type="submit"
                                        disabled={loading || !url.trim()}
                                        className="bg-vex-primary active:bg-vex-primaryHover disabled:opacity-50 text-black w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-lg"
                                    >
                                        <Play className="w-5 h-5 ml-0.5" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Mobile Navigation */}
                    <nav className="w-full h-14 bg-vex-bg/95 backdrop-blur border-t border-vex-border flex justify-around items-center px-2">
                        <button
                            onClick={() => setActiveNav('player')}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-transform ${activeNav === 'player' ? 'text-vex-primary' : 'text-vex-muted hover:text-white'
                                }`}
                        >
                            <Home className="w-6 h-6" />
                            <span className="text-[10px] font-medium">Home</span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveNav('history');
                                setShowHistory(true);
                            }}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 active:scale-95 transition-transform ${activeNav === 'history' ? 'text-vex-primary' : 'text-vex-muted hover:text-white'
                                }`}
                        >
                            <Clock className="w-6 h-6" />
                            <span className="text-[10px] font-medium">History</span>
                        </button>

                    </nav>
                </div>

            </main>

            {/* Note History Modal */}
            <NoteHistory
                isOpen={showHistory}
                onClose={() => {
                    setShowHistory(false);
                    setActiveNav('player');
                }}
            />
        </div>
    );
}
