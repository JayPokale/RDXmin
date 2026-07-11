import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Axes from "@/components/Axes";
import Terminal from "@/components/Terminal";
import Benchmarks from "@/components/Benchmarks";
import Community from "@/components/Community";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";

export default function Page() {
  return (
    <main>
      <Nav />
      <Hero />
      <Stats />
      <Axes />
      <Terminal />
      <Benchmarks />
      <Community />
      <Faq />
      <Footer />
    </main>
  );
}
