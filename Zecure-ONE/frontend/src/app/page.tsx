'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Common
import LoaderScreen from '@/components/common/LoaderScreen';

// Landing Sections
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import ModulesSection from '@/components/landing/ModulesSection';
import DemoSection from '@/components/landing/DemoSection';

import FeaturesSection from '@/components/landing/FeaturesSection';

import OurModels from '@/components/landing/OurModels';

import ProblemSection from '@/components/landing/ProblemSection';

import JoinSection from '@/components/landing/JoinSection';
import Footer from '@/components/landing/Footer';

// Dashboard
import Dashboard from './(dashboard)/page';

function PageContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [hasSeenLoader, setHasSeenLoader] = useState(false);
  const searchParams = useSearchParams();
  const view = searchParams.get('view');

  useEffect(() => {
    const loaderSeen = sessionStorage.getItem('loaderSeen');
    
    if (loaderSeen === 'true') {
      setHasSeenLoader(true);
      setIsLoading(false);
      setShowContent(true);
    } else {
      setHasSeenLoader(false);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    setShowContent(true);
    sessionStorage.setItem('loaderSeen', 'true');
  };

  if (view === 'dashboard') {
    return <Dashboard />;
  }

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
        <ProblemSection />
        <HowItWorksSection />
        <FeaturesSection />
        <ModulesSection />
        <OurModels />

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