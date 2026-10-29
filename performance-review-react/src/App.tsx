import { useState } from "react";
import SideNav from "./components/navigation/SideNav";
import ReviewListPage from "./components/review_list/reviewListPage";
import EmployeeListPage from "./components/employee/EmployeeListPage";
import "./AppLayout.css";

export default function App() {
  const [page, setPage] = useState("employees");

  return (
    <div className="app-layout">
      <SideNav page={page} setPage={setPage} />

      <main className="app-content">
        {page === "dashboard" && <h2 className="page-placeholder">Dashboard</h2>}
        {page === "reviews" && <ReviewListPage />}
        {page === "employees" && <EmployeeListPage />}
        {page === "review-periods" && <h2 className="page-placeholder">Review Periods</h2>}
        {page === "reports" && <h2 className="page-placeholder">Reports</h2>}
        {page === "submit-review" && <h2 className="page-placeholder">Submit Review</h2>}
        {page === "settings" && <h2 className="page-placeholder">Settings</h2>}
        {page === "logout" && <h2 className="page-placeholder">Logout</h2>}
      </main>
    </div>
  );
}