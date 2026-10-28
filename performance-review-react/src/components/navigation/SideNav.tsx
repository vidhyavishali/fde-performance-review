import "./SideNav.css";

type SideNavProps = {
  page: string;
  setPage: (page: string) => void;
};

const menuItems = [
  { key: "dashboard", label: "🏠 Dashboard" },
  { key: "employees", label: "👥 Employees" },
  { key: "review-periods", label: "📋 Review Periods" },
  { key: "reviews", label: "📝 Reviews" },
  { key: "reports", label: "📊 Reports" },
  { key: "submit-review", label: "➕ Submit Review" },
];

const utilityItems = [
  { key: "settings", label: "⚙️ Settings" },
  { key: "logout", label: "↪ Logout" },
];

export default function SideNav({ page, setPage }: SideNavProps) {
  return (
    <div className="sidenav">
      <h2 className="sidenav-title">
        Performance Reviews
      </h2>

      <div className="sidenav-main">
        {menuItems.map((item) => (
          <button
            key={item.key}
            className={page === item.key ? "menu-item active" : "menu-item"}
            onClick={() => setPage(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="sidenav-footer">
        {utilityItems.map((item) => (
          <button
            key={item.key}
            className={page === item.key ? "menu-item active" : "menu-item"}
            onClick={() => setPage(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
