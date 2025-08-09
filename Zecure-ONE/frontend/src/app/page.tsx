'use client';

import { useState } from 'react';
import LoaderScreen from '@/components/common/LoaderScreen';
import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import DemoSection from '@/components/landing/DemoSection';
import ModulesSection from '@/components/landing/ModulesSection';
import JoinSection from '@/components/landing/JoinSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  const handleLoadingComplete = () => {
    setIsLoading(false);
    // Slight delay to let curtain animation complete
    setTimeout(() => {
      setShowContent(true);
    }, 100);
  };

  return (
    <>
      {isLoading && <LoaderScreen onLoadingComplete={handleLoadingComplete} />}
      
      <main 
        className={`min-h-screen bg-black transition-all duration-1000 ease-out ${
          showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <HeroSection />
        <AboutSection />
        <HowItWorksSection />
        <DemoSection />
        <ModulesSection />
        <JoinSection />
        <Footer />
      </main>
    </>
  );
}
