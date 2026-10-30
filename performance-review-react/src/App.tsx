import { useState } from "react";
import SideNav from "./components/navigation/SideNav";
import ReviewListPage from "./components/review_list/reviewListPage";
import EmployeeListPage from "./components/employee/EmployeeListPage";
import "./AppLayout.css";
import Dashboard from "./components/dashboard/Dashboard";
import ReviewFormPage from "./components/review_form/ReviewFormPage";
import { ReviewPeriodPage } from "./components/review_period/ReviewPeriodPage";


export default function App() {
  const [page, setPage] = useState("employees");

  return (
    <div className="app-layout">
      <SideNav page={page} setPage={setPage} />

      <main className="app-content">
        {page === "dashboard" && <Dashboard />}
        {page === "reviews" && <ReviewListPage />}
        {page === "employees" && <EmployeeListPage />}
        {page === "review-periods" && <ReviewPeriodPage />}
        {page === "submit-review" && <ReviewFormPage />}
        {page === "settings" && <h2 className="page-placeholder">Settings</h2>}
        {page === "logout" && <h2 className="page-placeholder">Logout</h2>}
      </main>
    </div>
  );
}