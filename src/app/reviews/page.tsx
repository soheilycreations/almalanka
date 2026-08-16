import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(date);
}

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    where: { status: "published" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-brand-dark mb-4">What Our Travelers Say</h1>
        <p className="text-gray-500 max-w-xl mx-auto">Real stories from real adventurers who explored Sri Lanka with AlmaLanka.</p>
      </div>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-400 italic py-24">No reviews yet — be the first to share your story!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/reviews/${review.id}`}
              className="group block bg-white border border-[#E5E5E5] rounded-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              {review.photoUrls[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={review.photoUrls[0]} alt="" className="w-full h-48 object-cover" />
              )}
              <div className="p-8">
                <div className="flex gap-1 text-[#D4AF37] mb-4">
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </div>

                <div className="text-brand-primary text-4xl font-serif opacity-20 leading-none mb-2">"</div>
                <p className="text-gray-600 font-sans italic leading-relaxed mb-8 line-clamp-4 min-h-[5.5em]">
                  {review.message}
                </p>

                <div className="flex items-center gap-4 border-t border-gray-100 pt-6">
                  <div className="w-11 h-11 shrink-0 rounded-full bg-brand-primary text-white flex items-center justify-center font-serif font-bold text-lg">
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-bold text-brand-dark truncate group-hover:text-brand-primary transition-colors">
                      {review.authorName}
                    </h3>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold truncate">
                      {[review.country, formatDate(review.createdAt)].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
