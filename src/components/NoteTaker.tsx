'use client';

import { useState } from 'react';
import { FileText, Download, Save, FileType, Check } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface NoteTakerProps {
    videoId: string;
    videoTitle: string;
}

interface NoteData {
    content: string;
    title: string;
    updatedAt: string;
    videoId: string;
}

const NOTES_STORAGE_KEY = 'video_notes_';

export const NoteTaker = ({ videoId, videoTitle }: NoteTakerProps) => {
    const [notes, setNotes] = useState<string>(() => {
        if (typeof window === 'undefined') return '';
        const savedData = localStorage.getItem(`${NOTES_STORAGE_KEY}${videoId}`);
        if (savedData) {
            try {
                const parsed: NoteData = JSON.parse(savedData);
                return parsed.content || '';
            } catch {
                return savedData;
            }
        }
        return '';
    });
    const [saved, setSaved] = useState(true);

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        setSaved(false);
    };

    const handleSave = () => {
        const noteData: NoteData = {
            content: notes,
            title: videoTitle,
            updatedAt: new Date().toISOString(),
            videoId
        };
        localStorage.setItem(`${NOTES_STORAGE_KEY}${videoId}`, JSON.stringify(noteData));
        setSaved(true);
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(videoTitle, 20, 20);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 30);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(notes, 170);
        doc.text(splitText, 20, 40);
        doc.save(`notes-${videoId}.pdf`);
    };

    const handleExportTXT = () => {
        const blob = new Blob([notes], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes-${videoId}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        My Notes
                    </CardTitle>
                    <CardDescription>
                        Notes are saved locally and exported as Markdown.
                    </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={saved ? "secondary" : "default"}
                        size="sm"
                        onClick={handleSave}
                        disabled={saved}
                    >
                        {saved ? <Check className="w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {saved ? 'Saved' : 'Save'}
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={!notes.trim()}>
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportPDF}>
                                <FileType className="w-4 h-4 mr-2 text-red-500" />
                                PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportTXT}>
                                <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                TXT
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent>
                <Textarea
                    value={notes}
                    onChange={handleNotesChange}
                    placeholder="Write your notes here... (Supports Markdown)"
                    className="min-h-[200px] font-mono text-sm resize-y"
                />
            </CardContent>
        </Card>
    );
};
