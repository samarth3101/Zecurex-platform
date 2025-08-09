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

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoaderScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <main className="min-h-screen bg-black">
      <HeroSection />
      <AboutSection />
      <HowItWorksSection />
      <DemoSection />
      <ModulesSection />
      <JoinSection />
      <Footer />
    </main>
  );
}
