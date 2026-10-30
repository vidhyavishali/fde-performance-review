import type Review from '../../interfaces/Review';
import StatusBadge from './StatusBadge';

interface ReviewTableProps {
  reviews: Review[];
  onViewReview: (reviewId: number) => void;
}

export default function ReviewTable({ reviews, onViewReview }: ReviewTableProps) {
  return (
    <div className="review-table-wrapper">
      <table className="review-table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Employee Name</th>
            <th>Period</th>
            <th className="center">Ratings</th>
            <th className="center">Average</th>
            <th className="center">Status</th>
            <th className="center">Action</th>
          </tr>
        </thead>

        <tbody>
          {reviews.map((review) => (
            <tr key={review.id}>
              <td>{review.employee_code}</td>
              <td>{review.employee_name}</td>
              <td>{review.period_name}</td>
              <td className="center">
                {review.quality_rating}, {review.delivery_rating}, {review.teamwork_rating}
              </td>
              <td className="center">{review.average_rating.toFixed(1)}</td>
              <td className="center">
                <StatusBadge status={review.status} />
              </td>
              <td className="center">
                <button className="view-button" onClick={() => onViewReview(review.id)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
