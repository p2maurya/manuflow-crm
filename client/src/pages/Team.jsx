import { useEffect, useState } from "react";
import { UserPlus, X, TrendingUp, Target, CheckCircle, Users } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../services/api";

const fmt = (n) => {
  if (!n) return "₹0";
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

const EMPTY_FORM = { name: "", email: "", password: "", role: "bda", phone: "", target: "" };

export default function Team() {
  const [team, setTeam] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [teamRes, perfRes] = await Promise.all([
        api.get("/auth/team"),
        api.get("/leads/team-performance"),
      ]);
      setTeam(teamRes.data);
      setPerformance(perfRes.data);
    } catch { toast.error("Failed to load team data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password required");
      return;
    }
    setSaving(true);
    try {
      await api.post("/auth/register", { ...form, target: Number(form.target) || 0 });
      toast.success(`${form.name} added to team`);
      setForm(EMPTY_FORM);
      setShowForm(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally { setSaving(false); }
  };

  const toggleActive = async (id, current) => {
    try {
      await api.put(`/auth/team/${id}`, { isActive: !current });
      setTeam((prev) => prev.map((m) => m._id === id ? { ...m, isActive: !current } : m));
      toast.success(current ? "Member deactivated" : "Member activated");
    } catch { toast.error("Update failed"); }
  };

  // Merge team info with performance data
  const teamWithPerf = team.map((member) => {
    const perf = performance.find((p) => p._id?.toString() === member._id?.toString());
    return { ...member, ...perf };
  });

  const conversionRate = (won, total) => {
    if (!total) return "0%";
    return `${Math.round((won / total) * 100)}%`;
  };

  return (
    <div className="min-h-screen flex bg-stone-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Team Management</h1>
            <p className="text-stone-500 text-sm mt-0.5">{team.length} members</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            <UserPlus size={15} /> Add Member
          </button>
        </div>

        {/* Add Member Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-stone-200 p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">New Team Member</h3>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}>
                <X size={17} className="text-stone-400 hover:text-stone-700" />
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "name", label: "Full Name *", type: "text", placeholder: "Priya Sharma" },
                  { name: "email", label: "Email *", type: "email", placeholder: "priya@company.com" },
                  { name: "password", label: "Password *", type: "password", placeholder: "Min 6 characters" },
                  { name: "phone", label: "Phone", type: "text", placeholder: "+91 98765 43210" },
                  { name: "target", label: "Monthly Target (₹)", type: "number", placeholder: "500000" },
                ].map(({ name, label, type, placeholder }) => (
                  <div key={name}>
                    <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
                    <input
                      type={type}
                      placeholder={placeholder}
                      value={form[name]}
                      onChange={(e) => setForm({ ...form, [name]: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900">
                    <option value="bda">BDA</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={saving}
                  className="bg-stone-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-stone-800 disabled:opacity-60 transition-colors">
                  {saving ? "Adding…" : "Add Member"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="px-5 py-2 rounded-lg text-sm border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-4 border-stone-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Performance Summary Cards */}
            {performance.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-stone-200 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={15} className="text-stone-400" />
                    <p className="text-sm text-stone-500">Total Team Leads</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">
                    {performance.reduce((a, b) => a + (b.totalLeads || 0), 0)}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-stone-200 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={15} className="text-emerald-500" />
                    <p className="text-sm text-stone-500">Total Won Value</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">
                    {fmt(performance.reduce((a, b) => a + (b.wonValue || 0), 0))}
                  </p>
                </div>
                <div className="bg-white rounded-xl border border-stone-200 p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={15} className="text-amber-500" />
                    <p className="text-sm text-stone-500">Total Pipeline</p>
                  </div>
                  <p className="text-2xl font-bold text-stone-900">
                    {fmt(performance.reduce((a, b) => a + (b.totalValue || 0), 0))}
                  </p>
                </div>
              </div>
            )}

            {/* Team Table */}
            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-900">Team Performance</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-stone-50 border-b border-stone-200">
                  <tr>
                    {["Member", "Role", "Total Leads", "Won", "Lost", "Conversion", "Won Value", "Pipeline", "Status"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {teamWithPerf.map((member) => (
                    <tr key={member._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-900 flex items-center justify-center text-xs font-bold uppercase">
                            {member.name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{member.name}</p>
                            <p className="text-xs text-stone-400">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          member.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-stone-100 text-stone-600"
                        }`}>
                          {member.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-stone-900">{member.totalLeads || 0}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">{member.wonLeads || 0}</td>
                      <td className="px-4 py-3 text-red-500 font-medium">{member.lostLeads || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-stone-100 rounded-full h-1.5 w-16">
                            <div
                              className="bg-emerald-500 h-1.5 rounded-full"
                              style={{ width: conversionRate(member.wonLeads, member.totalLeads) }}
                            />
                          </div>
                          <span className="text-xs font-medium text-stone-600">
                            {conversionRate(member.wonLeads, member.totalLeads)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-stone-900">{fmt(member.wonValue)}</td>
                      <td className="px-4 py-3 text-stone-600">{fmt(member.totalValue)}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(member._id, member.isActive)}
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                            member.isActive
                              ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                              : "bg-red-100 text-red-600 hover:bg-green-100 hover:text-green-700"
                          }`}
                        >
                          {member.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
