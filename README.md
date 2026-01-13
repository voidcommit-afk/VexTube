# VexTube

A focused YouTube learning platform designed for distraction-free video consumption and note-taking.

## Overview

VexTube is a web application that enhances the YouTube learning experience by removing distractions and providing tools for effective learning. It supports both individual videos and full playlists, with features for progress tracking, AI-powered summaries, and comprehensive note-taking.

## Features

### Core Functionality
- Single video and playlist support via YouTube URLs
- Embedded YouTube player with custom controls
- Progress tracking with completion status
- Playback speed control (0.5x to 2x)
- Cinema mode for distraction-free viewing
- Fullscreen support

### AI-Powered Learning
- Automatic video summaries using Google Gemini 2.0 Flash
- Rich text rendering with Markdown support
- Mathematical formula rendering with KaTeX
- Code syntax highlighting

### Note-Taking
- Per-video note storage
- Markdown support in notes
- Export to PDF and TXT formats
- Note history with search and management
- Auto-save functionality

### User Interface
- Modern dark theme with glassmorphism effects
- Responsive design for mobile and desktop
- Smooth animations and transitions
- Accessible UI components using Radix UI

## Technology Stack

### Framework
- Next.js 16.1.1 with Turbopack
- React 19.2.3
- TypeScript 5.x

### Styling
- Tailwind CSS 4.x
- Radix UI components
- Custom glassmorphism effects

### APIs & Services
- YouTube Data API v3 for video metadata
- Google Gemini API for AI summaries
- LocalStorage for data persistence

### Key Libraries
- react-youtube for video embedding
- react-markdown for rich text rendering
- rehype-katex for mathematical formulas
- react-syntax-highlighter for code blocks
- jsPDF for PDF export

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── app/page.tsx          # Main application
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── VideoPlayer.tsx       # Video player with controls
│   ├── VideoSummary.tsx      # AI summary generation
│   ├── NoteTaker.tsx         # Note-taking interface
│   ├── NoteHistory.tsx       # Note management
│   ├── PlaylistSidebar.tsx   # Video list navigation
│   └── ui/                   # Reusable UI components
└── lib/
    ├── youtube.ts            # YouTube API integration
    ├── gemini.ts             # Gemini API integration
    ├── storage.ts            # LocalStorage utilities
    └── types.ts              # TypeScript definitions
```

## API Keys Setup

### YouTube Data API v3

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API key)
5. Restrict the API key to YouTube Data API v3
6. Add the key to `.env.local`

### Google Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Add the key to `.env.local`

## Data Storage

Currently, all data is stored locally in the browser using LocalStorage:
- Video progress and completion status
- Playback settings (speed, dark mode)
- Personal notes with timestamps
- Playlist state and current position

Note: Data is device-specific and not synced across browsers or devices.

## Browser Compatibility

- Chrome/Edge: Fully supported
- Firefox: Fully supported
- Safari: Fully supported
- Mobile browsers: Responsive design supported

## Performance

- First load optimized with code splitting
- Lazy loading for YouTube player component
- Throttled LocalStorage writes (1000ms)
- Memoized components for efficient re-renders
- Caching for AI summaries

## Known Limitations

- No user authentication (planned for future release)
- No cross-device synchronization (planned for future release)
- LocalStorage has size limits (typically 5-10MB)
- YouTube API has daily quota limits (10,000 units/day on free tier)
- Gemini API rate limits apply

## Future Roadmap

- Google OAuth authentication
- Cloud database integration (Supabase)
- Cross-device sync
- Enhanced gamification features
- Learning streaks and achievements
- Advanced note organization
- Social learning features

## License

This is a personal project. All rights reserved.

## Acknowledgments

- Built with Next.js and React
- UI components from Radix UI
- Icons from Lucide React
- AI powered by Google Gemini
- Video data from YouTube Data API
