"use client";
// components/Gallery.tsx
// Photos & videos fetched from Sanity CMS
// Add items via kattiandco.in/studio

import { useState, useEffect } from "react";
import Image from "next/image";
import { client, GALLERY_QUERY } from "@/lib/sanity";

interface GalleryItem {
  _id: string;
  type: "photo" | "video";
  caption?: string;
  image?: { asset: { url: string; metadata?: { dimensions?: { width: number; height: number } } } };
  videoUrl?: string;
}

function ytEmbed(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : null;
}
function vmEmbed(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? `https://player.vimeo.com/video/${m[1]}` : null;
}

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "photo" | "video">("all");
  const [lboxIdx, setLboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const data = await client.fetch(GALLERY_QUERY);

        // Flatten the images from all gallery documents
        const flattenedItems: GalleryItem[] = [];
        data.forEach((gallery: any) => {
          if (gallery.items) {
            gallery.items.forEach((img: any) => {
              flattenedItems.push({
                _id: `${gallery._id}-${img._key}`,
                type: "photo",
                caption: img.caption,
                image: {
                  asset: {
                    url: img.asset.url,
                    metadata: img.asset.metadata
                  }
                }
              });
            });
          }
        });

        setItems(flattenedItems);
      } catch (error) {
        console.error("Error fetching gallery:", error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);
  const photoItems = filtered.filter((i) => i.type === "photo");

  // Keyboard nav for lightbox
  useEffect(() => {
    if (lboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLboxIdx(null);
      if (e.key === "ArrowLeft") setLboxIdx((p) => p !== null ? Math.max(0, p - 1) : null);
      if (e.key === "ArrowRight") setLboxIdx((p) => p !== null ? Math.min(photoItems.length - 1, p + 1) : null);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [lboxIdx, photoItems.length]);

  return (
    <section className="section gallery" id="gallery">
      <div className="gallery-header reveal">
        <div>
          <div className="section-label">Gallery</div>
          <h2 className="section-title">Moments &amp; <em>Media</em></h2>
        </div>
      </div>

      <div className="gallery-tabs">
        {(["all", "photo", "video"] as const).map((t) => (
          <button
            key={t}
            className={`gallery-tab${filter === t ? " active" : ""}`}
            onClick={() => setFilter(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="gallery-empty">
          Loading gallery...
        </div>
      ) : filtered.length === 0 ? (
        <div className="gallery-empty">
          No media yet. Add photos and videos via the Sanity Studio.
        </div>
      ) : (
        <div className="gallery-grid">
          {filtered.map((item, idx) => {
            if (item.type === "video") {
              const embed = item.videoUrl
                ? ytEmbed(item.videoUrl) || vmEmbed(item.videoUrl)
                : null;
              if (!embed) return null;
              return (
                <div
                  key={item._id}
                  style={{
                    breakInside: "avoid",
                    marginBottom: "1rem",
                    position: "relative",
                    aspectRatio: "16/9",
                    border: "1px solid var(--bdr)",
                    background: "var(--bg3)",
                    overflow: "hidden",
                  }}
                >
                  <iframe
                    src={embed}
                    style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    title={item.caption || "Video"}
                  />
                </div>
              );
            }

            // Photo
            const photoIdx = photoItems.indexOf(item);
            return (
              <div
                key={item._id}
                className="gallery-item"
                onClick={() => setLboxIdx(photoIdx)}
                role="button"
                tabIndex={0}
                aria-label={`View ${item.caption || "photo"}`}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setLboxIdx(photoIdx)}
              >
                {item.image?.asset?.url && (
                  <Image
                    src={item.image.asset.url}
                    alt={item.caption || "Gallery photo"}
                    width={item.image.asset.metadata?.dimensions?.width || 600}
                    height={item.image.asset.metadata?.dimensions?.height || 400}
                    style={{ width: "100%", height: "auto" }}
                    loading="lazy"
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lboxIdx !== null && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 950,
            background: "rgba(0,0,0,.93)", backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 24,
          }}
          onClick={(e) => e.target === e.currentTarget && setLboxIdx(null)}
        >
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: "90vw" }}>
            <button
              onClick={() => setLboxIdx(null)}
              style={{ position: "absolute", top: -38, right: 0, background: "none", border: "none", color: "rgba(232,228,216,.65)", fontSize: "2rem", lineHeight: 1, cursor: "pointer" }}
              aria-label="Close"
            >
              ×
            </button>

            {photoItems[lboxIdx]?.image?.asset?.url && (
              <Image
                src={photoItems[lboxIdx].image!.asset.url}
                alt={photoItems[lboxIdx].caption || "Gallery photo"}
                width={1200}
                height={900}
                style={{ maxWidth: "90vw", maxHeight: "82vh", objectFit: "contain", border: "1px solid rgba(201,166,64,.15)" }}
              />
            )}

            {photoItems[lboxIdx]?.caption && (
              <div style={{ fontSize: ".78rem", color: "rgba(232,228,216,.65)", marginTop: ".9rem", textAlign: "center", maxWidth: 600 }}>
                {photoItems[lboxIdx].caption}
              </div>
            )}

            {photoItems.length > 1 && (
              <>
                <button
                  onClick={() => setLboxIdx((p) => Math.max(0, (p ?? 0) - 1))}
                  disabled={lboxIdx === 0}
                  style={{ position: "absolute", top: "50%", left: -56, transform: "translateY(-50%)", background: "rgba(7,8,13,.7)", border: "1px solid var(--bdr)", color: "var(--gold)", width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", cursor: lboxIdx === 0 ? "default" : "pointer", opacity: lboxIdx === 0 ? .3 : 1 }}
                  aria-label="Previous"
                >←</button>
                <button
                  onClick={() => setLboxIdx((p) => Math.min(photoItems.length - 1, (p ?? 0) + 1))}
                  disabled={lboxIdx === photoItems.length - 1}
                  style={{ position: "absolute", top: "50%", right: -56, transform: "translateY(-50%)", background: "rgba(7,8,13,.7)", border: "1px solid var(--bdr)", color: "var(--gold)", width: 42, height: 42, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", cursor: lboxIdx === photoItems.length - 1 ? "default" : "pointer", opacity: lboxIdx === photoItems.length - 1 ? .3 : 1 }}
                  aria-label="Next"
                >→</button>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
