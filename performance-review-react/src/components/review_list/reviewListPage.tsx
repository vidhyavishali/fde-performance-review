import { useState, useEffect } from 'react';
import type Review from '../../interfaces/Review';
import EmployeeDropdown from '../employee/EmployeeDropdown';
import ReviewPeriodDropdown from '../review_period/ReviewPeriodDropdown';
import Pagination from '../pagination/Pagination';
import ReviewTable from './ReviewTable';
import './ReviewList.css';

const PAGE_SIZE = 5;   // rows per page, as in the mockup

interface ReviewListPageProps {
  onViewReview: (reviewId: number) => void;
}

// One place that knows how to call the reviews API.
// It sits outside the component because it doesn't need any state;
// it just takes the filters and returns the reviews.
function fetchReviews(periodId: number | "", employeeId: number | ""): Promise<Review[]> {
  const params = new URLSearchParams();
  if (periodId !== "") params.append("period_id", String(periodId));
  if (employeeId !== "") params.append("employee_id", String(employeeId));

  return fetch(`http://localhost:8000/api/reviews?${params}`)
    .then(async (res) => {
      // Treat 4xx/5xx answers (e.g. 503 database down) as errors.
      // The API sends { code, message } on errors, so show its message.
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Server responded ${res.status}`);
      }
      return res.json();
    })
    .catch((err) => {
      // fetch itself rejects with a TypeError when the server can't be reached
      if (err instanceof TypeError) {
        throw new Error("Cannot reach the server. Check your connection and try again.");
      }
      throw err;   // API errors from above pass through unchanged
    });
}

export default function ReviewListPage({ onViewReview }: ReviewListPageProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [periodId, setPeriodId] = useState<number | "">("");
  const [employeeId, setEmployeeId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);              // true = a request is in progress
  const [error, setError] = useState<string | null>(null);   // null = no error
  const [currentPage, setCurrentPage] = useState(1);         // pages start at 1

  // First load: all reviews, no filters
  useEffect(() => {
    fetchReviews("", "")
      .then(setReviews)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Runs when the Search button is clicked
  function handleSearch() {
    setLoading(true);
    setError(null);
    setCurrentPage(1);   // new results start at page 1
    fetchReviews(periodId, employeeId)
      .then(setReviews)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }

  // Derived values, calculated fresh on every render
  const totalPages = Math.ceil(reviews.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageReviews = reviews.slice(startIndex, startIndex + PAGE_SIZE);
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="review-list">
      <h2>Performance Reviews</h2>

      {/* Filter bar */}
      <div className="review-filters">
        <label className="filter-field">
          Review Period
          <ReviewPeriodDropdown
            value={periodId}
            onChange={setPeriodId}
            placeholder="All Periods"
            onlyOpen={false}
          />
        </label>
        <label className="filter-field">
          Employee
          <EmployeeDropdown
            value={employeeId}
            onChange={setEmployeeId}
            placeholder="All Employees"
          />
        </label>
        <button className="search-button" onClick={handleSearch} disabled={loading}>
          Search
        </button>
      </div>

      {/* Exactly one of these four blocks is shown */}
      {loading && <p className="review-message">Loading reviews…</p>}

      {!loading && error && <p className="review-message error">{error}</p>}

      {!loading && !error && reviews.length === 0 && (
        <p className="review-message">No reviews found.</p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <>
          <ReviewTable reviews={pageReviews} onViewReview={onViewReview} />

          <div className="review-list-footer">
            <p>
              Showing {startIndex + 1} to {startIndex + pageReviews.length} of {reviews.length} reviews
            </p>
            <Pagination
              currentPage={currentPage}
              hasNextPage={hasNextPage}
              onPageChange={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </>
      )}
    </div>
  );
}
