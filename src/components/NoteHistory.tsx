'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, X, Calendar, FileType } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface NoteHistoryProps {
    isOpen: boolean;
    onClose: () => void;
}

interface StoredNote {
    key: string;
    content: string;
    title: string;
    updatedAt: string;
    videoId: string;
}

const NOTES_PREFIX = 'video_notes_';

export const NoteHistory = ({ isOpen, onClose }: NoteHistoryProps) => {
    const [notes, setNotes] = useState<StoredNote[]>([]);
    const [selectedNote, setSelectedNote] = useState<StoredNote | null>(null);

    const loadNotes = () => {
        const loadedNotes: StoredNote[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(NOTES_PREFIX)) {
                try {
                    const raw = localStorage.getItem(key);
                    if (raw) {
                        // Handle both old string format and new JSON format
                        let data: { content?: string; title?: string; updatedAt?: string; videoId?: string } | string;
                        try {
                            data = JSON.parse(raw);
                        } catch {
                            data = { content: raw, title: 'Untitled Note', updatedAt: new Date().toISOString(), videoId: key.replace(NOTES_PREFIX, '') };
                        }

                        // Ensure it has content
                        const content = typeof data === 'string' ? data : data.content;
                        const title = typeof data === 'string' ? 'Untitled Note' : data.title;
                        const updatedAt = typeof data === 'string' ? new Date().toISOString() : data.updatedAt;
                        const videoId = typeof data === 'string' ? key.replace(NOTES_PREFIX, '') : data.videoId;

                        if (content) {
                            loadedNotes.push({
                                key,
                                content: content,
                                title: title || 'Untitled Note',
                                updatedAt: updatedAt || new Date().toISOString(),
                                videoId: videoId || key.replace(NOTES_PREFIX, '')
                            });
                        }
                    }
                } catch (e) {
                    console.error('Error loading note', key, e);
                }
            }
        }
        // Sort by date desc
        setNotes(loadedNotes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    };

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => loadNotes(), 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleDelete = (key: string) => {
        if (confirm('Are you sure you want to delete this note?')) {
            localStorage.removeItem(key);
            loadNotes();
            if (selectedNote?.key === key) {
                setSelectedNote(null);
            }
        }
    };

    const handleExportPDF = (note: StoredNote) => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(note.title, 20, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(note.content, 170);
        doc.text(splitText, 20, 40);
        doc.save(`note-${note.videoId}.pdf`);
    };

    const handleExportTXT = (note: StoredNote) => {
        const blob = new Blob([note.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `note-${note.videoId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#232323] w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl border border-gray-700 flex overflow-hidden animate-slide-in">

                {/* Sidebar List */}
                <div className="w-1/3 border-r border-gray-700 flex flex-col">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#1e1e1e]">
                        <h2 className="text-xl font-semibold text-gray-200">Your Notes</h2>
                        <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">{notes.length}</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {notes.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <p>No notes found.</p>
                            </div>
                        ) : (
                            notes.map(note => (
                                <div
                                    key={note.key}
                                    onClick={() => setSelectedNote(note)}
                                    className={`p-3 rounded-lg cursor-pointer transition-all ${selectedNote?.key === note.key ? 'bg-green-900/30 border border-green-500/50' : 'hover:bg-gray-800 border border-transparent'}`}
                                >
                                    <h3 className="font-medium text-gray-200 truncate">{note.title}</h3>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="text-xs text-gray-500 flex items-center gap-1">
                                            <Calendar size={10} />
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </span>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDelete(note.key); }}
                                            className="text-gray-500 hover:text-red-400 p-1 hover:bg-gray-700 rounded transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content / Preview */}
                <div className="w-2/3 flex flex-col bg-[#171717]">
                    <div className="p-4 border-b border-gray-700 flex justify-between items-center h-[69px]">
                        {selectedNote ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleExportPDF(selectedNote)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gray-800 hover:bg-gray-700 text-red-300 transition-colors"
                                >
                                    <FileType size={14} /> PDF
                                </button>
                                <button
                                    onClick={() => handleExportTXT(selectedNote)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-gray-800 hover:bg-gray-700 text-blue-300 transition-colors"
                                >
                                    <FileText size={14} /> TXT
                                </button>
                            </div>
                        ) : <div></div>}
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {selectedNote ? (
                            <div className="space-y-4">
                                <h1 className="text-2xl font-bold text-gray-100">{selectedNote.title}</h1>
                                <p className="text-sm text-gray-500 pb-4 border-b border-gray-800">
                                    Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}
                                </p>
                                <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap font-mono text-sm">
                                    {selectedNote.content}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                                <FileText size={48} className="opacity-20" />
                                <p>Select a note to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
