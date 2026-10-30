import "./Dashboard.css";
import { useState, useEffect } from "react";
import type {Employee} from "../../interfaces/Employee";
import type {ReviewPeriod} from "../../interfaces/ReviewPeriod";
import type {Review} from "../../interfaces/Review";

export default function Dashboard() {

  // Step 1 : Always use state for api variables - this ensures that the component re-renders when the data changes
 const [employees, setEmployees] = useState<Employee[]>([]);
const [reviewPeriods, setReviewPeriods] = useState<ReviewPeriod[]>([]);
const [reviews, setReviews] = useState<Review[]>([]);

 // Step 2 : Fetch employee data from the API using useEffect and update the state
  useEffect(() => {
    fetch("http://localhost:8000/api/employees")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
      })
      .then((data) => {
    const employeeList = Array.isArray(data) // always use this method in receiving details. as each api sends data differently. either as a list or as 1 data with multiple json
        ? data
        : data.employees || data.items || []; 

    setEmployees(employeeList);
  })
  }, []);

  const activeEmployees = employees.filter(emp => emp.status.toLowerCase() === "active");

  useEffect(() => {
    // Replace with your API call
    fetch("http://localhost:8000/api/review-periods")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch review periods");
        return res.json();
      })
      .then((data) => {
    const reviewPeriodList = Array.isArray(data) // always use this method in receiving details. as each api sends data differently. either as a list or as 1 data with multiple json
        ? data
        : data.review_periods || data.items || []; 
    setReviewPeriods(reviewPeriodList);
  })
  }, []);

  const activeReviewPeriod = reviewPeriods.find(period => period.status.toLowerCase() === "open");


/*http://localhost:8000/api/reviews?period_id=8 */
  useEffect(() => {
    if (!activeReviewPeriod) return;
    fetch(`http://localhost:8000/api/reviews?period_id=${activeReviewPeriod.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch reviews");
        return res.json();
      })
      .then((data) => {
        const reviewList = Array.isArray(data)
          ? data
          : data.reviews || data.items || [];
        setReviews(reviewList);
      });
  }, [activeReviewPeriod]);



  /* Get recent review details from reviews and employees */  
  const recentReviews = reviews.slice(0, 5).map((review) => {
    const employee = employees.find((emp) => emp.id === review.employee_id);
    return {
      ...review,
      employeeName: employee ? employee.name : "Unknown",
    };
  });

  const submittedEmployeeIds = reviews.map((review) => review.employee_id);
  const pendingEmployees : Employee[]  = activeEmployees.filter(emp => !submittedEmployeeIds.includes(emp.id));

const totalEmployees = employees.length;

const submittedReviews = reviews.length;

const completionPercentage =
    totalEmployees === 0
        ? 0
        : Math.round(
              (submittedReviews / totalEmployees) * 100
          );

  //step 3: Consume the return data inside the return component as needed.

  return (
    <section className="dashboard-page">
      <p className="dashboard-kicker">PERFORMANCE MANAGEMENT</p>
      <h1 className="dashboard-title">Dashboard</h1>
      <p className="dashboard-subtitle">
        Performance review overview and employee activity.
      </p>

      {/* KPI Cards */}
      <div className="dashboard-stats">
        <div className="dashboard-card stat-card">
          <p className="stat-label">Total Employees</p>
          <h2 className="stat-value">{employees.length}</h2>
        </div>

        
            <div className="dashboard-card stat-card">
          <p className="stat-label">Active Employees</p>
          <h2 className="stat-value">{activeEmployees.length}</h2>
        </div>

        <div className="dashboard-card stat-card">
          <p className="stat-label">Reviews Submitted</p>
          <h2 className="stat-value">{reviews.length}</h2>
        </div>

        <div className="dashboard-card stat-card">
          <p className="stat-label">Pending Reviews</p>
          <h2 className="stat-value">{pendingEmployees.length}</h2>
        </div>

        <div className="dashboard-card stat-card">
          <p className="stat-label">Active Review Period</p>
          <h2 className="stat-value">{activeReviewPeriod?.name || "N/A"}</h2>
        </div>

      </div>

      {/* Middle Section */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Review Completion Progress</h3>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <p className="progress-text">
            {submittedReviews} of {totalEmployees} reviews submitted
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Current Review Period</h3>

          <div className="period-info">
            <p><strong>Period:</strong> {activeReviewPeriod?.name || "N/A"}</p>
            <p><strong>Start:</strong> {activeReviewPeriod?.start_date || "N/A"}</p>
            <p><strong>End:</strong> {activeReviewPeriod?.end_date || "N/A"}</p>
            <p><strong>Status:</strong> {activeReviewPeriod?.status || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Recent Reviews</h3>

          <ul className="dashboard-list">
            {recentReviews.map((review) => (
              <li key={review.id}>{review.employee_name} - Submitted</li>
            ))}
          </ul>
        </div>

        <div className="dashboard-card">
          <h3>Awaiting Reviews</h3>

          <ul className="dashboard-list">
            {pendingEmployees.map((emp) => (
              <li key={emp.id}>{emp.employee_id} - {emp.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}