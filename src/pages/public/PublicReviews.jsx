import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareQuote, Star } from 'lucide-react';
import { getPublicCustomerReviews } from '../../api/customerReviews';

const renderStars = (rating) =>
  Array.from({ length: 5 }, (_, index) => (
    <Star
      key={index}
      size={14}
      className={index < rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
    />
  ));

export default function PublicReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getPublicCustomerReviews();
        setReviews(response.data || []);
      } catch {
        setError('Unable to load customer reviews right now.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <div className="min-h-screen px-6 py-10" style={{ background: 'linear-gradient(180deg, #ecfeff 0%, #f8fafc 55%)' }}>
      <div className="max-w-5xl mx-auto">
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Customer Reviews</h1>
              <p className="text-slate-600 mt-2">Real feedback from customers who used our service</p>
            </div>
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary">Sign in</Link>
              <Link to="/register" className="btn-primary">Create account</Link>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="badge-amber">{reviews.length} Reviews</div>
            <div className="flex items-center gap-2 text-slate-700">
              <div className="flex gap-1">{renderStars(Math.round(Number(averageRating) || 0))}</div>
              <span className="text-sm font-medium">Average {averageRating} / 5</span>
            </div>
          </div>
        </div>

        {loading && <div className="text-center py-16 text-sm text-slate-500">Loading reviews...</div>}
        {!loading && error && <div className="card text-red-600 text-sm">{error}</div>}

        {!loading && !error && reviews.length === 0 && (
          <div className="card py-12 text-center">
            <MessageSquareQuote size={26} className="mx-auto text-slate-400 mb-3" />
            <p className="text-slate-700 font-medium">No reviews yet</p>
            <p className="text-sm text-slate-500 mt-1">Be the first customer to share feedback after your service.</p>
          </div>
        )}

        {!loading && !error && reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="card-hover">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-900">{review.customerName || 'Verified Customer'}</p>
                  <div className="flex gap-1">{renderStars(review.rating)}</div>
                </div>
                <p className="text-slate-600 text-sm mt-3 leading-relaxed">{review.comment}</p>
                <p className="text-xs text-slate-400 mt-4">{new Date(review.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
