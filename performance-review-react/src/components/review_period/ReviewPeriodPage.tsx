import React, { useState, useEffect } from "react";
import type {ReviewPeriod} from "../../interfaces/ReviewPeriod";
import "./ReviewPeriod.css";


export function ReviewPeriodPage() {


const [review_Periods, setReviewPeriods] = useState<ReviewPeriod[]>([]);

useEffect(() => {
  fetch("http://localhost:8000/api/review-periods")
    .then((response) => response.json())
    .then((data) => {
    const reviewPeriodList = Array.isArray(data) // always use this method in receiving details. as each api sends data differently. either as a list or as 1 data with multiple json
        ? data
        : data.review_periods || data.items || []; 

    setReviewPeriods(reviewPeriodList);
  })
  }, []);


  const handleStatusChange = async (period: ReviewPeriod) => {

    const newStatus =
        period.status === "Open"
            ? "Closed"
            : "Open";

    try {

        const response = await fetch(
            `http://localhost:8000/api/review-periods/${period.id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...period,
                    status: newStatus
                }),
            }
        );

        if (!response.ok) {
            throw new Error("Failed to update review period");
        }

   setReviewPeriods((prev) =>
    prev.map((p) => ({
        ...p,
        status:
            p.id === period.id
                ? "Open"
                : "Closed"
    }))
);

    } catch (err) {
        console.error(err);
    }
};

const sortedPeriods = [...review_Periods].sort((a, b) => {
    if (a.status === "Open") return -1;
    if (b.status === "Open") return 1;
    return 0;
});

  return (

    <>
    <div className="review-period-header">
    <h2 className="review-period-title">Review Periods</h2> 
    </div>
   <div className="review-period-grid">

  {sortedPeriods.map((period) => (
 <div
    key={period.id}
    className={`review-period-tile ${
      period.status === "Open"
        ? "active-period"
        : ""
    }`}
  >


      <div className="review-period-header">
        <h3>{period.name}</h3>

        <span
          className={`period-status ${period.status.toLowerCase()}`}
        >
          {period.status}
        </span>
      </div>

      <p>
        Start: {period.start_date}
      </p>

      <p>
        End: {period.end_date}
      </p>

    {period.status !== "Open" && (
      <button
        className="make-active-btn"
        onClick={() => handleStatusChange(period)}
      >
        Make Active
      </button>
    )}
    </div>
  ))}

</div>
</>
  );
}