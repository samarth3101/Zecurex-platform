import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.scss';

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Zecure ONE - AI-Powered Cybersecurity Platform',
  description: 'The AI Agent That Watches Over You. Advanced threat detection, real-time fraud prevention, and intelligent security monitoring.',
  keywords: 'AI security, cybersecurity, threat detection, fraud prevention, machine learning',
  authors: [{ name: 'Zecure ONE Team' }],
  openGraph: {
    title: 'Zecure ONE - AI-Powered Cybersecurity Platform',
    description: 'The AI Agent That Watches Over You. Advanced threat detection and intelligent security monitoring.',
    type: 'website',
    images: [
      {
        url: '/images/og-image.png', // You can create this later
        width: 1200,
        height: 630,
        alt: 'Zecure ONE - AI Cybersecurity',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zecure ONE - AI-Powered Cybersecurity Platform',
    description: 'The AI Agent That Watches Over You.',
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#0A2540',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        
        {/* Additional meta tags for security */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      </head>
      <body>
        {/* Background gradient overlay */}
        <div className="app-background" />
        
        {/* Main content */}
        <div className="app-container">
          {children}
        </div>
        
        {/* Loading spinner for page transitions */}
        <div id="loading-spinner" className="loading-spinner" style={{ display: 'none' }}>
          <div className="spinner-content">
            <div className="spinner" />
            <p>Loading Zecure ONE...</p>
          </div>
        </div>
      </body>
    </html>
  );
}
