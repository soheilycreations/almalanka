"use client";

import React, { useState, useRef, useEffect } from "react";
import ShareButtons from "./ShareButtons";

const SITE_URL = "https://almalanka.com";

interface Attachment {
  file: File;
  previewUrl: string;
  kind: "image" | "video";
}

export default function ReviewWidget() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [voiceUrl, setVoiceUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
      if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    attachments.forEach((a) => URL.revokeObjectURL(a.previewUrl));
    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    setName("");
    setCountry("");
    setRating(0);
    setHoverRating(0);
    setMessage("");
    setAttachments([]);
    setVoiceBlob(null);
    setVoiceUrl(null);
    setReviewId(null);
  };

  const close = () => {
    setOpen(false);
    setTimeout(resetForm, 200);
  };

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const next: Attachment[] = Array.from(fileList).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      kind: file.type.startsWith("video/") ? "video" : "image",
    }));
    setAttachments((prev) => [...prev, ...next]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      URL.revokeObjectURL(prev[idx].previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (voiceUrl) URL.revokeObjectURL(voiceUrl);
        setVoiceBlob(blob);
        setVoiceUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      alert("Couldn't access microphone. Please allow microphone permission to record a voice note.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const removeVoice = () => {
    if (voiceUrl) URL.revokeObjectURL(voiceUrl);
    setVoiceBlob(null);
    setVoiceUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !rating || !message.trim()) {
      alert("Please add your name, a star rating, and your feedback.");
      return;
    }

    setSubmitting(true);
    try {
      let photoUrls: string[] = [];
      let videoUrls: string[] = [];
      let uploadedVoiceUrl: string | null = null;

      if (attachments.length > 0 || voiceBlob) {
        const formData = new FormData();
        attachments.forEach((a) => formData.append("files", a.file));
        if (voiceBlob) formData.append("voice", voiceBlob, "voice-note.webm");

        const uploadRes = await fetch("/api/reviews/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Media upload failed");

        photoUrls = uploadData.photoUrls || [];
        videoUrls = uploadData.videoUrls || [];
        uploadedVoiceUrl = uploadData.voiceUrl || null;
      }

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: name.trim(),
          country: country.trim() || null,
          rating,
          message: message.trim(),
          photoUrls,
          videoUrls,
          voiceUrl: uploadedVoiceUrl,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to submit review");

      setReviewId(data.review.id);
    } catch (err: any) {
      alert(`Something went wrong: ${err.message || "please try again"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const shareUrl = reviewId ? `${SITE_URL}/reviews/${reviewId}` : "";
  const shareText = "I just shared my AlmaLanka experience — check it out!";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-8 left-8 z-[100] flex items-center gap-3 bg-brand-primary rounded-full pl-4 pr-5 py-3 shadow-2xl hover:scale-105 transition-transform active:scale-95"
        aria-label="Write a review"
      >
        <svg className="w-6 h-6 text-white shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
        <span className="text-white text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
          Write a Review
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="animate-modal-pop bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl relative">
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-brand-dark transition-colors z-10"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {reviewId ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="relative mb-6 mt-4">
                  <div className="absolute inset-0 rounded-full bg-brand-primary/30 animate-ring-pulse" />
                  <div className="relative w-20 h-20 rounded-full bg-brand-primary flex items-center justify-center animate-check-circle">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path className="animate-check-draw" strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-serif font-bold text-brand-dark mb-2">Thank You!</h3>
                <p className="text-gray-500 text-sm mb-8">Your valuable feedback means the world to us.</p>

                <div className="w-full bg-[#F8FDF9] border border-brand-primary/10 p-6 rounded-sm">
                  <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Share your story with friends</p>
                  <ShareButtons url={shareUrl} text={shareText} />
                </div>

                <button onClick={close} className="mt-8 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-brand-dark transition-colors">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <h3 className="text-2xl font-serif font-bold text-brand-dark mb-1">Share Your Experience</h3>
                <p className="text-gray-500 text-sm mb-4">We'd love to hear about your journey with AlmaLanka.</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Your Name</label>
                    <input
                      required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full border-b border-[#E5E5E5] p-2 focus:border-brand-primary focus:outline-none"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Country</label>
                    <input
                      value={country} onChange={(e) => setCountry(e.target.value)}
                      className="w-full border-b border-[#E5E5E5] p-2 focus:border-brand-primary focus:outline-none"
                      placeholder="Spain"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Your Rating</label>
                  <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button" key={star}
                        onMouseEnter={() => setHoverRating(star)}
                        onClick={() => setRating(star)}
                        className="p-1"
                        aria-label={`${star} star`}
                      >
                        <svg
                          className={`w-8 h-8 transition-colors ${(hoverRating || rating) >= star ? "text-[#D4AF37]" : "text-gray-200"}`}
                          fill="currentColor" viewBox="0 0 24 24"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Your Feedback</label>
                  <textarea
                    required value={message} onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-[#E5E5E5] p-3 focus:border-brand-primary focus:outline-none h-28 text-sm"
                    placeholder="Tell us about your trip..."
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Photos / Video (optional)</label>
                  <input
                    ref={fileInputRef} type="file" multiple accept="image/*,video/*"
                    className="hidden" id="review-media"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  <label htmlFor="review-media" className="inline-flex items-center gap-2 cursor-pointer border border-brand-primary/30 text-brand-primary px-4 py-2 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-primary/5 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    Add Media
                  </label>
                  {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {attachments.map((a, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-sm overflow-hidden border border-[#E5E5E5]">
                          {a.kind === "video" ? (
                            <video src={a.previewUrl} className="w-full h-full object-cover" muted />
                          ) : (
                            <img src={a.previewUrl} alt="" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button" onClick={() => removeAttachment(idx)}
                            className="absolute top-0 right-0 w-5 h-5 bg-black/60 text-white text-xs flex items-center justify-center"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 block mb-2">Voice Note (optional)</label>
                  {!voiceUrl ? (
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-colors border ${
                        isRecording ? "bg-red-50 border-red-300 text-red-600 animate-pulse" : "border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5"
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                      {isRecording ? "Stop Recording" : "Record Voice Note"}
                    </button>
                  ) : (
                    <div className="flex items-center gap-3">
                      <audio src={voiceUrl} controls className="h-9 flex-1" />
                      <button type="button" onClick={removeVoice} className="text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-red-600 transition-colors">
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit" disabled={submitting}
                  className="w-full bg-brand-primary text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
