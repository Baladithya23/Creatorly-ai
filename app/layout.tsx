/**
 * app/layout.tsx — Creatorly Root Layout
 */
import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Creatorly — AI Agent That Learns Your Audience',
  description:
    'Creatorly — an AI agent that learns what your audience loves and helps you create smarter content over time.',
  keywords: ['content creator', 'AI content agent', 'Hindsight memory', 'social media analytics', 'Trend Scout', 'Instagram', 'YouTube'],
  openGraph: {
    title: 'Creatorly — AI Agent That Learns Your Audience',
    description: 'Creatorly — an AI agent that learns what your audience loves and helps you create smarter content over time.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-100 min-h-screen">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
