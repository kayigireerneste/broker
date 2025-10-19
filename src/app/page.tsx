import Header from '@/components/header';
import Hero from '@/components/Hero';
import OurServices from '@/components/services';
import Footer from '@/components/footer';
import Join from '@/components/Join';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <OurServices />
      <Join />
      <Footer />
    </div>
  );
}