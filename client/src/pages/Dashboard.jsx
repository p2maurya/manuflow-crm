import { useEffect, useState } from "react";
import { Users, TrendingUp, CheckCircle, XCircle, AlertCircle, Phone } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-3xl font-bold mt-0.5">{value ?? "—"}</p>
    </div>
  </div>
);

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/leads/stats")
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Total Leads", value: stats?.total, icon: Users, color: "bg-blue-500" },
    { label: "New", value: stats?.new, icon: AlertCircle, color: "bg-indigo-500" },
    { label: "Contacted", value: stats?.contacted, icon: Phone, color: "bg-yellow-500" },
    { label: "Negotiation", value: stats?.negotiation, icon: TrendingUp, color: "bg-orange-500" },
    { label: "Won", value: stats?.won, icon: CheckCircle, color: "bg-green-500" },
    { label: "Lost", value: stats?.lost, icon: XCircle, color: "bg-red-500" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back, {user?.name}. Here's what's happening.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card) => (
              <StatCard key={card.label} {...card} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
