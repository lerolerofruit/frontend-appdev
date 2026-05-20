import { useEffect, useState } from 'react';
import { MessageSquare, Star, Trash2 } from 'lucide-react';
import {
  createCustomerReview,
  deleteCustomerReview,
  getMyCustomerReviews,
} from '../../api/customerReviews';

const ratingOptions = [5, 4, 3, 2, 1];

const getApiError = (error, fallback) => {
  const payload = error?.response?.data;
  if (typeof payload === 'string') {
    return payload;
  }
  return payload?.message || fallback;
};

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={14}
      className={index < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
    />
  ));

export default function CustomerReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ rating: 5, comment: '' });

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getMyCustomerReviews();
      setReviews(response.data || []);
    } catch (err) {
      setError(getApiError(err, 'Failed to load your reviews.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const submitReview = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await createCustomerReview({
        rating: Number(form.rating),
        comment: form.comment.trim(),
      });

      setForm({ rating: 5, comment: '' });
      setSuccess('Review submitted successfully.');
      await loadReviews();
    } catch (err) {
      setError(getApiError(err, 'Failed to submit your review.'));
    } finally {
      setSaving(false);
    }
  };

  const removeReview = async (reviewId) => {
    setError('');
    setSuccess('');

    const confirmed = window.confirm('Delete this review from public list?');
    if (!confirmed) {
      return;
    }

    try {
      await deleteCustomerReview(reviewId);
      setSuccess('Review deleted successfully.');
      await loadReviews();
    } catch (err) {
      setError(getApiError(err, 'Failed to delete review.'));
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">My Reviews</h1>
        <p className="text-slate-600 mt-1">Share your service experience and manage your posted reviews</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card lg:col-span-1 h-fit">
          <h2 className="font-semibold text-slate-900 mb-4">Post a Review</h2>

          {error && <div className="mb-3 p-3 rounded-lg text-sm text-red-700 bg-red-50">{error}</div>}
          {success && <div className="mb-3 p-3 rounded-lg text-sm text-emerald-700 bg-emerald-50">{success}</div>}

          <form onSubmit={submitReview} className="space-y-4">
            <div>
              <label className="label">Rating</label>
              <select
                className="input"
                value={form.rating}
                onChange={(event) => setForm((prev) => ({ ...prev, rating: event.target.value }))}
              >
                {ratingOptions.map((rating) => (
                  <option key={rating} value={rating}>{rating} Star{rating > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Comment</label>
              <textarea
                className="input"
                rows={5}
                maxLength={1000}
                placeholder="Tell others about your service experience"
                value={form.comment}
                onChange={(event) => setForm((prev) => ({ ...prev, comment: event.target.value }))}
                required
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary w-full justify-center">
              {saving ? 'Posting...' : 'Post Review'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {loading && <div className="card text-center py-12 text-sm text-slate-500">Loading your reviews...</div>}

          {!loading && reviews.length === 0 && (
            <div className="card text-center py-12">
              <MessageSquare size={26} className="mx-auto text-slate-400 mb-3" />
              <p className="font-medium text-slate-800">No reviews posted yet</p>
              <p className="text-sm text-slate-500 mt-1">Your reviews will appear here after submission.</p>
            </div>
          )}

          {!loading && reviews.map((review) => (
            <div key={review.id} className="card-hover">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex gap-1">{renderStars(review.rating)}</div>
                  <p className="text-xs text-slate-400 mt-2">Posted on {new Date(review.createdAt).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => removeReview(review.id)}
                  className="btn-danger btn-sm"
                  title="Delete review"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
              <p className="text-slate-700 mt-3 text-sm leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
