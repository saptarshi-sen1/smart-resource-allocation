import { Navbar } from '@/components/navbar/Navbar';
import { Hero } from '@/components/hero/Hero';
import { Footer } from '@/components/footer/Footer';
import { FeaturesSection } from '@/components/cards/FeaturesSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#06101e]">
      <Navbar />
      <Hero />
      <FeaturesSection />
      <Footer />
    </main>
  );
}
