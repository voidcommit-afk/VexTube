'use client';

import { useState, useEffect, memo } from 'react';
import { BookOpen, AlertCircle } from 'lucide-react';
import { generateVideoSummary } from '@/lib/gemini';
import { fetchVideoTranscript } from '@/lib/youtube';
import { MarkdownRenderer } from './MarkdownRenderer';

interface VideoSummaryProps {
    videoId: string;
}

export const VideoSummary = memo(({ videoId }: VideoSummaryProps) => {
    const [summary, setSummary] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [videoInfo, setVideoInfo] = useState<string>('');

    useEffect(() => {
        const loadVideoInfo = async () => {
            if (!videoId) return;
            setSummary('');
            setError('');
            try {
                const info = await fetchVideoTranscript(videoId);
                setVideoInfo(info);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Failed to load video information');
            }
        };
        loadVideoInfo();
    }, [videoId]);

    const handleGenerateSummary = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await generateVideoSummary(videoInfo);
            setSummary(res);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Failed to generate summary');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-6 p-6 glass-panel rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-100">
                    <BookOpen className="w-5 h-5 text-green-500" />
                    Quick Summary
                </h3>
            </div>

            {error && (
                <div className="mb-4 p-4 rounded-lg bg-red-900/20 border border-red-500/50 text-red-400 text-sm">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                    {error.toLowerCase().includes('quota') && (
                        <p className="mt-2 text-xs text-red-400/70">
                            Tip: The AI service has usage limits. Try again in a few minutes.
                        </p>
                    )}
                </div>
            )}

            {!summary && !loading && (
                <button
                    onClick={handleGenerateSummary}
                    disabled={!videoInfo}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate Summary
                </button>
            )}

            {loading && (
                <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                </div>
            )}

            {summary && <MarkdownRenderer content={summary} />}
        </div>
    );
});

VideoSummary.displayName = 'VideoSummary';
