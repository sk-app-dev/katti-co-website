// app/page.tsx
// Homepage — Server Component
// Fetches gallery data from Sanity, passes to client Gallery component

import Navbar      from "@/components/Navbar";
import Hero        from "@/components/Hero";
import About       from "@/components/About";
import Practice    from "@/components/Practice";
import { Expertise, Approach, BlogTeaser } from "@/components/Sections";
import Gallery     from "@/components/Gallery";
import Contact     from "@/components/Contact";
import Footer      from "@/components/Footer";
import ChatWidget  from "@/components/ChatWidget";
import { client, GALLERY_QUERY } from "@/lib/sanity";

export const revalidate = 60; // ISR — revalidate every 60s

async function getGalleryItems() {
  try {
    return await client.fetch(GALLERY_QUERY);
  } catch {
    return []; // Sanity not yet configured — return empty
  }
}

export default async function HomePage() {
  const galleryItems = await getGalleryItems();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Practice />
        <Expertise />
        <Approach />
        <Gallery initialItems={galleryItems} />
        <BlogTeaser />
        <Contact />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}
