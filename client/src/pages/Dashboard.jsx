import { useEffect, useState } from "react";
import { Users, TrendingUp, CheckCircle, AlertTriangle, IndianRupee, Clock } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const fmt = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/leads/stats")
      .then((r) => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Leads", value: stats?.total ?? "—", icon: Users, color: "bg-stone-900 text-white" },
    { label: "Pipeline Value", value: stats ? fmt(stats.pipeline) : "—", icon: IndianRupee, color: "bg-amber-400 text-stone-900" },
    { label: "Won Value", value: stats ? fmt(stats.won) : "—", icon: CheckCircle, color: "bg-emerald-500 text-white" },
    { label: "Overdue Follow-ups", value: stats?.overdueFollowUps ?? "—", icon: Clock, color: "bg-red-500 text-white" },
  ];

  const statusCards = ["New", "Contacted", "Negotiation", "Won", "Lost"];

  return (
    <div className="min-h-screen flex bg-stone-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {user?.role === "admin" ? "Team overview" : `Your pipeline, ${user?.name}`}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-stone-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Main stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {cards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className={`rounded-xl p-5 ${color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium opacity-80">{label}</p>
                    <Icon size={18} className="opacity-70" />
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                </div>
              ))}
            </div>

            {/* Status breakdown */}
            <div className="grid grid-cols-5 gap-3 mb-6">
              {statusCards.map((s) => (
                <div key={s} className="bg-white rounded-xl p-4 border border-stone-200">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[s]}`}>{s}</span>
                  <p className="text-2xl font-bold text-stone-900 mt-2">{stats?.byStatus?.[s]?.count ?? 0}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{fmt(stats?.byStatus?.[s]?.value ?? 0)}</p>
                </div>
              ))}
            </div>

            {/* Recent leads */}
            <div className="bg-white rounded-xl border border-stone-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-900">Recent Leads</h2>
                <Link to="/leads" className="text-xs text-stone-500 hover:text-stone-900 font-medium">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-stone-100">
                {stats?.recentLeads?.length === 0 && (
                  <p className="text-center text-stone-400 text-sm py-8">No leads yet. Add your first lead!</p>
                )}
                {stats?.recentLeads?.map((lead) => (
                  <Link key={lead._id} to={`/leads/${lead._id}`}
                    className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors">
                    <div>
                      <p className="font-medium text-stone-900 text-sm">{lead.companyName}</p>
                      <p className="text-xs text-stone-400">{lead.assignedToName || "Unassigned"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                      <p className="text-xs text-stone-500 mt-1">{fmt(lead.dealValue || 0)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
