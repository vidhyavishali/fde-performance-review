import { useState } from "react";
import SideNav from "./components/navigation/SideNav";
import ReviewListPage from "./components/review_list/reviewListPage";
import EmployeeListPage from "./components/employee/EmployeeListPage";
import ReviewDetailsPage from "./components/review_details/ReviewDetailsPage";
import "./AppLayout.css";
import Dashboard from "./components/dashboard/Dashboard";
import ReviewFormPage from "./components/review_form/ReviewFormPage";
import { ReviewPeriodPage } from "./components/review_period/ReviewPeriodPage";


export default function App() {
  const [page, setPage] = useState("employees");
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  return (
    <div className="app-layout">
      <SideNav page={page === "review-details" ? "reviews" : page} setPage={setPage} />

      <main className="app-content">
        {page === "dashboard" && <h2 className="page-placeholder">Dashboard</h2>}
        {page === "reviews" && (
          <ReviewListPage
            onViewReview={(reviewId) => {
              setSelectedReviewId(reviewId);
              setPage("review-details");
            }}
          />
        )}
        {page === "review-details" && selectedReviewId !== null && (
          <ReviewDetailsPage
            reviewId={selectedReviewId}
            onBack={() => setPage("reviews")}
          />
        )}
        {page === "employees" && <EmployeeListPage />}
        {page === "review-periods" && <ReviewPeriodPage />}
        {page === "submit-review" && <ReviewFormPage />}
        {page === "settings" && <h2 className="page-placeholder">Settings</h2>}
        {page === "logout" && <h2 className="page-placeholder">Logout</h2>}
      </main>
    </div>
  );
}
