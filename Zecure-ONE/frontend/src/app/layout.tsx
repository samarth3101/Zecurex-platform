import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.scss';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const meta: Metadata = {
  title: 'Zecure ONE - AI-Powered Cybersecurity Platform',
  description: 'The AI Agent That Watches Over You. Advanced threat detection, real-time fraud prevention, and intelligent security monitoring.',
  keywords: 'AI security, cybersecurity, threat detection, fraud prevention, machine learning',
  authors: [{ name: 'Zecure ONE Team' }],
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" />
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
