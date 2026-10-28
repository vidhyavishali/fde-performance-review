import { useEffect, useState } from "react";
import type Employee from '../../interfaces/Employee';
import './EmployeeList.css';

const DEFAULT_EMPLOYEE_IDS = ["EMP101", "EMP102", "EMP103", "EMP104"];
const AVATAR_COLORS = ["avatar-blue", "avatar-orange", "avatar-purple", "avatar-green", "avatar-yellow", "avatar-cyan", "avatar-rose"];

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/api/employees")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch employees");
        return res.json();
      })
      .then((data) => {
        setEmployees(data.employees ?? data);
      })
      .catch((err) => {
        setError(err.message || "Error fetching employees");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading employees...</p>;
  if (error) return <p>{error}</p>;

  const defaultEmployees = employees.filter((emp) =>
    DEFAULT_EMPLOYEE_IDS.includes(emp.employee_id)
  );

  const searchableEmployees = employees.filter(
    (emp) => !DEFAULT_EMPLOYEE_IDS.includes(emp.employee_id)
  );

  const displayedEmployees = selectedEmployee ? [selectedEmployee] : defaultEmployees;
  const teamMembersText = `${displayedEmployees.length} team ${displayedEmployees.length === 1 ? "member" : "members"}`;

  const suggestionEmployees = searchableEmployees
    .filter((emp) => {
      const query = searchTerm.trim().toLowerCase();
      if (!query) return false;
      return (
        emp.employee_id.toLowerCase().includes(query) ||
        emp.name.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query)
      );
    })
    .slice(0, 8);

  const findMatchingEmployee = (rawQuery: string) => {
    const query = rawQuery.trim().toLowerCase();
    if (!query) return;

    return searchableEmployees.find((emp) => {
      return (
        emp.employee_id.toLowerCase() === query ||
        emp.name.toLowerCase() === query ||
        `${emp.employee_id} - ${emp.name}`.toLowerCase() === query
      );
    });
  };

  const setSelectedEmployeeFromSearch = (employee: Employee | undefined) => {
    if (!employee) return;
    setSelectedEmployee(employee);
    setSearchTerm(`${employee.employee_id} - ${employee.name}`);
    setIsSearchFocused(false);
  };

  const handleAddEmployee = () => {
    const matchedEmployee = findMatchingEmployee(searchTerm);
    setSelectedEmployeeFromSearch(matchedEmployee);
    if (matchedEmployee) {
      setSearchTerm("");
    }
  };

  const getInitial = (name: string) => name.trim().charAt(0).toUpperCase();

  return (
    <section className="employees-page">
      <p className="employees-kicker">YOUR ORGANISATION</p>
      <h1 className="employees-title">Employees</h1>
      <p className="employees-subtitle">Browse employee profiles and review status.</p>

      <div className="employees-shell">
        <div className="employees-toolbar">
          <strong className="employees-count">{teamMembersText}</strong>

          <div className="employees-search-wrap">
            <span className="employees-search-icon" aria-hidden="true">⌕</span>
            <input
              className="employees-search"
              type="text"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                if (!value.trim()) {
                  setSelectedEmployee(null);
                  return;
                }
                const matchedEmployee = findMatchingEmployee(value);
                if (matchedEmployee) {
                  setSelectedEmployeeFromSearch(matchedEmployee);
                }
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                window.setTimeout(() => {
                  setIsSearchFocused(false);
                }, 120);
              }}
              placeholder="Search by name, ID or department"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (suggestionEmployees.length > 0) {
                    setSelectedEmployeeFromSearch(suggestionEmployees[0]);
                    return;
                  }
                  handleAddEmployee();
                }
              }}
            />

            {isSearchFocused && suggestionEmployees.length > 0 && (
              <div className="employees-search-dropdown">
                {suggestionEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    className="employees-search-option"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => setSelectedEmployeeFromSearch(emp)}
                  >
                    <span className="employees-search-option-main">{emp.employee_id} - {emp.name}</span>
                    <span className="employees-search-option-sub">{emp.department}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="employee-cards-grid">
          {displayedEmployees.map((emp, index) => (
            <article key={emp.id} className="employee-card">
              <div className="employee-card-left">
                <div className={`employee-avatar ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}>
                  {getInitial(emp.name)}
                </div>

                <div className="employee-meta">
                  <div className="employee-name">{emp.name}</div>
                  <div className="employee-id">{emp.employee_id}</div>
                  <div className="employee-dept">{emp.department}</div>
                  <div className="employee-email">{emp.email}</div>
                </div>
              </div>

              <div className="employee-card-right">
                <span className="employee-status">{emp.status}</span>
                <span className="employee-chevron" aria-hidden="true">›</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}