import React, { useState, useEffect, useCallback } from "react";
import { API_BASE } from "../lib/api";

interface AdItem {
  id: number;
  image_url: string;
  title: string | null;
  link_url: string | null;
}

/**
 * Auto-rotating advertisement carousel for web.
 * Fetches ads from /advertisements/public?placement=<placement>.
 * If multiple images, rotates every 5 seconds. Click opens link_url.
 */
export const AdCarousel: React.FC<{ placement: "dashboard" | "login" }> = ({ placement }) => {
  const [ads, setAds] = useState<AdItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch(API_BASE + "/advertisements/public?placement=" + placement)
      .then((r) => r.json())
      .then((d: { ads: AdItem[] }) => { if (!cancelled) setAds(d.ads || []); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [placement]);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [ads.length]);

  const goTo = useCallback((idx: number) => setActiveIdx(idx), []);

  if (!ads.length) return null;

  return (
    <div className="ad-carousel">
      <div className="ad-slides" style={{ transform: "translateX(-" + (activeIdx * 100) + "%)" }}>
        {ads.map((ad) => (
          <div key={ad.id} className="ad-slide">
            {ad.link_url ? (
              <a href={ad.link_url} target="_blank" rel="noreferrer">
                <img src={ad.image_url} alt={ad.title || "Advertisement"} />
              </a>
            ) : (
              <img src={ad.image_url} alt={ad.title || "Advertisement"} />
            )}
            {ad.title && <div className="ad-title">{ad.title}</div>}
          </div>
        ))}
      </div>
      {ads.length > 1 && (
        <div className="ad-dots">
          {ads.map((_, i) => (
            <button
              key={i}
              className={"ad-dot" + (i === activeIdx ? " active" : "")}
              onClick={() => goTo(i)}
              aria-label={"Go to slide " + (i + 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
};