import Header from '../components/Header';
import Hero from '@/components/Hero';
import SearchBar from '@/components/SearchBar';
import FeaturedCars from '@/components/FeaturedCars';
import HowItWorks from '@/components/HowItWorks';
import Testimonials from '@/components/Testimonials';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="bg-white text-gray-900">
      <Header />
      <Hero />
      <SearchBar />
      <FeaturedCars />
      <HowItWorks />
      <Testimonials />
      <Footer />
    </main>
  );
}