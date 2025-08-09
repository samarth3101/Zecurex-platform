import HeroSection from '@/components/landing/HeroSection';
import AboutSection from '@/components/landing/AboutSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import DemoSection from '@/components/landing/DemoSection';
import ModulesSection from '@/components/landing/ModulesSection';
import JoinSection from '@/components/landing/JoinSection';
import Footer from '@/components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
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
