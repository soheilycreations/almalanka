import Link from "next/link";
import { prisma } from "@/lib/db";
import ShareButtons from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-serif font-bold text-brand-dark mb-3">Review Not Found</h1>
          <p className="text-gray-500 mb-8">This review link doesn't exist or may have been removed.</p>
          <Link href="/" className="inline-block bg-brand-primary text-white px-8 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-brand-dark transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (review.status !== "published") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h1 className="text-3xl font-serif font-bold text-brand-dark mb-3">Thank You, {review.authorName}!</h1>
          <p className="text-gray-500 mb-8">Your review is being reviewed by our team and will appear here shortly. Check back soon!</p>
          <Link href="/" className="inline-block bg-brand-primary text-white px-8 py-3 uppercase tracking-widest text-[10px] font-bold hover:bg-brand-dark transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "https://almalanka.com"}/reviews/${review.id}`;

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <div className="text-center mb-10">
        <div className="flex justify-center gap-1 text-[#D4AF37] mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg key={i} className="w-7 h-7" fill={i < review.rating ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
            </svg>
          ))}
        </div>
        <h1 className="text-4xl font-serif font-bold text-brand-dark mb-2">{review.authorName}'s Experience</h1>
        <p className="text-gray-400 text-xs uppercase tracking-widest">Shared via AlmaLanka</p>
      </div>

      <p className="text-xl font-serif italic text-brand-dark text-center leading-relaxed mb-12 px-4">
        "{review.message}"
      </p>

      {(review.photoUrls.length > 0 || review.videoUrls.length > 0) && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {review.photoUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={`p-${i}`} src={url} alt="" className="w-full h-48 object-cover rounded-sm border border-[#E5E5E5]" />
          ))}
          {review.videoUrls.map((url, i) => (
            <video key={`v-${i}`} src={url} controls className="w-full h-48 object-cover rounded-sm border border-[#E5E5E5]" />
          ))}
        </div>
      )}

      {review.voiceUrl && (
        <div className="bg-[#F8FDF9] border border-brand-primary/10 p-6 rounded-sm mb-12 flex items-center gap-4">
          <svg className="w-8 h-8 text-brand-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" /></svg>
          <audio src={review.voiceUrl} controls className="w-full" />
        </div>
      )}

      <div className="bg-[#F8FDF9] border border-brand-primary/10 p-8 rounded-sm text-center">
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Share this story</p>
        <ShareButtons url={shareUrl} text={`${review.authorName}'s AlmaLanka experience`} />
      </div>

      <div className="text-center mt-16">
        <h2 className="text-2xl font-serif font-bold text-brand-dark mb-4">Ready for your own adventure?</h2>
        <Link href="/tours" className="inline-block bg-brand-primary text-white px-10 py-4 uppercase tracking-widest text-[10px] font-bold hover:bg-brand-dark transition-colors">
          Explore Our Tours
        </Link>
      </div>
    </div>
  );
}
