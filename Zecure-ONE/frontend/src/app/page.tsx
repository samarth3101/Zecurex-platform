'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoaderScreen from '@/components/common/LoaderScreen';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import DemoSection from '@/components/landing/DemoSection';
import ModulesSection from '@/components/landing/ModulesSection';
import JoinSection from '@/components/landing/JoinSection';
import Footer from '@/components/landing/Footer';
import Dashboard from './(dashboard)/page';

function PageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [hasSeenLoader, setHasSeenLoader] = useState(false);
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  useEffect(() => {
    // Check if user has already seen the loader in this session
    const loaderSeen = sessionStorage.getItem('loaderSeen');
    
    if (loaderSeen === 'true') {
      // Skip loader, show content immediately
      setHasSeenLoader(true);
      setIsLoading(false);
      setShowContent(true);
    } else {
      // First visit - show loader
      setHasSeenLoader(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowContent(true);
    // Mark that user has seen the loader
    sessionStorage.setItem('loaderSeen', 'true');
  };

  // If view=dashboard, show dashboard without loader
  if (view === 'dashboard') {
    return <Dashboard />;
  }

  // Otherwise show landing page
  return (
    <>
      {isLoading && !hasSeenLoader && (
        <LoaderScreen onLoadingComplete={handleLoadingComplete} />
      )}
      
      <main 
        className={`min-h-screen bg-black ${
          showContent 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-8'
        } transition-all duration-700 ease-out`}
      >
        <HeroSection isVisible={showContent} />
        <AboutSection />
        <HowItWorksSection />
        <ModulesSection />
        <DemoSection />
        <JoinSection />
        <Footer />
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
