import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Privacy Policy - VexTube',
    description: 'Privacy Policy for VexTube application',
};

export default function PrivacyPage() {
    const lastUpdated = 'January 14, 2026';

    return (
        <div className="min-h-screen bg-[#171717] text-gray-200">
            {/* Header */}
            <header className="border-b border-gray-800 bg-[#171717]/80 backdrop-blur-sm sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Home</span>
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-12 max-w-3xl">
                <article className="prose prose-invert prose-green max-w-none">
                    <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
                    <p className="text-gray-400 text-sm mb-8">Last updated: {lastUpdated}</p>

                    <p className="text-lg text-gray-300">
                        This application provides a YouTube video player with a note-taking feature.
                    </p>

                    <hr className="border-gray-800 my-8" />

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
                        <ul className="space-y-3 text-gray-300">
                            <li>
                                <strong className="text-green-400">Google Account Information:</strong> If you sign in using Google, we may collect your name, email address, and basic profile information for authentication purposes.
                            </li>
                            <li>
                                <strong className="text-green-400">User Content:</strong> Notes you create while using the application.
                            </li>
                            <li>
                                <strong className="text-green-400">Usage Data:</strong> Basic, non-identifying usage data to ensure the application functions correctly.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">How We Use Information</h2>
                        <ul className="space-y-2 text-gray-300">
                            <li>To authenticate users and maintain user sessions.</li>
                            <li>To store and display your notes associated with videos.</li>
                            <li>To operate, maintain, and improve the application.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Data Storage and Security</h2>
                        <ul className="space-y-2 text-gray-300">
                            <li>User data and notes are stored securely.</li>
                            <li>Reasonable technical measures are used to protect data from unauthorized access.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Data Sharing</h2>
                        <ul className="space-y-2 text-gray-300">
                            <li>We do not sell, trade, or share user data with third parties.</li>
                            <li>Data is accessed only as required for core application functionality.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">YouTube and Google APIs</h2>
                        <ul className="space-y-2 text-gray-300">
                            <li>This application uses Google OAuth and may access YouTube content in accordance with Google API Services User Data Policy.</li>
                            <li>No YouTube account data is stored beyond what is necessary for playback and note association.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Data Retention and Deletion</h2>
                        <ul className="space-y-2 text-gray-300">
                            <li>User data is retained only as long as necessary to provide the service.</li>
                            <li>You may request deletion of your data by contacting us.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-white mb-4">Contact</h2>
                        <p className="text-gray-300">
                            For questions or data deletion requests, contact:{' '}
                            <a
                                href="mailto:sanjeevkumar61700@gmail.com"
                                className="text-green-400 hover:text-green-300 transition-colors"
                            >
                                sanjeevkumar61700@gmail.com
                            </a>
                        </p>
                    </section>
                </article>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-800 py-8 mt-12">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    © 2026 VexTube. All rights reserved.
                </div>
            </footer>
        </div>
    );
}
