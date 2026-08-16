import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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
              className="block bg-white border border-[#E5E5E5] p-8 rounded-sm hover:shadow-xl transition-shadow"
            >
              <div className="flex gap-1 text-[#D4AF37] mb-4">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </div>
              {review.photoUrls[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={review.photoUrls[0]} alt="" className="w-full h-40 object-cover rounded-sm mb-6" />
              )}
              <p className="text-gray-600 font-sans italic leading-relaxed mb-6 line-clamp-4">"{review.message}"</p>
              <h3 className="font-serif font-bold text-brand-dark">{review.authorName}</h3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
