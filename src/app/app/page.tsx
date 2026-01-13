'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Trash2, History } from 'lucide-react';
import { PlaylistInput } from '@/components/PlaylistInput';
import { VideoPlayer } from '@/components/VideoPlayer';
import { PlaylistProgress } from '@/components/PlaylistProgress';
import { PlaylistSidebar } from '@/components/PlaylistSidebar';
import { PlaylistData } from '@/lib/types';
import { saveToStorage, loadFromStorage, getStoredVideoStatus, clearStorage } from '@/lib/storage';
import { fetchPlaylistVideos } from '@/lib/youtube';
import { NoteHistory } from '@/components/NoteHistory';

export default function Home() {
    const [playlistData, setPlaylistData] = useState<PlaylistData>({
        videos: [],
        currentIndex: 0,
        darkMode: true,
        playbackSpeed: 1,
        isFullscreen: false,
    });

    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [cinemaMode, setCinemaMode] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [mounted, setMounted] = useState(false);

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

    const handlePlaylistSubmit = useCallback(async (url: string) => {
        setError('');
        setLoading(true);
        try {
            const videos = await fetchPlaylistVideos(url);

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
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load playlist');
        } finally {
            setLoading(false);
        }
    }, []);

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
        <div className="min-h-screen flex flex-col transition-colors bg-[#171717]">
            <div className="flex-1 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
                <div className="flex justify-between items-center mb-8 animate-slide-in">
                    <div className={`flex items-center gap-3 transition-opacity duration-300 ${cinemaMode ? 'opacity-0' : 'opacity-100'}`}>
                        <h1 className="text-3xl font-normal text-gray-200">
                            VexTube
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowHistory(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors border border-gray-700"
                            >
                                <History size={18} />
                                <span className="hidden sm:inline">History</span>
                            </button>
                            <button
                                onClick={handleClearData}
                                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors border border-red-500/20"
                            >
                                <Trash2 size={18} />
                                <span className="hidden sm:inline">Clear Data</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`transition-all duration-300 ${cinemaMode ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
                    <PlaylistInput onSubmit={handlePlaylistSubmit} loading={loading} />
                </div>

                {error && (
                    <div className="w-full max-w-4xl mx-auto mb-8 p-4 backdrop-blur rounded-xl shadow-lg animate-slide-in bg-[#232323] border border-red-500 text-red-500">
                        {error}
                    </div>
                )}

                {hasVideos ? (
                    <div className="space-y-6 animate-slide-in">
                        <div className={`transition-all duration-300 ${cinemaMode ? 'h-0 overflow-hidden opacity-0' : 'h-auto opacity-100'}`}>
                            <PlaylistProgress
                                videos={playlistData.videos}
                                currentIndex={playlistData.currentIndex}
                            />
                        </div>
                        <div className={`grid grid-cols-1 ${cinemaMode ? 'lg:grid-cols-1 max-w-5xl mx-auto' : 'lg:grid-cols-3'} gap-6 transition-all duration-500`}>
                            <div className={`${cinemaMode ? 'lg:col-span-1' : 'lg:col-span-2'}`}>
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
                            <div className={`transition-all duration-300 ${cinemaMode ? 'hidden opacity-0 scale-95' : 'block opacity-100 scale-100'}`}>
                                <PlaylistSidebar
                                    videos={playlistData.videos}
                                    currentIndex={playlistData.currentIndex}
                                    onVideoSelect={handleVideoSelect}
                                />
                            </div>
                        </div>
                    </div>
                ) : !loading && !error && (
                    <div className="text-center mt-16 space-y-4 animate-slide-in">
                        <div className="inline-block p-6 rounded-2xl backdrop-blur shadow-xl bg-[#232323]">
                            <p className="text-2xl font-semibold mb-3 text-gray-200">
                                Ready to Start Learning?
                            </p>
                            <p className="text-gray-400">
                                Paste a YouTube playlist URL to begin your focused learning journey
                            </p>
                        </div>
                    </div>
                )}

            </div>

            <footer className="py-6 text-center border-t border-[#2E2E2E]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                </div>
            </footer>

            <NoteHistory
                isOpen={showHistory}
                onClose={() => setShowHistory(false)}
            />
        </div>
    );
}
