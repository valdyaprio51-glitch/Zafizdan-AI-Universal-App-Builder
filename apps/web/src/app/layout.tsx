import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'Universal AI App Builder',
  description: 'AI-Powered Software Development Platform - From Natural Language to Production Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
