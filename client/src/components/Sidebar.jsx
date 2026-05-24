import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, UserCheck, LogOut, Factory } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/leads", label: "Leads", icon: Users },
    ...(user?.role === "admin" ? [{ to: "/team", label: "Team", icon: UserCheck }] : []),
  ];

  return (
    <aside className="w-56 min-h-screen bg-stone-900 text-white flex flex-col shrink-0">
      <div className="px-5 py-5 border-b border-stone-700">
        <div className="flex items-center gap-2">
          <Factory size={20} className="text-amber-400" />
          <span className="font-bold text-lg tracking-tight">ManuFlow</span>
        </div>
        <p className="text-stone-400 text-xs mt-0.5">CRM System</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-amber-400 text-stone-900 font-semibold"
                  : "text-stone-300 hover:bg-stone-800 hover:text-white"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-stone-700">
        <div className="flex items-center gap-2 px-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center text-xs font-bold uppercase">
            {user?.name?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-stone-400 uppercase tracking-wide">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-stone-400 hover:bg-red-900 hover:text-red-200 transition-colors"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  );
}
