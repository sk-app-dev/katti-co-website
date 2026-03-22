// app/page.tsx
// Homepage — imports existing components

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import About from "../components/About";
import Practice from "../components/Practice";
import { Expertise, Approach, BlogTeaser } from "../components/Sections";
import Gallery from "../components/Gallery";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import ChatWidget from "../components/ChatWidget";

export default async function HomePage() {
  return (
    <>
      <Navbar />
      <Hero />
      <About />
      <Practice />
      <Expertise />
      <Approach />
      <BlogTeaser />
      <Gallery />
      <Contact />
      <ChatWidget />
      <Footer />
    </>
  );
}
