import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2, MessageSquare, Send, RefreshCw, X } from 'lucide-react';
import { api } from '../services/api';

interface ProductReviewsSectionProps {
  productId: number;
  productName: string;
}

export default function ProductReviewsSection({ productId, productName }: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgRating, setAvgRating] = useState<number>(5.0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [writeModalOpen, setWriteModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Form State
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    rating: 5,
    reviewText: '',
  });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await api.getProductReviews(productId);
      if (res && res.success) {
        setReviews(res.data || []);
        setAvgRating(res.averageRating || 5.0);
        setReviewCount(res.reviewCount || 0);
      }
    } catch (e) {
      console.warn('Failed to load reviews:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await api.submitReview(productId, form);
      if (res.success) {
        setSuccessMsg('Thank you! Your verified review has been published.');
        setForm({ customerName: '', customerEmail: '', rating: 5, reviewText: '' });
        fetchReviews();
        setTimeout(() => {
          setWriteModalOpen(false);
          setSuccessMsg('');
        }, 2000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product-reviews-section border-t border-black/10 pt-10 mt-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <p className="kicker dark">Verified Clientèle</p>
          <h3 className="text-2xl font-serif text-[#1c1d1e]">Client Appraisals</h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-600">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={14}
                  className={s <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}
                />
              ))}
            </div>
            <strong className="text-zinc-900 font-semibold">{avgRating} out of 5</strong>
            <span>· ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>

        <button
          onClick={() => setWriteModalOpen(true)}
          className="button secondary text-xs py-2 px-4 border border-black/20 flex items-center gap-1.5 hover:border-black font-semibold uppercase tracking-wider"
        >
          <MessageSquare size={13} />
          <span>Write an Appraisal</span>
        </button>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-zinc-400 flex items-center justify-center gap-2">
          <RefreshCw size={14} className="animate-spin" />
          <span>Loading client reviews...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-6 bg-[#f7f7f5] rounded-xl text-center text-xs text-zinc-500 border border-black/5">
          No client appraisals recorded yet for {productName}. Be the first to share your experience with this piece.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-[#fafaf8] border border-black/10 rounded-xl space-y-2.5 text-xs"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex text-amber-500 mb-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-200'}
                      />
                    ))}
                  </div>
                  <strong className="font-semibold text-zinc-900 block">{rev.customer_name}</strong>
                </div>
                {rev.verified_purchase && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    <CheckCircle2 size={11} /> Verified Owner
                  </span>
                )}
              </div>
              <p className="text-zinc-700 leading-relaxed italic text-[11px]">"{rev.review_text}"</p>
              <span className="text-[10px] text-zinc-400 block pt-1">
                Authentic 925 Sterling Silver certified
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Write Review Modal */}
      {writeModalOpen && (
        <div
          className="modal-overlay fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          style={{ zIndex: 140 }}
          onMouseDown={() => setWriteModalOpen(false)}
        >
          <div
            className="account-modal max-w-md w-full bg-white p-6 rounded-2xl shadow-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="kicker dark">Review Creation</p>
                <h3 className="text-2xl font-serif">Appraise This Piece</h3>
              </div>
              <button
                className="close text-zinc-400 hover:text-black"
                onClick={() => setWriteModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {successMsg ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Rating (1 to 5 Stars) *
                  </label>
                  <div className="flex gap-2 text-amber-500 py-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setForm({ ...form, rating: s })}
                        className="p-1 hover:scale-110 transition"
                      >
                        <Star
                          size={22}
                          className={s <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Your Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Farhan Tariq"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="w-full h-10 border border-black/20 px-3 rounded text-xs outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.customerEmail}
                    onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                    className="w-full h-10 border border-black/20 px-3 rounded text-xs outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-semibold text-zinc-700 mb-1">
                    Your Review & Experience *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe the silversmith craftsmanship, fit, luster and packaging..."
                    value={form.reviewText}
                    onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                    className="w-full border border-black/20 p-3 rounded text-xs outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button dark w-full py-3 text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Appraisal</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
