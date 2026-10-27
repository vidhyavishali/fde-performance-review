import { useEffect, useState } from 'react';
import type Review from '../../interfaces/Review';
import './ReviewDetailsPage.css';

interface ReviewDetailsPageProps {
  reviewId: number;
  onBack: () => void;
}

interface ReviewDetailsState {
  reviewId: number;
  loaded: boolean;
  review: Review | null;
  error: string | null;
}

const CRITERIA = [
  { label: 'Quality of Work', key: 'quality_rating' },
  { label: 'Delivery & Ownership', key: 'delivery_rating' },
  { label: 'Teamwork & Collaboration', key: 'teamwork_rating' },
] as const;

function fetchReview(reviewId: number, signal: AbortSignal): Promise<Review> {
  return fetch(`http://localhost:8000/api/reviews/${reviewId}`, { signal })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Server responded ${res.status}`);
      }
      return res.json() as Promise<Review>;
    })
    .catch((err: Error) => {
      if (err instanceof TypeError) {
        throw new Error('Cannot reach the server. Check your connection and try again.');
      }
      throw err;
    });
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="details-stars" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} aria-hidden="true" className={index < rating ? 'filled' : ''}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewDetailsPage({ reviewId, onBack }: ReviewDetailsPageProps) {
  const [details, setDetails] = useState<ReviewDetailsState>({
    reviewId,
    loaded: false,
    review: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetchReview(reviewId, controller.signal)
      .then((review) => {
        if (!controller.signal.aborted) {
          setDetails({ reviewId, loaded: true, review, error: null });
        }
      })
      .catch((err: Error) => {
        if (!controller.signal.aborted && err.name !== 'AbortError') {
          setDetails({ reviewId, loaded: true, review: null, error: err.message });
        }
      });

    return () => controller.abort();
  }, [reviewId]);

  const isCurrentReview = details.reviewId === reviewId;
  const loading = !isCurrentReview || !details.loaded;
  const review = isCurrentReview ? details.review : null;
  const error = isCurrentReview ? details.error : null;

  return (
    <section className="review-details">
      <header className="review-details-header">
        <h2>Review Details</h2>
        <button type="button" className="back-to-list" onClick={onBack}>
          Back to List
        </button>
      </header>

      {loading && <p className="details-message">Loading review details…</p>}
      {!loading && error && <p className="details-message error">{error}</p>}

      {!loading && !error && review && (
        <>
          <div className="review-summary">
            <section className="summary-card">
              <h3>Employee</h3>
              <p>{review.employee_code} - {review.employee_name}</p>
            </section>
            <section className="summary-card">
              <h3>Review Period</h3>
              <p>{review.period_name}</p>
            </section>
            <section className="summary-card overall-rating">
              <h3>Overall Rating</h3>
              <p><strong>{review.average_rating.toFixed(1)}</strong> / 5</p>
            </section>
          </div>

          <section className="criteria-section">
            <h3>Performance Criteria</h3>
            <div className="criteria-table-wrapper">
              <table className="criteria-table">
                <thead>
                  <tr>
                    <th scope="col">Criteria</th>
                    <th scope="col">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {CRITERIA.map(({ label, key }) => (
                    <tr key={key}>
                      <td>{label}</td>
                      <td><RatingStars rating={review[key]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="manager-comments">
            <h3>Manager Comments</h3>
            <p>{review.comments?.trim() || 'No manager comments were provided.'}</p>
          </section>
        </>
      )}
    </section>
  );
}
