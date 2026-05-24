import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, X, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const STATUS_OPTIONS = ["New", "Contacted", "Negotiation", "Won", "Lost"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const SOURCE_OPTIONS = ["cold-call", "referral", "website", "exhibition", "linkedin", "other"];

const STATUS_COLORS = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-yellow-100 text-yellow-700",
  Negotiation: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

const PRIORITY_COLORS = {
  Low: "text-stone-400",
  Medium: "text-amber-500",
  High: "text-red-500",
};

const EMPTY = {
  companyName: "", contactPerson: "", email: "", phone: "",
  industry: "", source: "other", priority: "Medium",
  dealValue: "", nextFollowUp: "", product: "", notes: "",
};

const fmt = (n) => {
  if (!n) return "—";
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${n}`;
};

export default function Leads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [team, setTeam] = useState([]);

  const fetchLeads = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "All") params.status = statusFilter;
      const res = await api.get("/leads", { params });
      setLeads(res.data);
    } catch { toast.error("Failed to load leads"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, [search, statusFilter]);

  useEffect(() => {
    if (user?.role === "admin") {
      api.get("/auth/team").then((r) => setTeam(r.data)).catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName.trim()) { toast.error("Company name required"); return; }
    setSaving(true);
    try {
      const payload = { ...form, dealValue: Number(form.dealValue) || 0 };
      // If admin assigns to someone from team
      if (form.assignedTo) {
        const member = team.find((t) => t._id === form.assignedTo);
        if (member) payload.assignedToName = member.name;
      }
      await api.post("/leads", payload);
      toast.success("Lead created!");
      setForm(EMPTY);
      setShowForm(false);
      fetchLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create lead");
    } finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/leads/${id}`, { status });
      setLeads((prev) => prev.map((l) => l._id === id ? { ...l, status } : l));
      toast.success("Status updated");
    } catch { toast.error("Update failed"); }
  };

  const deleteLead = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try {
      await api.delete(`/leads/${id}`);
      setLeads((prev) => prev.filter((l) => l._id !== id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="min-h-screen flex bg-stone-100">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Lead Pipeline</h1>
            <p className="text-stone-500 text-sm mt-0.5">{leads.length} leads</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-stone-800 transition-colors"
          >
            <Plus size={15} /> Add Lead
          </button>
        </div>

        {/* Add Lead Form */}
        {showForm && (
          <div className="bg-white rounded-xl border border-stone-200 p-5 mb-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-stone-900">New Lead</h3>
              <button onClick={() => { setShowForm(false); setForm(EMPTY); }}>
                <X size={17} className="text-stone-400 hover:text-stone-700" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { name: "companyName", label: "Company Name *", type: "text", placeholder: "Tata Motors Ltd." },
                  { name: "contactPerson", label: "Contact Person", type: "text", placeholder: "Rahul Sharma" },
                  { name: "email", label: "Email", type: "email", placeholder: "rahul@company.com" },
                  { name: "phone", label: "Phone", type: "text", placeholder: "+91 98765 43210" },
                  { name: "industry", label: "Industry", type: "text", placeholder: "Automotive" },
                  { name: "product", label: "Product / Requirement", type: "text", placeholder: "Industrial pumps" },
                  { name: "dealValue", label: "Deal Value (₹)", type: "number", placeholder: "500000" },
                  { name: "nextFollowUp", label: "Next Follow-up", type: "date" },
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
                  <label className="block text-xs font-medium text-stone-600 mb-1">Source</label>
                  <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900">
                    {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-600 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900">
                    {PRIORITY_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>

                {user?.role === "admin" && team.length > 0 && (
                  <div>
                    <label className="block text-xs font-medium text-stone-600 mb-1">Assign To</label>
                    <select value={form.assignedTo || ""} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                      className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900">
                      <option value="">Assign to myself</option>
                      {team.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="col-span-2 md:col-span-3">
                  <label className="block text-xs font-medium text-stone-600 mb-1">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any additional context..."
                    rows={2}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button type="submit" disabled={saving}
                  className="bg-stone-900 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-stone-800 disabled:opacity-60 transition-colors">
                  {saving ? "Saving…" : "Save Lead"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setForm(EMPTY); }}
                  className="px-5 py-2 rounded-lg text-sm border border-stone-300 text-stone-600 hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search company, contact, product…"
              className="w-full pl-8 pr-3 py-2 border border-stone-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-stone-900"
            />
          </div>
          <div className="flex gap-1.5">
            {["All", ...STATUS_OPTIONS].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  statusFilter === s ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-300 hover:border-stone-500"
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-7 h-7 border-4 border-stone-800 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400">
              <Search size={36} className="mb-2 opacity-30" />
              <p className="text-sm">No leads found</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  {["Company", "Contact", "Product", "Deal Value", "Priority", "Status", "Assigned To", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-stone-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/leads/${lead._id}`} className="font-semibold text-stone-900 hover:underline">
                        {lead.companyName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-stone-600">{lead.contactPerson || "—"}</td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{lead.product || "—"}</td>
                    <td className="px-4 py-3 font-medium text-stone-800">{fmt(lead.dealValue)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${PRIORITY_COLORS[lead.priority]}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select value={lead.status} onChange={(e) => updateStatus(lead._id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded-full cursor-pointer border-0 focus:outline-none ${STATUS_COLORS[lead.status]}`}>
                        {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-stone-500 text-xs">{lead.assignedToName || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link to={`/leads/${lead._id}`} className="text-stone-400 hover:text-stone-700">
                          <ChevronRight size={15} />
                        </Link>
                        {user?.role === "admin" && (
                          <button onClick={() => deleteLead(lead._id)} className="text-stone-300 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
