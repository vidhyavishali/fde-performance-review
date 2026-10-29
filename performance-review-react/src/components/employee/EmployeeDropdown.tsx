import type Employee from '../../interfaces/Employee';
import { useState, useEffect } from 'react'; 

interface EmployeeDropdownProps {
  value: number | "";
  onChange: (employeeId: number |"") => void;
  placeholder?: string; // NEW: optional placeholder prop
  onlyActive?: boolean; // true = hide Inactive employees
}

export default function EmployeeDropdown({
  value,
  onChange,
  placeholder = "Select Employee",
  onlyActive = false,
}: EmployeeDropdownProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/employees")
      .then((res) => {
        // Treat 4xx/5xx answers (e.g. 503 database down) as errors
        if (!res.ok) throw new Error(`Server responded ${res.status}`);
        return res.json();
      })
      .then((data) => { console.log(data); setEmployees(data.employees ?? []); })
      .catch(() => setEmployees([]));   // keep an empty list so .map below never sees undefined
  }, []);

  // Only keep Active employees when asked to; otherwise show everyone
  const visibleEmployees = onlyActive
    ? employees.filter((employee) => employee.status.toUpperCase() === "ACTIVE")
    : employees;

  return (
    <select
      value={value}
      onChange={(e) =>     onChange(e.target.value === "" ? "" : Number(e.target.value))}
    >
      <option value="">{placeholder}</option>

      {visibleEmployees.map((employee) => (
        <option key={employee.id} value={employee.id}>
          {employee.employee_id} - {employee.name}
        </option>
      ))}
    </select>
  );
}
