import Header from '@/components/header';
import Hero from '@/components/hero';
import OurServices from '@/components/services';
import Footer from '@/components/footer';
import Join from '@/components/Join';
import Partners from '@/components/partners';
import ContactUs from '@/components/contactUs';
import MarketSummary from '@/components/market';

export default function LandingPage() {
  return (
    <div className="min-h-screen" id="home">
      <Header />
      <Hero />
      <MarketSummary />
      <OurServices />
      <Join />
      <Partners />
      <ContactUs />
      <Footer />
    </div>
  );
}