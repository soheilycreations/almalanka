"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Review {
  id: string;
  authorName: string;
  country: string | null;
  rating: number;
  message: string;
  photoUrls: string[];
}

export default function ReviewsCarousel({
  title,
  fallbackQuote,
  fallbackAuthor,
}: {
  title: string;
  fallbackQuote: string;
  fallbackAuthor: string;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    fetch("/api/reviews", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setReviews(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 6000);
    return () => clearInterval(timer);
  }, [reviews]);

  const current = reviews[index];

  return (
    <section className="py-32 px-8 relative bg-brand-bg text-center overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full z-0 pointer-events-none select-none">
        <h2 className="text-[7rem] md:text-[14rem] leading-none font-serif text-brand-dark opacity-5 whitespace-nowrap">real stories</h2>
      </div>
      <div className="relative z-10 max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-brand-dark mb-12">{title}</h2>
        <div className="text-brand-primary text-6xl font-serif opacity-30 mb-6">"</div>

        <div key={current ? current.id : "fallback"} className="animate-modal-pop">
          {current?.photoUrls?.[0] && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={current.photoUrls[0]}
              alt=""
              className="w-24 h-24 rounded-full object-cover mx-auto mb-8 border-4 border-white shadow-lg"
            />
          )}
          <p className="text-2xl md:text-3xl font-serif italic text-brand-dark mb-12 leading-relaxed px-4 min-h-[4.5em]">
            {current ? current.message : fallbackQuote}
          </p>
          <div className="flex flex-col items-center">
            <h4 className="font-sans font-bold text-sm tracking-widest uppercase text-brand-primary">
              {current ? `- ${current.authorName}${current.country ? `, ${current.country}` : ""}` : fallbackAuthor}
            </h4>
            <div className="flex gap-1 text-[#D4AF37] mt-2">
              {"★".repeat(current ? current.rating : 5)}
            </div>
          </div>
        </div>

        {reviews.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1 transition-all duration-500 ${i === index ? "w-8 bg-brand-primary" : "w-4 bg-brand-dark/20"}`}
                aria-label={`Show review ${i + 1}`}
              />
            ))}
          </div>
        )}

        {reviews.length > 0 && (
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 mt-10 text-brand-primary font-bold uppercase tracking-widest text-xs hover:text-brand-dark transition-colors border-b border-brand-primary pb-1"
          >
            Read All Reviews <span className="text-lg">&rarr;</span>
          </Link>
        )}
      </div>
    </section>
  );
}
